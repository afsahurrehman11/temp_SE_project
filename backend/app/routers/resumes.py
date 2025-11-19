from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime
import logging

from app.database import get_db
from app.models import User, Resume, Match
from app.schemas import ResumeResponse, FileUploadResponse, MatchResponse
from app.auth import get_current_active_user, get_optional_current_user
from app.config import settings
from app.services.rag_service import rag_service

router = APIRouter(prefix="/resumes", tags=["Resumes"])
logger = logging.getLogger(__name__)


@router.post("/upload", response_model=List[FileUploadResponse])
async def upload_resumes(
    files: List[UploadFile] = File(...),
    job_id: Optional[int] = Form(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Upload one or more resume files"""
    
    logger.info(f"📤 Upload request received: {len(files)} files, job_id={job_id}")
    
    # For demo purposes, if no user is authenticated, create a demo user
    if not current_user:
        # Get or create demo user
        demo_user = db.query(User).filter(User.email == "demo@example.com").first()
        if not demo_user:
            from app.auth import get_password_hash
            demo_user = User(
                email="demo@example.com",
                username="demo",
                hashed_password=get_password_hash("demo123"),
                full_name="Demo User",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        current_user = demo_user
    
    uploaded_files = []
    
    for file in files:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only PDF files are allowed. {file.filename} is not a PDF."
            )
        
        # Validate file size
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} exceeds maximum size of {settings.MAX_FILE_SIZE_MB}MB"
            )
        
        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Process PDF and extract text
        try:
            chunks = rag_service.process_pdf(file_path)
            text_content = " ".join([chunk.page_content for chunk in chunks])
            
            # Extract skills using RAG
            skills = rag_service.extract_skills(text_content)
            
            # Add to vector store
            rag_service.add_to_vector_store(chunks)
            
        except Exception as e:
            # Clean up file if processing fails
            logger.error(f"❌ Error processing {file.filename}: {str(e)}")
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing {file.filename}: {str(e)}"
            )
        
        # Create resume record
        logger.info(f"💾 Creating resume record for {file.filename}")
        resume = Resume(
            user_id=current_user.id,
            job_id=job_id,
            file_name=file.filename,
            file_path=file_path,
            file_size=file_size,
            text_content=text_content,
            extracted_skills=skills,
            status="processed"
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        logger.info(f"✅ Successfully processed {file.filename} (Resume ID: {resume.id})")
        uploaded_files.append(FileUploadResponse(
            file_name=file.filename,
            file_size=file_size,
            status="success",
            message="Resume uploaded and processed successfully"
        ))
    
    logger.info(f"✨ Upload complete: {len(uploaded_files)} files processed successfully")
    return uploaded_files


@router.get("/", response_model=List[ResumeResponse])
def get_resumes(
    skip: int = 0,
    limit: int = 100,
    job_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all resumes for current user"""
    query = db.query(Resume).filter(Resume.user_id == current_user.id)
    
    if job_id:
        query = query.filter(Resume.job_id == job_id)
    
    resumes = query.offset(skip).limit(limit).all()
    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return resume


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete file
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    # Delete database record
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}


@router.get("/{resume_id}/matches", response_model=List[MatchResponse])
def get_resume_matches(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all matches for a specific resume"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    matches = db.query(Match).filter(Match.resume_id == resume_id).all()
    return matches
