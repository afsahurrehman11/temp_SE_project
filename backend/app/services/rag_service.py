import os
from typing import List
import re
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG (Retrieval Augmented Generation) operations"""
    
    def __init__(self):
        self.embeddings = self._setup_embeddings()
        self.llm = self._setup_llm()
        self.vector_store = None
        self.llm_available = self.llm is not None
        
    def _setup_embeddings(self):
        """Setup HuggingFace embeddings"""
        try:
            logger.info("🔧 Setting up HuggingFace embeddings...")
            embeddings = HuggingFaceEmbeddings(
                model_name=settings.EMBEDDING_MODEL,
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            logger.info("✅ Embeddings setup complete")
            return embeddings
        except Exception as e:
            logger.error(f"❌ Failed to setup embeddings: {str(e)}")
            raise
    
    def _setup_llm(self):
        """Setup HuggingFace LLM with error handling"""
        try:
            logger.info("🔧 Setting up HuggingFace LLM...")
            llm = HuggingFaceEndpoint(
                repo_id=settings.LLM_REPO_ID,
                huggingfacehub_api_token=settings.HUGGINGFACEHUB_API_TOKEN,
                max_new_tokens=settings.LLM_MAX_LENGTH,
                temperature=settings.LLM_TEMPERATURE,
            )
            logger.info("✅ LLM setup complete")
            return llm
        except Exception as e:
            logger.warning(f"⚠️  LLM setup failed: {str(e)}. Running without LLM features.")
            return None
    
    def process_pdf(self, file_path: str) -> List[str]:
        """Load and process a PDF file"""
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        chunks = text_splitter.split_documents(documents)
        
        return chunks
    
    def create_vector_store(self, documents):
        """Create a FAISS vector store from documents"""
        self.vector_store = FAISS.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        return self.vector_store
    
    def add_to_vector_store(self, documents):
        """Add documents to existing vector store"""
        if self.vector_store is None:
            return self.create_vector_store(documents)
        
        # Add new documents to existing store
        new_store = FAISS.from_documents(
            documents=documents,
            embedding=self.embeddings
        )
        self.vector_store.merge_from(new_store)
        return self.vector_store
    
    def save_vector_store(self, path: str):
        """Save vector store to disk"""
        if self.vector_store:
            self.vector_store.save_local(path)
    
    def load_vector_store(self, path: str):
        """Load vector store from disk"""
        self.vector_store = FAISS.load_local(
            path,
            self.embeddings,
            allow_dangerous_deserialization=True
        )
        return self.vector_store
    
    def query(self, question: str, k: int = 3) -> dict:
        """Query the RAG system"""
        if self.vector_store is None:
            return {"error": "No documents indexed"}
        
        # Create retrieval QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(search_kwargs={"k": k}),
            return_source_documents=True
        )
        
        result = qa_chain({"query": question})
        
        return {
            "response": result["result"],
            "sources": [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in result["source_documents"]
            ]
        }
    
    def analyze_resume_match(self, resume_text: str, job_description: str) -> dict:
        """Analyze how well a resume matches a job description"""
        if not self.llm_available:
            logger.warning("⚠️  LLM not available, using basic matching")
            return {
                "analysis": "LLM analysis not available. Resume uploaded successfully.",
                "job_description": job_description[:200] + "...",
                "resume_preview": resume_text[:200] + "..."
            }
        
        try:
            prompt_template = """
            You are an expert HR recruiter analyzing resumes. Compare the following resume with the job description and provide:
            
            1. Match Score (0-100): Overall compatibility score
            2. Key Strengths: Skills and experiences that match well
            3. Gaps: Missing skills or requirements
            4. Recommendation: Hire, Maybe, or Pass with reasoning
            
            Job Description:
            {job_description}
            
            Resume:
            {resume}
            
            Provide a detailed analysis:
            """
            
            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["job_description", "resume"]
            )
            
            formatted_prompt = prompt.format(
                job_description=job_description,
                resume=resume_text
            )
            
            response = self.llm(formatted_prompt)
            
            return {
                "analysis": response,
                "job_description": job_description[:200] + "...",
                "resume_preview": resume_text[:200] + "..."
            }
        except Exception as e:
            logger.error(f"❌ Resume analysis failed: {str(e)}")
            return {
                "analysis": f"Analysis unavailable: {str(e)}",
                "job_description": job_description[:200] + "...",
                "resume_preview": resume_text[:200] + "..."
            }
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text using keyword matching with LLM fallback"""
        # Common technical skills to look for
        common_skills = [
            # Programming Languages
            'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP',
            'Swift', 'Kotlin', 'R', 'MATLAB', 'Scala', 'Perl', 'Shell', 'Bash',
            # Web Technologies
            'HTML', 'CSS', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
            'FastAPI', 'Spring', 'ASP.NET', 'Laravel', 'Rails', 'Next.js', 'Nuxt',
            # Databases
            'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'Cassandra', 'DynamoDB',
            'SQLite', 'MariaDB', 'Elasticsearch', 'Neo4j',
            # Cloud & DevOps
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab', 'GitHub Actions',
            'Terraform', 'Ansible', 'CI/CD', 'Linux', 'Unix',
            # Data Science & ML
            'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
            'NumPy', 'Keras', 'NLP', 'Computer Vision', 'Data Analysis', 'Statistics',
            # Tools & Frameworks
            'Git', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'JIRA', 'Confluence'
        ]
        
        extracted_skills = []
        text_lower = text.lower()
        
        # Extract skills by keyword matching
        for skill in common_skills:
            # Use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_skills.append(skill)
        
        # Try to use LLM for additional extraction if available and skills are limited
        if len(extracted_skills) < 5:
            try:
                logger.info("🤖 Attempting LLM-based skill extraction...")
                prompt = f"""
                Extract all technical skills, programming languages, frameworks, tools, and professional skills from the following resume.
                Return only a comma-separated list of skills, nothing else.
                
                Resume:
                {text[:2000]}
                
                Skills:
                """
                
                response = self.llm(prompt)
                llm_skills = [skill.strip() for skill in response.split(',') if skill.strip()]
                
                # Merge with keyword-extracted skills
                extracted_skills.extend([s for s in llm_skills if s not in extracted_skills])
                logger.info(f"✅ LLM extracted {len(llm_skills)} additional skills")
                
            except Exception as e:
                logger.warning(f"⚠️  LLM skill extraction failed: {str(e)}. Using keyword-based extraction only.")
        
        # Remove duplicates and return
        return list(set(extracted_skills))[:20]  # Limit to top 20 skills


# Global RAG service instance
rag_service = RAGService()
