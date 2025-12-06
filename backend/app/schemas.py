from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Ranked Resumes Schemas
class RankedResumeItem(BaseModel):
    resume_id: int
    candidate_name: str
    embedding_score: float
    rerank_score: Optional[float] = None
    skills: List[str]
    summary: str
    explanation: str
    text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class RankedResumesRequest(BaseModel):
    job_description: str
    top_k: int = Field(default=50, ge=1, le=100)
    top_n: int = Field(default=5, ge=1, le=20)


class RankedResumesResponse(BaseModel):
    ranked_resumes: List[RankedResumeItem]
    pipeline_config: Dict[str, Any]
    stages: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Job Schemas
class JobBase(BaseModel):
    title: str
    description: str
    requirements: Optional[List[str]] = []
    location: Optional[str] = None
    job_type: Optional[str] = "full-time"


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    status: Optional[str] = None


class JobResponse(JobBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Resume Schemas
class ResumeBase(BaseModel):
    candidate_name: Optional[str] = None
    candidate_email: Optional[EmailStr] = None
    candidate_phone: Optional[str] = None


class ResumeCreate(ResumeBase):
    job_id: Optional[int] = None


class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    job_id: Optional[int]
    file_name: str
    file_size: int
    extracted_skills: Optional[List[str]] = []
    extracted_experience: Optional[Dict[str, Any]] = {}
    extracted_education: Optional[List[Dict[str, str]]] = []
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Match Schemas
class MatchResponse(BaseModel):
    id: int
    job_id: int
    resume_id: int
    match_score: float
    skills_match: Optional[Dict[str, float]] = {}
    experience_match: Optional[float] = None
    education_match: Optional[float] = None
    summary: Optional[str] = None
    status: str
    created_at: datetime
    
    # Nested data
    resume: Optional[ResumeResponse] = None
    
    class Config:
        from_attributes = True


# Analytics Schemas
class DashboardStats(BaseModel):
    total_resumes: int
    total_jobs: int
    total_matches: int
    avg_match_score: float
    pending_reviews: int
    shortlisted: int


class SkillDistribution(BaseModel):
    skill: str
    count: int
    category: Optional[str] = None


class MatchesAnalytics(BaseModel):
    total_matches: int
    average_score: float
    high_matches: int
    medium_matches: int
    low_matches: int
    score_distribution: Dict[str, int]


class AnalyticsResponse(BaseModel):
    dashboard_stats: DashboardStats
    top_skills: List[SkillDistribution]
    recent_matches: List[MatchResponse]


# Chat/Query Schema
class ChatRequest(BaseModel):
    query: str
    job_id: Optional[int] = None
    resume_ids: Optional[List[int]] = []


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[Dict[str, Any]]] = []
    
    
# File Upload Response
class FileUploadResponse(BaseModel):
    file_name: str
    file_size: int
    status: str
    message: str
