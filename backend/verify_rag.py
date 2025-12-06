import os
import sys
import logging

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_rag_pipeline():
    print("🚀 Starting RAG Pipeline Verification...")
    
    try:
        from app.services.rag_service import rag_service
        logger.info("✅ Imported RAG service")
    except ImportError as e:
        logger.error(f"❌ Failed to import RAG service: {e}")
        return

    # 1. Check Embeddings
    if rag_service.embeddings:
        logger.info(f"✅ Embeddings initialized: {rag_service.embeddings.model_name}")
    else:
        logger.error("❌ Embeddings not initialized")

    # 2. Check Reranker
    if rag_service.reranker:
        logger.info("✅ Reranker initialized")
    else:
        logger.warning("⚠️ Reranker not initialized")

    # 3. Check Summarizer
    if rag_service.summarizer:
        logger.info("✅ Summarizer initialized")
    else:
        logger.warning("⚠️ Summarizer not initialized")

    # 4. Test PDF Processing
    logger.info("Testing PDF processing...")
    # Create a dummy PDF for testing
    from reportlab.pdfgen import canvas
    c = canvas.Canvas("test_resume.pdf")
    c.drawString(100, 750, "John Doe")
    c.drawString(100, 730, "Software Engineer")
    c.drawString(100, 710, "Skills: Python, React, Machine Learning, FastAPI")
    c.drawString(100, 690, "Experience: Built a RAG pipeline using LangChain and FAISS.")
    c.save()
    
    try:
        chunks = rag_service.process_pdf("test_resume.pdf")
        logger.info(f"✅ Processed PDF into {len(chunks)} chunks")
    except Exception as e:
        logger.error(f"❌ PDF processing failed: {e}")
        return

    # 5. Test Vector Store
    logger.info("Testing Vector Store creation...")
    try:
        rag_service.create_vector_store(chunks)
        logger.info("✅ Added to vector store")
    except Exception as e:
        logger.error(f"❌ Vector store creation failed: {e}")
        return

    # 6. Test Query (Search -> Rerank -> Summarize)
    logger.info("Testing Query Pipeline...")
    try:
        result = rag_service.query("What are John Doe's skills?")
        logger.info(f"Query Result: {result['result'][:100]}...")
        if "John Doe" in result['result'] or "Python" in result['result']:
             logger.info("✅ Query returned relevant info")
        else:
             logger.warning("⚠️ Query result might not be relevant")
    except Exception as e:
        logger.error(f"❌ Query failed: {e}")

    # 7. Test Skill Extraction
    logger.info("Testing Skill Extraction...")
    skills = rag_service.extract_skills("I know Python, React, and Machine Learning.")
    logger.info(f"Extracted Skills: {skills}")
    if "python" in [s.lower() for s in skills]:
        logger.info("✅ Skill extraction working")
    else:
        logger.error("❌ Skill extraction failed")

    # 8. Test Match Analysis
    logger.info("Testing Match Analysis...")
    try:
        analysis = rag_service.analyze_resume_match(
            "I am a Python developer with experience in FastAPI and React.",
            "Looking for a Python developer with FastAPI skills."
        )
        logger.info(f"Match Score: {analysis['match_score']}")
        logger.info(f"Skills Match: {analysis['skills_match']}")
        if analysis['match_score'] > 0:
            logger.info("✅ Match analysis working")
    except Exception as e:
        logger.error(f"❌ Match analysis failed: {e}")

    # Cleanup
    if os.path.exists("test_resume.pdf"):
        os.remove("test_resume.pdf")

if __name__ == "__main__":
    verify_rag_pipeline()
