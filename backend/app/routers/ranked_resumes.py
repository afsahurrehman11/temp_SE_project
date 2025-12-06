from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Resume
from app.schemas import RankedResumesRequest, RankedResumesResponse, RankedResumeItem
from app.auth import get_current_active_user, get_optional_current_user
from app.services.rag_service import rag_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ranked-resumes", tags=["Ranked Resumes"])


@router.post("/match", response_model=RankedResumesResponse)
async def match_resumes(
    request: RankedResumesRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Match resumes to a job description using the full RAG pipeline.
    Returns ranked resumes with explanations.
    
    Pipeline stages:
    1. FAISS Semantic Search
    2. CrossEncoder Reranking
    3. T5 Summarization
    4. LLM Explanation Generation
    """
    try:
        # Get all resumes from database
        if current_user:
            resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
        else:
            # For demo purposes, show all resumes if no user logged in
            resumes = db.query(Resume).all()
        
        if not resumes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No resumes found. Please upload resumes first."
            )
        
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
        
        # Run the pipeline
        logger.info(f"Starting resume matching pipeline for {len(resumes)} resumes")
        result = rag_service.match_resumes_to_job(
            job_description=request.job_description,
            resumes=resume_dicts,
            top_k=request.top_k,
            top_n=request.top_n
        )
        
        # Convert to response format
        ranked_items = []
        for r in result["ranked_resumes"]:
            ranked_items.append(RankedResumeItem(
                resume_id=r["resume_id"],
                candidate_name=r["candidate_name"],
                embedding_score=r["embedding_score"],
                rerank_score=r.get("rerank_score"),
                skills=r["skills"],
                summary=r["summary"],
                explanation=r["explanation"],
                text=r["text"][:500] + "..." if len(r["text"]) > 500 else r["text"],
                metadata=r.get("metadata")
            ))
        
        return RankedResumesResponse(
            ranked_resumes=ranked_items,
            pipeline_config=result["pipeline_config"],
            stages=result.get("stages")
        )
        
    except Exception as e:
        logger.error(f"Error in resume matching: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error matching resumes: {str(e)}"
        )


@router.get("/job/{job_id}", response_model=RankedResumesResponse)
async def get_ranked_resumes_for_job(
    job_id: int,
    top_k: int = 50,
    top_n: int = 5,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get ranked resumes for a specific job"""
    from app.models import Job
    
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Build job description
    requirements_text = "\n".join(job.requirements) if job.requirements else ""
    job_description = f"{job.title}\n{job.description}\nRequirements:\n{requirements_text}"
    
    # Use the match endpoint logic
    request = RankedResumesRequest(
        job_description=job_description,
        top_k=top_k,
        top_n=top_n
    )
    
    return await match_resumes(request, current_user, db)
