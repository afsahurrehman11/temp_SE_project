from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from collections import Counter

from app.database import get_db
from app.models import User, Job, Resume, Match, Skill
from app.schemas import DashboardStats, SkillDistribution, MatchesAnalytics, AnalyticsResponse
from app.auth import get_optional_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get dashboard statistics filtered by current user"""
    
    if not current_user:
        # Return empty stats for non-authenticated users
        return DashboardStats(
            total_jobs=0,
            total_resumes=0,
            total_matches=0,
            avg_match_score=0.0,
            pending_reviews=0,
            shortlisted=0
        )
    
    # Total jobs created by this user
    total_jobs = db.query(Job).filter(Job.user_id == current_user.id).count()
    
    # Total resumes uploaded by this user
    total_resumes = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    
    # Total matches for this user's jobs
    total_matches = db.query(Match).join(Job).filter(Job.user_id == current_user.id).count()
    
    # Average match score for this user's jobs
    avg_score_result = db.query(func.avg(Match.match_score))\
        .join(Job)\
        .filter(Job.user_id == current_user.id)\
        .scalar()
    average_match_score = round(float(avg_score_result or 0), 2)
    
    # Pending reviews (matches with status 'pending') for this user's jobs
    pending_reviews = db.query(Match)\
        .join(Job)\
        .filter(Job.user_id == current_user.id, Match.status == 'pending')\
        .count()
    
    # Shortlisted candidates for this user's jobs
    shortlisted = db.query(Match)\
        .join(Job)\
        .filter(Job.user_id == current_user.id, Match.status == 'shortlisted')\
        .count()
    
    return DashboardStats(
        total_jobs=total_jobs,
        total_resumes=total_resumes,
        total_matches=total_matches,
        avg_match_score=average_match_score,
        pending_reviews=pending_reviews,
        shortlisted=shortlisted
    )


@router.get("/skills", response_model=List[SkillDistribution])
def get_skills_distribution(
    limit: int = 20,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get top skills distribution from user's resumes"""
    
    if not current_user:
        # Return empty list for non-authenticated users
        return []
    
    # Get only resumes uploaded by this user
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    
    # Aggregate all skills from user's resumes
    all_skills = []
    for resume in resumes:
        if resume.extracted_skills:
            all_skills.extend(resume.extracted_skills)
    
    # Count skills
    skill_counts = Counter(all_skills)
    
    # Create distribution
    distribution = []
    for skill, count in skill_counts.most_common(limit):
        distribution.append(SkillDistribution(
            skill=skill,
            count=count,
            category="technical"  # Could be enhanced with skill categorization
        ))
    
    return distribution


