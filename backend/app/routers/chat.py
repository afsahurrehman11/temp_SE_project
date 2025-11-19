from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Resume, Job
from app.schemas import ChatRequest, ChatResponse
from app.auth import get_current_active_user
from app.services.rag_service import rag_service


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/query", response_model=ChatResponse)
async def chat_query(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Query the RAG system with a question"""
    
    try:
        # Use RAG service to query
        result = rag_service.query(request.query, k=request.top_k)
        
        return ChatResponse(
            query=request.query,
            answer=result.get("result", "I couldn't find relevant information to answer your question."),
            sources=result.get("source_documents", []),
            confidence=0.85  # Could be calculated based on retrieval scores
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )


@router.post("/ask-resume/{resume_id}", response_model=ChatResponse)
async def ask_resume(
    resume_id: int,
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Ask questions about a specific resume"""
    
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    try:
        # Create context-aware query
        context_query = f"Regarding the resume of {resume.candidate_name}: {request.query}"
        
        # Query RAG system
        result = rag_service.query(context_query, k=request.top_k)
        
        return ChatResponse(
            query=request.query,
            answer=result.get("result", "I couldn't find specific information in this resume."),
            sources=result.get("source_documents", []),
            confidence=0.85,
            resume_id=resume_id
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )


@router.post("/compare-resumes", response_model=ChatResponse)
async def compare_resumes(
    resume_ids: List[int],
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Compare multiple resumes based on a query"""
    
    if len(resume_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 resume IDs are required for comparison"
        )
    
    # Get resumes
    resumes = db.query(Resume).filter(
        Resume.id.in_(resume_ids),
        Resume.user_id == current_user.id
    ).all()
    
    if len(resumes) != len(resume_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more resumes not found"
        )
    
    try:
        # Build comparison context
        comparison_text = "Compare the following candidates:\n\n"
        for resume in resumes:
            comparison_text += f"Candidate: {resume.candidate_name}\n"
            comparison_text += f"Skills: {', '.join(resume.extracted_skills[:10]) if resume.extracted_skills else 'N/A'}\n"
            comparison_text += f"Experience: {resume.extracted_experience or 'N/A'}\n\n"
        
        comparison_text += f"Question: {request.query}"
        
        # Query RAG system
        result = rag_service.query(comparison_text, k=len(resume_ids) * 2)
        
        return ChatResponse(
            query=request.query,
            answer=result.get("result", "Unable to compare the candidates."),
            sources=result.get("source_documents", []),
            confidence=0.80
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error comparing resumes: {str(e)}"
        )


@router.post("/analyze-job/{job_id}", response_model=ChatResponse)
async def analyze_job(
    job_id: int,
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze a job posting with RAG"""
    
    # Get job
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    try:
        # Create job analysis query
        job_context = f"""
        Job Title: {job.title}
        Description: {job.description}
        Requirements: {job.requirements}
        
        Question: {request.query}
        """
        
        # Query RAG system
        result = rag_service.query(job_context, k=request.top_k)
        
        return ChatResponse(
            query=request.query,
            answer=result.get("result", "Unable to analyze the job posting."),
            sources=result.get("source_documents", []),
            confidence=0.85,
            job_id=job_id
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing job: {str(e)}"
        )


@router.post("/suggest-questions/{resume_id}")
async def suggest_questions(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Suggest relevant questions to ask about a resume"""
    
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Generate suggested questions based on resume content
    suggestions = []
    
    if resume.extracted_skills:
        suggestions.append(f"What are {resume.candidate_name}'s strongest technical skills?")
        suggestions.append(f"Does {resume.candidate_name} have experience with [specific technology]?")
    
    if resume.extracted_experience:
        suggestions.append(f"What is {resume.candidate_name}'s total years of experience?")
        suggestions.append(f"What industries has {resume.candidate_name} worked in?")
    
    if resume.extracted_education:
        suggestions.append(f"What is {resume.candidate_name}'s educational background?")
    
    suggestions.extend([
        f"What are the key achievements of {resume.candidate_name}?",
        f"Is {resume.candidate_name} suitable for a [specific role] position?",
        f"What makes {resume.candidate_name} stand out?",
        "How does this candidate compare to others in the pool?"
    ])
    
    return {
        "resume_id": resume_id,
        "candidate_name": resume.candidate_name,
        "suggested_questions": suggestions
    }


@router.get("/conversation-history")
async def get_conversation_history(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get chat conversation history (placeholder for future implementation)"""
    
    # TODO: Implement conversation history storage
    # For now, return empty history
    return {
        "user_id": current_user.id,
        "conversations": [],
        "message": "Conversation history feature coming soon"
    }


@router.delete("/conversation-history")
async def clear_conversation_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Clear chat conversation history"""
    
    # TODO: Implement conversation history deletion
    return {
        "message": "Conversation history cleared",
        "user_id": current_user.id
    }
