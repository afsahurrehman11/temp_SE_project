#!/usr/bin/env python3
"""
Create demo data for the resume screening application
This populates the database with sample jobs, resumes, and matches for testing
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models import User, Job, Resume, Match
from app.auth import get_password_hash

def create_demo_user(db):
    """Create a demo user if not exists"""
    user = db.query(User).filter(User.email == "demo@example.com").first()
    if not user:
        user = User(
            email="demo@example.com",
            username="demo",
            hashed_password=get_password_hash("demo123"),
            full_name="Demo User",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print("✅ Created demo user: demo@example.com (password: demo123)")
    else:
        print("✅ Demo user already exists")
    return user

def create_demo_jobs(db, user):
    """Create demo job postings"""
    jobs_data = [
        {
            "title": "Senior Full Stack Developer",
            "description": "We are seeking an experienced Full Stack Developer to join our team. You will work on building scalable web applications using React, Node.js, and Python.",
            "requirements": {
                "skills": ["JavaScript", "TypeScript", "React.js", "Node.js", "Python", "SQL", "MongoDB"],
                "experience": "5+ years",
                "education": "Bachelor's degree in Computer Science or related field"
            },
            "status": "active"
        },
        {
            "title": "Python Backend Engineer",
            "description": "Looking for a Python Backend Engineer to develop and maintain our API services using FastAPI and Django.",
            "requirements": {
                "skills": ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker"],
                "experience": "3+ years",
                "education": "Bachelor's degree"
            },
            "status": "active"
        },
        {
            "title": "Frontend Developer (React)",
            "description": "We need a Frontend Developer proficient in React.js to build beautiful and responsive user interfaces.",
            "requirements": {
                "skills": ["JavaScript", "React.js", "HTML", "CSS", "Tailwind CSS", "Next.js"],
                "experience": "2+ years",
                "education": "Bachelor's degree or equivalent experience"
            },
            "status": "active"
        },
        {
            "title": "DevOps Engineer",
            "description": "Seeking a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines.",
            "requirements": {
                "skills": ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Python", "Bash"],
                "experience": "4+ years",
                "education": "Bachelor's degree in Computer Science"
            },
            "status": "active"
        },
        {
            "title": "Data Scientist",
            "description": "Looking for a Data Scientist to build ML models and analyze large datasets.",
            "requirements": {
                "skills": ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas", "Scikit-learn", "Statistics"],
                "experience": "3+ years",
                "education": "Master's degree in Data Science, Statistics, or related field"
            },
            "status": "active"
        }
    ]
    
    existing_jobs = db.query(Job).filter(Job.user_id == user.id).count()
    if existing_jobs > 0:
        print(f"✅ {existing_jobs} jobs already exist")
        return db.query(Job).filter(Job.user_id == user.id).all()
    
    jobs = []
    for job_data in jobs_data:
        job = Job(
            user_id=user.id,
            title=job_data["title"],
            description=job_data["description"],
            requirements=job_data["requirements"],
            status=job_data["status"],
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        db.add(job)
        jobs.append(job)
    
    db.commit()
    print(f"✅ Created {len(jobs)} demo jobs")
    return jobs

def create_demo_resumes(db, user):
    """Create demo resumes"""
    resumes_data = [
        {
            "filename": "john_doe_fullstack.pdf",
            "candidate_name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1-555-0101",
            "experience_years": 6,
            "education": "Bachelor of Science in Computer Science",
            "extracted_text": "Senior Full Stack Developer with 6 years of experience...",
            "extracted_skills": ["JavaScript", "TypeScript", "React.js", "Node.js", "Python", "SQL", "MongoDB", "AWS"],
            "summary": "Experienced full stack developer with expertise in modern web technologies"
        },
        {
            "filename": "jane_smith_python.pdf",
            "candidate_name": "Jane Smith",
            "email": "jane.smith@example.com",
            "phone": "+1-555-0102",
            "experience_years": 4,
            "education": "Bachelor of Science in Software Engineering",
            "extracted_text": "Python Backend Engineer with 4 years of experience...",
            "extracted_skills": ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "AWS"],
            "summary": "Backend engineer specialized in Python web frameworks"
        },
        {
            "filename": "mike_johnson_frontend.pdf",
            "candidate_name": "Mike Johnson",
            "email": "mike.johnson@example.com",
            "phone": "+1-555-0103",
            "experience_years": 3,
            "education": "Bachelor of Arts in Web Design",
            "extracted_text": "Frontend Developer with 3 years of React experience...",
            "extracted_skills": ["JavaScript", "React.js", "HTML", "CSS", "Tailwind CSS", "Next.js", "TypeScript"],
            "summary": "Creative frontend developer focused on user experience"
        },
        {
            "filename": "sarah_williams_devops.pdf",
            "candidate_name": "Sarah Williams",
            "email": "sarah.williams@example.com",
            "phone": "+1-555-0104",
            "experience_years": 5,
            "education": "Bachelor of Science in Information Technology",
            "extracted_text": "DevOps Engineer with 5 years of cloud infrastructure experience...",
            "extracted_skills": ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Python", "Bash", "Linux"],
            "summary": "DevOps engineer with strong cloud and automation skills"
        },
        {
            "filename": "alex_brown_datascience.pdf",
            "candidate_name": "Alex Brown",
            "email": "alex.brown@example.com",
            "phone": "+1-555-0105",
            "experience_years": 4,
            "education": "Master of Science in Data Science",
            "extracted_text": "Data Scientist with 4 years of ML and analytics experience...",
            "extracted_skills": ["Python", "TensorFlow", "PyTorch", "SQL", "Pandas", "Scikit-learn", "Statistics", "R"],
            "summary": "Data scientist with expertise in machine learning and statistical analysis"
        },
        {
            "filename": "emily_davis_fullstack.pdf",
            "candidate_name": "Emily Davis",
            "email": "emily.davis@example.com",
            "phone": "+1-555-0106",
            "experience_years": 7,
            "education": "Bachelor of Science in Computer Engineering",
            "extracted_text": "Full Stack Developer with 7 years of web development experience...",
            "extracted_skills": ["JavaScript", "Python", "React.js", "Django", "SQL", "AWS", "Docker"],
            "summary": "Versatile full stack developer with both frontend and backend expertise"
        }
    ]
    
    existing_resumes = db.query(Resume).filter(Resume.user_id == user.id).count()
    if existing_resumes > 0:
        print(f"✅ {existing_resumes} resumes already exist")
        return db.query(Resume).filter(Resume.user_id == user.id).all()
    
    resumes = []
    for resume_data in resumes_data:
        resume = Resume(
            user_id=user.id,
            file_name=resume_data["filename"],
            file_path=f"/uploads/{resume_data['filename']}",
            candidate_name=resume_data["candidate_name"],
            candidate_email=resume_data["email"],
            candidate_phone=resume_data["phone"],
            text_content=resume_data["extracted_text"],
            extracted_skills=resume_data["extracted_skills"],
            extracted_experience={"years": resume_data["experience_years"]},
            extracted_education={"degree": resume_data["education"]},
            status="processed"
        )
        db.add(resume)
        resumes.append(resume)
    
    db.commit()
    print(f"✅ Created {len(resumes)} demo resumes")
    return resumes

def create_demo_matches(db, jobs, resumes):
    """Create demo matches between jobs and resumes"""
    existing_matches = db.query(Match).count()
    if existing_matches > 0:
        print(f"✅ {existing_matches} matches already exist")
        return
    
    match_count = 0
    for job in jobs:
        # Match each job with 3-5 random resumes
        num_matches = random.randint(3, min(5, len(resumes)))
        selected_resumes = random.sample(resumes, num_matches)
        
        for resume in selected_resumes:
            # Calculate match score based on skill overlap
            job_skills = set(job.requirements.get("skills", []))
            resume_skills = set(resume.extracted_skills or [])
            common_skills = job_skills & resume_skills
            
            if len(job_skills) > 0:
                match_score = (len(common_skills) / len(job_skills)) * 100
            else:
                match_score = 0
            
            # Add some randomness
            match_score = min(100, max(0, match_score + random.uniform(-10, 10)))
            
            match = Match(
                job_id=job.id,
                resume_id=resume.id,
                match_score=round(match_score, 2),
                skills_match={"matched": list(common_skills), "missing": list(job_skills - resume_skills)},
                experience_match=random.uniform(60, 100),
                education_match=random.uniform(70, 100),
                summary=f"Match score: {round(match_score, 2)}%. Candidate has {len(common_skills)} matching skills out of {len(job_skills)} required.",
                status="shortlisted" if match_score >= 70 else "pending"
            )
            db.add(match)
            match_count += 1
    
    db.commit()
    print(f"✅ Created {match_count} demo matches")

def main():
    """Main function to create all demo data"""
    print("=" * 60)
    print("Creating Demo Data for Resume Screening Application")
    print("=" * 60)
    print()
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create demo user
        user = create_demo_user(db)
        
        # Create demo jobs
        jobs = create_demo_jobs(db, user)
        
        # Create demo resumes
        resumes = create_demo_resumes(db, user)
        
        # Create demo matches
        create_demo_matches(db, jobs, resumes)
        
        print()
        print("=" * 60)
        print("✅ Demo Data Creation Complete!")
        print("=" * 60)
        print()
        print("Demo Login Credentials:")
        print("  Email: demo@example.com")
        print("  Username: demo")
        print("  Password: demo123")
        print()
        print(f"Created:")
        print(f"  - 1 user account")
        print(f"  - {len(jobs)} job postings")
        print(f"  - {len(resumes)} resumes")
        print(f"  - Multiple job-resume matches")
        print()
        print("You can now start the application and see real analytics data!")
        print()
        
    except Exception as e:
        print(f"❌ Error creating demo data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
