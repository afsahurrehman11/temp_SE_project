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
    job_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Get top skills distribution from ranked candidates.
    If job_id is provided, gets skills from candidates ranked for that job.
    Otherwise, gets skills from the most recent job's ranked candidates.
    """
    
    if not current_user:
        # Return empty list for non-authenticated users
        return []
    
    # Get the job to analyze
    if not job_id:
        # Get most recent job
        latest_job = db.query(Job)\
            .filter(Job.user_id == current_user.id)\
            .order_by(desc(Job.created_at))\
            .first()
        
        if not latest_job:
            # Fallback to all resumes if no jobs
            resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
            all_skills = []
            for resume in resumes:
                if resume.extracted_skills:
                    all_skills.extend(resume.extracted_skills)
            
            skill_counts = Counter(all_skills)
            distribution = []
            for skill, count in skill_counts.most_common(limit):
                distribution.append(SkillDistribution(
                    skill=skill,
                    count=count,
                    category="general"
                ))
            return distribution
        
        job_id = latest_job.id
    
    # Get ranked candidates (matches) for this job
    matches = db.query(Match)\
        .join(Job)\
        .join(Resume)\
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )\
        .order_by(desc(Match.match_score))\
        .all()
    
    if not matches:
        # No ranked candidates, return empty
        return []
    
    # Aggregate skills from ranked candidates
    all_skills = []
    for match in matches:
        resume = match.resume
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
            category="ranked"  # Indicate these are from ranked candidates
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


@router.get("/ranked-overview")
def get_ranked_overview(
    job_id: Optional[int] = None,
    top_k: int = 50,
    top_n: int = 10,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Get ranked analytics overview with score distribution and keyword matching.
    Handles edge cases and provides helpful error messages.
    """
    from app.services.rag_service import rag_service
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Handle unauthenticated users
    if not current_user:
        return {
            "jobs": [],
            "ranked_resumes": [],
            "score_distribution": [],
            "keyword_matches": [],
            "selected_job": None,
            "message": "Please log in to view analytics"
        }
    
    # Get user's jobs
    jobs = db.query(Job).filter(Job.user_id == current_user.id).all()
    jobs_list = [{"id": j.id, "title": j.title} for j in jobs]
    
    # Edge case: No jobs created yet
    if not jobs:
        return {
            "jobs": [],
            "ranked_resumes": [],
            "score_distribution": [],
            "keyword_matches": [],
            "selected_job": None,
            "message": "No jobs created yet. Create a job to see ranked analytics."
        }
    
    # Default to first job if none specified
    if not job_id:
        job_id = jobs[0].id
        logger.info(f"No job_id specified, defaulting to job {job_id}")
    
    # Get selected job
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        return {
            "jobs": jobs_list,
            "ranked_resumes": [],
            "score_distribution": [],
            "keyword_matches": [],
            "selected_job": None,
            "error": "Job not found"
        }
    
    # Get all resumes
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    
    # Edge case: No resumes uploaded
    if not resumes:
        return {
            "jobs": jobs_list,
            "ranked_resumes": [],
            "score_distribution": [],
            "keyword_matches": [],
            "selected_job": {"id": job.id, "title": job.title},
            "message": "No resumes uploaded yet. Upload resumes to see rankings."
        }
    
    # Check if matches exist for this job
    existing_matches = db.query(Match).filter(Match.job_id == job_id).count()
    if existing_matches == 0:
        logger.warning(f"No matches found for job {job_id}. This shouldn't happen with auto-matching.")
        # Trigger matching in background (fallback)
        return {
            "jobs": jobs_list,
            "ranked_resumes": [],
            "score_distribution": [],
            "keyword_matches": [],
            "selected_job": {"id": job.id, "title": job.title},
            "message": "Matching in progress. Please refresh in a few moments."
        }
    
    # Convert to dict format for RAG service
    resume_dicts = []
    for resume in resumes:
        resume_dicts.append({
            "id": resume.id,
            "candidate_name": resume.candidate_name or "Unknown",
            "text": resume.text_content,
            "skills": resume.extracted_skills or [],
            "metadata": {
                "resume_id": resume.id,
                "candidate_name": resume.candidate_name,
                "file_name": resume.file_name
            }
        })
    
    # Build job description
    requirements_text = "\n".join(job.requirements) if job.requirements else ""
    job_description = f"{job.title}\n{job.description}\nRequirements:\n{requirements_text}"
    
    # Extract keywords from job requirements
    job_keywords = []
    if job.requirements:
        for req in job.requirements:
            words = req.lower().split()
            job_keywords.extend([w for w in words if len(w) > 3])
    job_keywords = list(set(job_keywords))[:10]
    
    # Run RAG pipeline
    try:
        logger.info(f"Running RAG pipeline for job {job_id} with {len(resumes)} resumes")
        result = rag_service.match_resumes_to_job(
            job_description=job_description,
            resumes=resume_dicts,
            top_k=top_k,
            top_n=top_n
        )
        
        ranked_resumes = result["ranked_resumes"]
        
        # Calculate score distribution
        score_ranges = {
            "0-20": 0,
            "20-40": 0,
            "40-60": 0,
            "60-80": 0,
            "80-100": 0
        }
        
        for r in ranked_resumes:
            score = r.get("rerank_score", r.get("embedding_score", 0))
            # Normalize to 0-100
            if score < 0:
                score = 50 + (score * 10)
            elif score > 1 and score < 10:
                score = score * 10
            
            if score < 20:
                score_ranges["0-20"] += 1
            elif score < 40:
                score_ranges["20-40"] += 1
            elif score < 60:
                score_ranges["40-60"] += 1
            elif score < 80:
                score_ranges["60-80"] += 1
            else:
                score_ranges["80-100"] += 1
        
        score_distribution = [
            {"range": k, "count": v} for k, v in score_ranges.items()
        ]
        
        # Calculate keyword matches
        keyword_matches = []
        for keyword in job_keywords:
            match_count = 0
            for r in ranked_resumes:
                resume_text = r.get("text", "").lower()
                if keyword in resume_text:
                    match_count += 1
            
            if match_count > 0:
                keyword_matches.append({
                    "keyword": keyword,
                    "count": match_count,
                    "percentage": round((match_count / len(ranked_resumes)) * 100, 1)
                })
        
        keyword_matches = sorted(keyword_matches, key=lambda x: x["count"], reverse=True)[:8]
        
        # Format ranked resumes
        formatted_resumes = []
        for i, r in enumerate(ranked_resumes, 1):
            score = r.get("rerank_score", r.get("embedding_score", 0))
            if score < 0:
                score = 50 + (score * 10)
            elif score > 1 and score < 10:
                score = score * 10
            
            formatted_resumes.append({
                "rank": i,
                "resume_id": r["resume_id"],
                "candidate_name": r["candidate_name"],
                "score": round(score, 1),
                "skills": r["skills"][:5],
                "matched_keywords": [kw for kw in job_keywords if kw in r.get("text", "").lower()][:5]
            })
        
        return {
            "jobs": jobs_list,
            "ranked_resumes": formatted_resumes,
            "score_distribution": score_distribution,
            "keyword_matches": keyword_matches,
            "selected_job": {"id": job.id, "title": job.title}
        }
    
    except Exception as e:
        logger.error(f"Error in ranked overview: {str(e)}")
        return {
            "jobs": jobs_list,
            "ranked_resumes": [],
            "score_distribution": [],
            "keyword_matches": [],
            "selected_job": {"id": job.id, "title": job.title} if job else None,
            "error": f"Error processing rankings: {str(e)}"
        }


