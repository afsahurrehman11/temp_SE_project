"""
New endpoint to get ranked candidates with full details for analytics display
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from collections import Counter

from app.database import get_db
from app.models import User, Job, Resume, Match
from app.auth import get_optional_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/ranked-candidates")
def get_ranked_candidates(
    job_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
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
        
        # Get matched skills
        matched_skills = []
        if match.skills_match and isinstance(match.skills_match, dict):
            matched_skills = match.skills_match.get('matched_skills', [])
        elif resume.extracted_skills:
            matched_skills = resume.extracted_skills[:5]  # Top 5 skills
        
        # Get LLM summary
        summary = match.summary or "No summary available"
        
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
