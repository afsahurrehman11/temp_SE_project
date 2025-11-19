# Resume Screening Backend API

AI-powered resume screening and matching platform built with FastAPI, LangChain, and HuggingFace.

## 🚀 Features

- **Authentication**: JWT-based authentication with OAuth2 password flow
- **Resume Processing**: PDF upload, text extraction, and skill analysis using AI
- **Job Management**: Create and manage job postings with requirements
- **AI Matching**: Intelligent resume-job matching using RAG pipeline
- **Analytics**: Comprehensive dashboard with statistics and trends
- **Chat Interface**: Query resumes and jobs using natural language

## 🛠️ Technology Stack

- **Framework**: FastAPI 0.115.0
- **Database**: PostgreSQL with SQLAlchemy 2.0.35
- **AI/ML**: 
  - LangChain 0.3.7 for RAG pipeline
  - HuggingFace Transformers (Phi-3-mini-4k-instruct)
  - Sentence Transformers (all-MiniLM-L6-v2)
  - FAISS for vector storage
- **Authentication**: JWT with python-jose, bcrypt password hashing
- **Document Processing**: PyPDF for PDF parsing

## 📋 Prerequisites

- Python 3.9+
- PostgreSQL 12+
- HuggingFace API Token (get from https://huggingface.co/settings/tokens)

## 🔧 Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/resumematch
HUGGINGFACEHUB_API_TOKEN=your_token_here
SECRET_KEY=your-secret-key-here
```

5. **Create database**
```bash
createdb resumematch
```

6. **Run migrations (optional - tables auto-create on startup)**
```bash
alembic upgrade head
```

## 🚀 Running the Server

**Development mode (with auto-reload):**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Create new user account
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user info

### Jobs (`/api/v1/jobs`)
- `POST /` - Create job posting
- `GET /` - List all jobs (with filters)
- `GET /{job_id}` - Get specific job
- `PUT /{job_id}` - Update job
- `DELETE /{job_id}` - Delete job
- `GET /{job_id}/matches` - Get matches for job
- `POST /{job_id}/match/{resume_id}` - Match resume to job
- `POST /{job_id}/match-all` - Match all resumes to job

### Resumes (`/api/v1/resumes`)
- `POST /upload` - Upload resume PDF(s)
- `GET /` - List all resumes (with filters)
- `GET /{resume_id}` - Get specific resume
- `DELETE /{resume_id}` - Delete resume
- `GET /{resume_id}/matches` - Get matches for resume

### Analytics (`/api/v1/analytics`)
- `GET /dashboard` - Get dashboard statistics
- `GET /skills` - Get top skills distribution
- `GET /matches` - Get match analytics
- `GET /jobs/{job_id}/stats` - Get job-specific stats
- `GET /trends` - Get hiring trends over time
- `GET /export` - Export analytics data (JSON/CSV)

### Chat (`/api/v1/chat`)
- `POST /query` - Query RAG system
- `POST /ask-resume/{resume_id}` - Ask about specific resume
- `POST /compare-resumes` - Compare multiple resumes
- `POST /analyze-job/{job_id}` - Analyze job posting
- `POST /suggest-questions/{resume_id}` - Get suggested questions

## 🔐 Authentication

The API uses JWT bearer tokens. To authenticate:

1. **Register a new account:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "secure_password",
    "full_name": "John Doe"
  }'
```

2. **Login to get token:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=secure_password"
```

3. **Use token in requests:**
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📤 Resume Upload Example

```bash
curl -X POST "http://localhost:8000/api/v1/resumes/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@resume1.pdf" \
  -F "files=@resume2.pdf" \
  -F "job_id=1"
```

## 🤖 RAG Pipeline

The system uses a Retrieval-Augmented Generation (RAG) pipeline:

1. **Document Processing**: PDFs are split into chunks (1000 chars, 150 overlap)
2. **Embeddings**: Text chunks are embedded using `all-MiniLM-L6-v2`
3. **Vector Storage**: Embeddings stored in FAISS for fast retrieval
4. **LLM**: HuggingFace Phi-3-mini (3.8B) for generation
5. **Matching**: Custom prompts for resume-job matching with scoring

## 🗄️ Database Schema

### Users
- `id`, `email`, `username`, `hashed_password`, `full_name`, `is_active`

### Jobs
- `id`, `user_id`, `title`, `description`, `requirements`, `status`

### Resumes
- `id`, `user_id`, `job_id`, `candidate_name`, `file_name`, `file_path`, `text_content`, `extracted_skills`, `extracted_experience`, `extracted_education`

### Matches
- `id`, `job_id`, `resume_id`, `match_score`, `skills_match`, `summary`

### Skills
- `id`, `name`, `category`, `count`

## 📊 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app & middleware
│   ├── config.py            # Settings & configuration
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT authentication
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Auth endpoints
│   │   ├── jobs.py          # Job management
│   │   ├── resumes.py       # Resume upload & processing
│   │   ├── analytics.py     # Analytics & stats
│   │   └── chat.py          # RAG chat interface
│   └── services/
│       └── rag_service.py   # RAG pipeline
├── uploads/                  # Resume files (auto-created)
├── vector_stores/           # FAISS indexes (auto-created)
├── requirements.txt
├── .env.example
└── README.md
```

## 🧪 Testing

Test the API using the interactive Swagger docs at `http://localhost:8000/api/docs`

**Example Workflow:**
1. Register a user
2. Login to get token
3. Create a job posting
4. Upload resumes
5. View matches and analytics
6. Query the chat interface

## ⚙️ Configuration

Key settings in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/resumematch

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/ML
HUGGINGFACEHUB_API_TOKEN=your_token_here
LLM_MODEL_ID=microsoft/Phi-3-mini-4k-instruct
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Vector Store
VECTOR_STORE_TYPE=faiss  # or pinecone

# File Upload
MAX_FILE_SIZE_MB=10
ALLOWED_EXTENSIONS=.pdf

# Environment
ENVIRONMENT=development
```

## 🔍 Troubleshooting

**Database connection errors:**
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Create database if missing
createdb resumematch
```

**HuggingFace token errors:**
- Get token from https://huggingface.co/settings/tokens
- Set in `.env` file
- Token needs read access

**Import errors:**
```bash
# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

**Permission errors on uploads:**
```bash
# Create uploads directory
mkdir -p uploads
chmod 755 uploads
```

## 📈 Performance Optimization

- **Connection Pooling**: Database pool size = 10, max overflow = 20
- **Background Tasks**: Resume matching runs asynchronously
- **Vector Store**: FAISS for fast similarity search
- **Caching**: Consider Redis for frequently accessed data

## 🚀 Deployment

**Using Docker:**
```bash
# Build image
docker build -t resumematch-api .

# Run container
docker run -p 8000:8000 --env-file .env resumematch-api
```

**Using systemd:**
```bash
# Create service file: /etc/systemd/system/resumematch.service
sudo systemctl enable resumematch
sudo systemctl start resumematch
```

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using FastAPI, LangChain, and HuggingFace