@router.get("/ranked-candidates")
def get_ranked_candidates(
    job_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Get ranked candidates with their details for analytics display.
    
    Returns:
    - List of ranked candidates with:
      - Rank number
      - Candidate name (from resume filename)
      - Match score
      - Matched skills
      - LLM-generated summary
    - Score distribution data
    """
    
    if not current_user:
        return {
            "candidates": [],
            "score_distribution": [],
            "message": "Please log in to view ranked candidates"
        }
    
    # Get the most recent job if no job_id specified
    if not job_id:
        latest_job = db.query(Job)\
            .filter(Job.user_id == current_user.id)\
            .order_by(desc(Job.created_at))\
            .first()
        
        if not latest_job:
            return {
                "candidates": [],
                "score_distribution": [],
                "message": "No jobs found. Please upload resumes with job details first."
            }
        
        job_id = latest_job.id
    
    # Get all matches for this job, ordered by score
    matches = db.query(Match)\
        .join(Job)\
        .join(Resume)\
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )\
        .order_by(desc(Match.match_score))\
        .all()
    
    if not matches:
        return {
            "candidates": [],
            "score_distribution": [],
            "message": "No ranked candidates yet. Upload resumes to see rankings."
        }
    
    # Build ranked candidates list
    ranked_candidates = []
    score_distribution = []
    
    for rank, match in enumerate(matches, 1):
        resume = match.resume
        
        # Extract candidate name from filename
        candidate_name = resume.file_name.replace('.pdf', '').replace('_', ' ')
        # Clean up timestamp prefixes
        import re
        candidate_name = re.sub(r'^\d{8}_\d{6}_\d+_', '', candidate_name)
        candidate_name = re.sub(r'^\d{8}_\d{6}_', '', candidate_name)
        
        # Get matched skills
        matched_skills = []
        if match.skills_match and isinstance(match.skills_match, dict):
            matched_skills = match.skills_match.get('matched_skills', [])
        elif resume.extracted_skills:
            matched_skills = resume.extracted_skills[:5]  # Top 5 skills
        
        # Get LLM summary
        summary = match.summary or "Strong candidate based on semantic similarity and skill matching."
        
        ranked_candidates.append({
            "rank": rank,
            "candidate_name": candidate_name,
            "resume_id": resume.id,
            "match_score": match.match_score,
            "matched_skills": matched_skills,
            "summary": summary,
            "status": match.status
        })
        
        # Add to score distribution
        score_distribution.append({
            "candidate": candidate_name,
            "score": match.match_score
        })
    
    # Get job details
    job = db.query(Job).filter(Job.id == job_id).first()
    
    return {
        "job_id": job_id,
        "job_title": job.title if job else "Unknown",
        "total_candidates": len(ranked_candidates),
        "candidates": ranked_candidates,
        "score_distribution": score_distribution,
        "message": f"Showing top {len(ranked_candidates)} ranked candidates"
    }
