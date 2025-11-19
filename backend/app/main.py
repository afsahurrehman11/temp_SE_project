from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import time
import logging
from pathlib import Path

from app.config import settings
from app.database import engine, Base
from app.routers import auth, jobs, resumes, analytics, chat, notifications

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables with error handling
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created successfully")
except Exception as e:
    logger.error(f"❌ Database connection failed: {str(e)}")
    logger.warning("⚠️  Application will start without database. Install and start PostgreSQL to enable full functionality.")
    logger.warning("   Run: sudo apt install postgresql postgresql-contrib")
    logger.warning("   Then: sudo systemctl start postgresql")
    logger.warning("   Create DB: sudo -u postgres createdb resumematch")

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="AI-Powered Resume Screening and Matching Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "avatars").mkdir(exist_ok=True)

# Mount static files for serving uploaded avatars
try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    logger.info("✅ Static files mounted successfully at /uploads")
except Exception as e:
    logger.warning(f"⚠️  Could not mount static files: {str(e)}")


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Health check endpoint
@app.get("/health")
async def health_check():
    db_status = "disconnected"
    try:
        # Try to connect to database
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "connected"
    except Exception as e:
        logger.warning(f"Database health check failed: {str(e)}")
    
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "message": "Install PostgreSQL to enable database features" if db_status == "disconnected" else "All systems operational"
    }


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to ResumeMatch AI API",
        "docs": "/api/docs",
        "health": "/health"
    }


# Startup event to verify RAG service
@app.on_event("startup")
async def startup_event():
    """Verify RAG service initialization on startup"""
    try:
        from app.services.rag_service import rag_service
        logger.info("🤖 Verifying RAG Service...")
        logger.info(f"   ✅ Embeddings Model: {rag_service.embeddings.model_name if rag_service.embeddings else 'Not loaded'}")
        logger.info(f"   {'✅' if rag_service.llm_available else '⚠️'} LLM Available: {rag_service.llm_available}")
        if rag_service.llm_available:
            logger.info(f"   ✅ LLM Model: {settings.LLM_REPO_ID}")
        else:
            logger.warning("   ⚠️  LLM not available - AI features will be limited")
        logger.info("🚀 RAG Service ready!")
    except Exception as e:
        logger.error(f"❌ RAG Service initialization failed: {str(e)}")
        logger.warning("⚠️  Application will run with limited AI features")


# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs.router, prefix=settings.API_V1_PREFIX)
app.include_router(resumes.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router)


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
