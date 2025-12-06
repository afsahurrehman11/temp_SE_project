from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime
import logging

from app.database import get_db
from app.models import User, Resume, Match, Job
from app.schemas import ResumeResponse, FileUploadResponse, MatchResponse
from app.auth import get_current_active_user, get_optional_current_user
from app.config import settings
from app.services.rag_service import rag_service
from app.routers.notifications import create_notification

router = APIRouter(prefix="/resumes", tags=["Resumes"])
logger = logging.getLogger(__name__)


@router.post("/upload-and-rank")
async def upload_and_rank_resumes(
    files: List[UploadFile] = File(...),
    job_title: str = Form(...),
    job_description: str = Form(...),
    job_requirements: Optional[str] = Form(None),
    top_n: int = Form(10),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload resumes and automatically rank them using RAG pipeline.
    This endpoint:
    1. Uploads and processes PDF resumes
    2. Runs FAISS search to find top K candidates
    3. Reranks using CrossEncoder
    4. Selects top N candidates
    5. Generates LLM summaries explaining why each was selected
    6. Stores results for analytics display
    """
    
    logger.info("=" * 80)
    logger.info("🚀 UPLOAD AND RANK PIPELINE STARTED")
    logger.info("=" * 80)
    logger.info(f"📄 Files to process: {len(files)}")
    logger.info(f"💼 Job Title: {job_title}")
    logger.info(f"🎯 Top N to rank: {top_n}")
    logger.info("=" * 80)
    
    # Handle authentication (demo mode support)
    if not current_user:
        if not settings.ENABLE_DEMO_MODE:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
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
    
    # Create a temporary job record for this ranking session
    logger.info("📝 Creating job record...")
    job = Job(
        user_id=current_user.id,
        title=job_title,
        description=job_description,
        requirements=job_requirements.split('\n') if job_requirements else [],
        status='active'
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    logger.info(f"✅ Job created (ID: {job.id})")
    
    # STEP 1: Upload and process all resumes
    logger.info("\n" + "=" * 80)
    logger.info("STEP 1: UPLOADING AND PROCESSING RESUMES")
    logger.info("=" * 80)
    
    uploaded_resumes = []
    resume_texts = {}
    
    for idx, file in enumerate(files, 1):
        logger.info(f"\n📄 Processing file {idx}/{len(files)}: {file.filename}")
        
        # Validate file type
        if not file.filename.endswith('.pdf'):
            logger.warning(f"⚠️  Skipping {file.filename} - not a PDF")
            continue
        
        # Read and validate file size
        content = await file.read()
        file_size = len(content)
        
        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            logger.warning(f"⚠️  Skipping {file.filename} - exceeds size limit")
            continue
        
        # Save file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{idx}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        logger.info(f"  💾 Saved to: {safe_filename}")
        
        # Process PDF and extract text
        try:
            logger.info(f"  🔍 Extracting text from PDF...")
            chunks = rag_service.process_pdf(file_path)
            text_content = " ".join([chunk.page_content for chunk in chunks])
            
            logger.info(f"  📊 Extracted {len(text_content)} characters")
            
            # Extract skills
            logger.info(f"  🎯 Extracting skills...")
            skills = rag_service.extract_skills(text_content)
            logger.info(f"  ✅ Found {len(skills)} skills: {', '.join(skills[:5])}{'...' if len(skills) > 5 else ''}")
            
            # Add to vector store
            logger.info(f"  🔢 Adding to vector store...")
            rag_service.add_to_vector_store(chunks)
            
        except Exception as e:
            logger.error(f"  ❌ Error processing {file.filename}: {str(e)}")
            os.remove(file_path)
            continue
        
        # Create resume record
        resume = Resume(
            user_id=current_user.id,
            job_id=job.id,
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
        
        uploaded_resumes.append(resume)
        resume_texts[resume.id] = text_content
        
        logger.info(f"  ✅ Resume saved (ID: {resume.id})")
    
    logger.info(f"\n✅ STEP 1 COMPLETE: {len(uploaded_resumes)} resumes processed")
    
    if len(uploaded_resumes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid resumes were uploaded"
        )
    
    # STEP 2: Run RAG Pipeline - FAISS Search + Reranking
    logger.info("\n" + "=" * 80)
    logger.info("STEP 2: RUNNING RAG PIPELINE (FAISS + RERANKING)")
    logger.info("=" * 80)
    
    # Build job query
    requirements_text = "\n".join(job.requirements) if job.requirements else ""
    job_query = f"{job.title}\n{job.description}\nRequirements:\n{requirements_text}"
    
    logger.info(f"🔍 Job Query Length: {len(job_query)} characters")
    
    # Run complete RAG pipeline with ranking
    logger.info(f"\n🤖 Running RAG pipeline...")
    logger.info(f"  - FAISS search for top {min(50, len(uploaded_resumes))} candidates")
    logger.info(f"  - CrossEncoder reranking")
    logger.info(f"  - Selecting top {top_n} candidates")
    
    try:
        ranked_results = rag_service.rank_resumes_with_summaries(
            job_description=job_query,
            resume_texts=resume_texts,
            top_k=min(50, len(uploaded_resumes)),
            top_n=top_n
        )
        
        logger.info(f"\n✅ STEP 2 COMPLETE: {len(ranked_results)} candidates ranked")
        
    except Exception as e:
        logger.error(f"❌ RAG pipeline failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ranking failed: {str(e)}"
        )
    
    # STEP 3: Store Match Results with LLM Summaries
    logger.info("\n" + "=" * 80)
    logger.info("STEP 3: STORING RANKED RESULTS")
    logger.info("=" * 80)
    
    for rank, result in enumerate(ranked_results, 1):
        resume_id = result['resume_id']
        score = result['score']
        summary = result['summary']
        
        logger.info(f"\n🏆 Rank #{rank}")
        logger.info(f"  Resume ID: {resume_id}")
        logger.info(f"  Score: {score:.4f}")
        logger.info(f"  Summary: {summary[:100]}...")
        
        # Get resume to extract skills
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        
        # Create match record
        match = Match(
            job_id=job.id,
            resume_id=resume_id,
            match_score=int(score * 100),  # Convert to percentage
            skills_match={"matched_skills": resume.extracted_skills if resume else []},
            summary=summary,
            status="ranked"
        )
        
        db.add(match)
    
    db.commit()
    logger.info(f"\n✅ STEP 3 COMPLETE: {len(ranked_results)} matches stored")
    
    # Create notification
    create_notification(
        db=db,
        user_id=current_user.id,
        title="Resume Ranking Complete",
        message=f"Ranked top {len(ranked_results)} candidates for '{job.title}'",
        notification_type="match",
        link=f"/analytics"
    )
    
    logger.info("\n" + "=" * 80)
    logger.info("✅ UPLOAD AND RANK PIPELINE COMPLETED SUCCESSFULLY")
    logger.info("=" * 80)
    logger.info(f"📊 Total Resumes: {len(uploaded_resumes)}")
    logger.info(f"🏆 Top Ranked: {len(ranked_results)}")
    logger.info(f"💼 Job ID: {job.id}")
    logger.info("=" * 80 + "\n")
    
    return {
        "message": f"Successfully ranked {len(ranked_results)} out of {len(uploaded_resumes)} resumes",
        "job_id": job.id,
        "total_resumes": len(uploaded_resumes),
        "ranked_count": len(ranked_results),
        "top_candidates": [
            {
                "rank": idx + 1,
                "resume_id": r['resume_id'],
                "score": r['score'],
                "summary": r['summary']
            }
            for idx, r in enumerate(ranked_results)
        ]
    }


# Keep existing upload endpoint for backward compatibility
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
        if not settings.ENABLE_DEMO_MODE:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
            
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
    """Get all resumes for current user, ordered by most recent first"""
    query = db.query(Resume).filter(Resume.user_id == current_user.id)
    
    if job_id:
        query = query.filter(Resume.job_id == job_id)
    
    # Order by created_at descending (most recent first)
    resumes = query.order_by(Resume.created_at.desc()).offset(skip).limit(limit).all()
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


@router.get("/{resume_id}/download")
def download_resume(
    resume_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download/view a resume PDF file"""
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if not os.path.exists(resume.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found on server"
        )
    
    return FileResponse(
        path=resume.file_path,
        media_type="application/pdf",
        filename=resume.file_name,
        headers={
            "Content-Disposition": f'inline; filename="{resume.file_name}"'
        }
    )


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