@router.get("/matches", response_model=MatchesAnalytics)
def get_matches_analytics(
    job_id: int = None,
    min_score: float = 0,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed match analytics for current user's jobs"""
    
    if not current_user:
        # Return empty analytics for non-authenticated users
        return MatchesAnalytics(
            total_matches=0,
            average_score=0.0,
            high_matches=0,
            medium_matches=0,
            low_matches=0,
            score_distribution={}
        )
    
    # Base query - filter by user's jobs
    query = db.query(Match).join(Job).filter(Job.user_id == current_user.id)
    
    if job_id:
        query = query.filter(Match.job_id == job_id)
    
    if min_score > 0:
        query = query.filter(Match.match_score >= min_score)
    
    matches = query.order_by(desc(Match.match_score)).all()
    
    # Calculate statistics
    total_matches = len(matches)
    
    if total_matches == 0:
        return MatchesAnalytics(
            total_matches=0,
            average_score=0.0,
            high_matches=0,
            medium_matches=0,
            low_matches=0,
            score_distribution={}
        )
    
    scores = [match.match_score for match in matches]
    average_score = round(sum(scores) / len(scores), 2)
    
    # Categorize matches
    high_matches = sum(1 for score in scores if score >= 70)
    medium_matches = sum(1 for score in scores if 40 <= score < 70)
    low_matches = sum(1 for score in scores if score < 40)
    
    # Score distribution (10-point buckets)
    score_distribution = {}
    for i in range(0, 100, 10):
        bucket_key = f"{i}-{i+10}"
        bucket_count = sum(1 for score in scores if i <= score < i+10)
        if bucket_count > 0:
            score_distribution[bucket_key] = bucket_count
    
    return MatchesAnalytics(
        total_matches=total_matches,
        average_score=average_score,
        high_matches=high_matches,
        medium_matches=medium_matches,
        low_matches=low_matches,
        score_distribution=score_distribution
    )


@router.get("/jobs/{job_id}/stats")
def get_job_stats(
    job_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for a specific job"""
    
    # Verify job (and ownership if authenticated)
    if current_user:
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        ).first()
    else:
        job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get matches for this job
    matches = db.query(Match).filter(Match.job_id == job_id).all()
    
    total_applications = len(matches)
    
    if total_applications == 0:
        return {
            "job_id": job_id,
            "job_title": job.title,
            "total_applications": 0,
            "average_score": 0.0,
            "qualified_candidates": 0,
            "top_candidate": None
        }
    
    scores = [match.match_score for match in matches]
    average_score = round(sum(scores) / len(scores), 2)
    qualified_candidates = sum(1 for score in scores if score >= 70)
    
    # Get top candidate
    top_match = max(matches, key=lambda m: m.match_score)
    top_candidate = db.query(Resume).filter(Resume.id == top_match.resume_id).first()
    
    return {
        "job_id": job_id,
        "job_title": job.title,
        "total_applications": total_applications,
        "average_score": average_score,
        "qualified_candidates": qualified_candidates,
        "top_candidate": {
            "resume_id": top_candidate.id,
            "candidate_name": top_candidate.candidate_name,
            "match_score": top_match.match_score,
            "skills": top_candidate.extracted_skills[:10] if top_candidate.extracted_skills else []
        } if top_candidate else None
    }


@router.get("/trends")
def get_trends(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get hiring trends over time"""
    
    # Jobs created by month (filter by user if authenticated)
    if current_user:
        jobs_query = db.query(
            func.date_trunc('month', Job.created_at).label('month'),
            func.count(Job.id).label('count')
        ).filter(Job.user_id == current_user.id)
    else:
        jobs_query = db.query(
            func.date_trunc('month', Job.created_at).label('month'),
            func.count(Job.id).label('count')
        )
    
    jobs_by_month = jobs_query.group_by('month').order_by('month').all()
    
    # Resumes uploaded by month (filter by user if authenticated)
    if current_user:
        resumes_query = db.query(
            func.date_trunc('month', Resume.created_at).label('month'),
            func.count(Resume.id).label('count')
        ).filter(Resume.user_id == current_user.id)
    else:
        resumes_query = db.query(
            func.date_trunc('month', Resume.created_at).label('month'),
            func.count(Resume.id).label('count')
        )
    
    resumes_by_month = resumes_query.group_by('month').order_by('month').all()
    
    return {
        "jobs_by_month": [
            {"month": str(month), "count": count}
            for month, count in jobs_by_month
        ],
        "resumes_by_month": [
            {"month": str(month), "count": count}
            for month, count in resumes_by_month
        ]
    }


@router.get("/export")
def export_analytics(
    format: str = "json",
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Export analytics data"""
    
    if format not in ["json", "csv"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format must be 'json' or 'csv'"
        )
    
    # Get all matches with job and resume details
    matches = db.query(Match).join(Job).filter(Job.user_id == current_user.id).all()
    
    data = []
    for match in matches:
        resume = db.query(Resume).filter(Resume.id == match.resume_id).first()
        job = db.query(Job).filter(Job.id == match.job_id).first()
        
        data.append({
            "job_title": job.title if job else "N/A",
            "candidate_name": resume.candidate_name if resume else "N/A",
            "match_score": match.match_score,
            "date": str(match.created_at),
            "summary": match.summary
        })
    
    if format == "csv":
        # Convert to CSV format
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=["job_title", "candidate_name", "match_score", "date", "summary"])
        writer.writeheader()
        writer.writerows(data)
        
        return {
            "format": "csv",
            "data": output.getvalue()
        }
    
    return {
        "format": "json",
        "data": data
    }
