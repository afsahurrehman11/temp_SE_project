from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Favorite, Resume, User
from app.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("/{resume_id}")
async def add_favorite(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a resume to user's favorites"""
    logger.info(f"User {current_user.id} adding resume {resume_id} to favorites")
    
    # Check if resume exists
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check if already favorited
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.resume_id == resume_id
    ).first()
    
    if existing:
        return {"message": "Already in favorites", "favorite_id": existing.id}
    
    # Create favorite
    favorite = Favorite(
        user_id=current_user.id,
        resume_id=resume_id
    )
    
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    
    logger.info(f"✅ Favorite created: ID {favorite.id}")
    
    return {"message": "Added to favorites", "favorite_id": favorite.id}


@router.delete("/{resume_id}")
async def remove_favorite(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a resume from user's favorites"""
    logger.info(f"User {current_user.id} removing resume {resume_id} from favorites")
    
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.resume_id == resume_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    db.delete(favorite)
    db.commit()
    
    logger.info(f"✅ Favorite removed")
    
    return {"message": "Removed from favorites"}


@router.get("")
async def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all favorited resumes for current user"""
    logger.info(f"Fetching favorites for user {current_user.id}")
    
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()
    
    result = []
    for fav in favorites:
        resume = fav.resume
        
        # Get candidate name from filename or extracted data
        candidate_name = resume.candidate_name or resume.file_name.replace('.pdf', '').replace('_', ' ')
        
        # Clean timestamp prefix if present
        if '-' in candidate_name and candidate_name.split('-')[0].isdigit():
            candidate_name = '-'.join(candidate_name.split('-')[1:]).strip()
        
        # Get match score if available (from most recent match)
        match_score = None
        if resume.matches:
            latest_match = sorted(resume.matches, key=lambda m: m.created_at, reverse=True)[0]
            match_score = latest_match.match_score
        
        result.append({
            "favorite_id": fav.id,
            "resume_id": resume.id,
            "candidate_name": candidate_name,
            "file_name": resume.file_name,
            "skills": resume.extracted_skills or [],
            "match_score": match_score,
            "created_at": fav.created_at.isoformat() if fav.created_at else None,
            "resume_created_at": resume.created_at.isoformat() if resume.created_at else None,
        })
    
    logger.info(f"✅ Found {len(result)} favorites")
    
    return {
        "total": len(result),
        "favorites": result
    }


@router.get("/check/{resume_id}")
async def check_favorite(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a resume is favorited by current user"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.resume_id == resume_id
    ).first()
    
    return {"is_favorited": favorite is not None}


@router.get("/bulk-check")
async def bulk_check_favorites(
    resume_ids: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check multiple resumes at once for favorite status"""
    # Parse comma-separated IDs
    try:
        ids = [int(id.strip()) for id in resume_ids.split(',') if id.strip()]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resume IDs format"
        )
    
    if not ids:
        return {"favorited_ids": []}
    
    # Query all favorites for these resumes
    favorites = db.query(Favorite.resume_id).filter(
        Favorite.user_id == current_user.id,
        Favorite.resume_id.in_(ids)
    ).all()
    
    favorited_ids = [fav.resume_id for fav in favorites]
    
    return {"favorited_ids": favorited_ids}
