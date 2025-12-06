from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.database import get_db, SessionLocal
from app.models import User, Job, Match, Resume
from app.schemas import JobCreate, JobUpdate, JobResponse, MatchResponse
from app.auth import get_current_active_user
from app.services.rag_service import rag_service
from app.routers.notifications import create_notification

router = APIRouter(prefix="/jobs", tags=["Jobs"])
logger = logging.getLogger(__name__)


# Job creation has been disabled - jobs must be created manually via database
# @router.post("/") endpoint removed


@router.get("/", response_model=List[JobResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all jobs for current user"""
    query = db.query(Job).filter(Job.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Job.status == status_filter)
    
    jobs = query.offset(skip).limit(limit).all()
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific job"""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return job


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a job"""
    db_job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not db_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Update fields
    update_data = job_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_job, field, value)
    
    db.commit()
    db.refresh(db_job)
    
    return db_job


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a job"""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Delete associated matches first
    db.query(Match).filter(Match.job_id == job_id).delete()
    
    # Delete job
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}


@router.get("/{job_id}/matches", response_model=List[MatchResponse])
def get_job_matches(
    job_id: int,
    skip: int = 0,
    limit: int = 100,
    min_score: Optional[float] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all matches for a specific job"""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    query = db.query(Match).filter(Match.job_id == job_id)
    
    if min_score is not None:
        query = query.filter(Match.match_score >= min_score)
    
    matches = query.order_by(Match.match_score.desc()).offset(skip).limit(limit).all()
    return matches


def analyze_resume_background(job_id: int, resume_id: int, db: Session):
    """Background task to analyze resume match"""
    job = db.query(Job).filter(Job.id == job_id).first()
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    
    if not job or not resume:
        return
    
    # Format requirements for matching
    requirements_text = "\n".join(job.requirements) if job.requirements else ""
    
    # Use RAG service to analyze match
    match_result = rag_service.analyze_resume_match(
        resume.text_content,
        f"{job.title}\n{job.description}\nRequirements:\n{requirements_text}"
    )
    
    match_score = match_result.get("match_score", 0)
    
    # Create or update match
    existing_match = db.query(Match).filter(
        Match.job_id == job_id,
        Match.resume_id == resume_id
    ).first()
    
    if existing_match:
        existing_match.match_score = match_score
        existing_match.skills_match = match_result.get("skills_match", {})
        existing_match.summary = match_result.get("summary", "")
    else:
        match = Match(
            job_id=job_id,
            resume_id=resume_id,
            match_score=match_score,
            skills_match=match_result.get("skills_match", {}),
            summary=match_result.get("summary", "")
        )
        db.add(match)
    
    db.commit()
    
    # Create notification if match score is high (>= 70%)
    if match_score >= 70:
        create_notification(
            db=db,
            user_id=job.user_id,
            title="High Match Found!",
            message=f"Found a {match_score:.0f}% match for {job.title}: {resume.candidate_name or 'Candidate'}",
            notification_type="match",
            link=f"/jobs/{job_id}"
        )


@router.post("/{job_id}/match/{resume_id}", response_model=MatchResponse)
async def match_resume_to_job(
    job_id: int,
    resume_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Match a resume to a job"""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check if match already exists
    existing_match = db.query(Match).filter(
        Match.job_id == job_id,
        Match.resume_id == resume_id
    ).first()
    
    if existing_match:
        return existing_match
    
    # Create placeholder match
    match = Match(
        job_id=job_id,
        resume_id=resume_id,
        match_score=0,
        skills_match={},
        summary="Analyzing..."
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    
    # Schedule background analysis
    background_tasks.add_task(analyze_resume_background, job_id, resume_id, db)
    
    return match


@router.post("/{job_id}/match-all")
async def match_all_resumes(
    job_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Match all available resumes to a job - shows all resumes for demo purposes"""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get all resumes (not filtered by user for demo purposes)
    resumes = db.query(Resume).all()
    
    matched_count = 0
    # Batch processing for better performance
    batch_size = 10
    for i in range(0, len(resumes), batch_size):
        batch = resumes[i:i + batch_size]
        for resume in batch:
            # Check if already matched
            existing = db.query(Match).filter(
                Match.job_id == job_id,
                Match.resume_id == resume.id
            ).first()
            
            if not existing:
                # Create placeholder
                match = Match(
                    job_id=job_id,
                    resume_id=resume.id,
                    match_score=0,
                    skills_match={},
                    summary="Analyzing..."
                )
                db.add(match)
                db.commit()
                
                # Schedule background analysis
                background_tasks.add_task(analyze_resume_background, job_id, resume.id, db)
                matched_count += 1
    
    return {
        "message": f"Started matching {matched_count} resumes",
        "job_id": job_id,
        "total_resumes": len(resumes),
        "new_matches": matched_count
    }
