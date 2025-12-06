# 🎯 ResumeMatch AI

> **AI-Powered Resume Screening & Matching Platform**
> 
> Streamline your hiring process with intelligent resume analysis, job matching, and natural language queries powered by LangChain and HuggingFace.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Smart Matching**: LangChain + HuggingFace LLM (Phi-3-mini) for resume-job matching
- **Skill Extraction**: Automatic skill detection from resumes using AI
- **Vector Search**: FAISS-powered semantic search for relevant resume retrieval
- **Natural Language Queries**: Chat with your resume database

### 📄 Resume Processing
- **Multi-file Upload**: Drag & drop multiple PDF resumes
- **Automatic Parsing**: Extract text, skills, experience, and education
- **Real-time Processing**: Background task processing for large batches
- **Vector Storage**: Store resume embeddings for fast retrieval

### 📊 Analytics & Insights
- **Dashboard**: Overview of jobs, resumes, matches, and scores
- **Skills Distribution**: See the most common skills across candidates
- **Match Analytics**: Score distribution, qualified candidates count
- **Trends**: Hiring trends over time
- **Export**: Download analytics as JSON or CSV

### 💼 Job Management
- **Create Jobs**: Define job titles, descriptions, and requirements
- **Track Applications**: See all resumes matched to each job
- **Match Scoring**: AI-generated match scores (0-100)
- **Bulk Matching**: Match all resumes to a job with one click

### 🔐 Security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **User Isolation**: Each user sees only their own data
- **CORS Protection**: Configured for frontend integration

### 🎨 Modern UI
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Glassmorphism**: Beautiful modern design with backdrop blur
- **Smooth Animations**: GPU-accelerated transitions
- **Dark Mode Ready**: Theme support built-in

---

## 🚀 Quick Start (Windows 11)

### Prerequisites
- **Node.js** 18+ (for frontend) - [Download](https://nodejs.org/)
- **Python** 3.9+ (for backend) - [Download](https://www.python.org/downloads/)
- **PostgreSQL** 12+ (for database) - [Download](https://www.postgresql.org/download/windows/)
- **HuggingFace API Token** - [Get here](https://huggingface.co/settings/tokens)

### 1. Install PostgreSQL
Download and install PostgreSQL for Windows. **Remember the postgres user password!**

### 2. Setup Database
```powershell
cd backend
.\setup_database.ps1
```
Enter your PostgreSQL password when prompted.

### 3. Setup Backend (FastAPI)
```powershell
.\quickstart.ps1
```

This will:
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Run setup wizard (enter HuggingFace token)
- ✅ Create database tables
- ✅ Start server at http://localhost:8000

### 4. Setup Frontend (Next.js)
Open a **new PowerShell window**:
```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### 5. Start Everything (Easy Method)
From project root:
```powershell
.\start_complete.ps1
```

This starts both backend and frontend automatically!

### 6. Create Your First Account
Visit http://localhost:8000/api/docs and use the Swagger UI to register.

---

## 📚 Documentation

- **[Windows Setup Guide](WINDOWS_SETUP_GUIDE.md)** - **⭐ START HERE for Windows 11!**
- **[Quick Start Guide](QUICK_START.md)** - How to use the application
- **[Backend Summary](BACKEND_SUMMARY.md)** - Backend API documentation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - Landing Page     - Dashboard      - Analytics            │
│  - Upload Page      - Settings       - Responsive Design    │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API (Axios)
┌────────────────────▼────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Routers: Auth, Jobs, Resumes, Analytics, Chat      │   │
│  └─────────────────┬───────────────────────────────────┘   │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │ Services: RAG Service (LangChain + HuggingFace)    │   │
│  └─────────────────┬───────────────────────────────────┘   │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │ Database: PostgreSQL + SQLAlchemy                  │   │
│  │ Vector Store: FAISS                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Dropzone** - File uploads
- **Lucide Icons** - Icon library

### Backend
- **FastAPI 0.115.0** - Modern Python web framework
- **SQLAlchemy 2.0.35** - Database ORM
- **PostgreSQL** - Relational database
- **LangChain 0.3.7** - RAG pipeline orchestration
- **HuggingFace Transformers** - LLM (Phi-3-mini-4k-instruct)
- **Sentence Transformers** - Embeddings (all-MiniLM-L6-v2)
- **FAISS** - Vector database
- **PyPDF** - PDF parsing
- **python-jose** - JWT tokens
- **passlib** - Password hashing

---

## 📊 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Create account
- `POST /login` - Get JWT token
- `GET /me` - Get current user

### Jobs (`/api/v1/jobs`)
- `POST /` - Create job posting
- `GET /` - List jobs
- `GET /{id}` - Get job details
- `PUT /{id}` - Update job
- `DELETE /{id}` - Delete job
- `GET /{id}/matches` - Get matches
- `POST /{id}/match-all` - Match all resumes

### Resumes (`/api/v1/resumes`)
- `POST /upload` - Upload PDF resumes
- `GET /` - List resumes
- `GET /{id}` - Get resume details
- `DELETE /{id}` - Delete resume
- `GET /{id}/matches` - Get matches

### Analytics (`/api/v1/analytics`)
- `GET /dashboard` - Dashboard stats
- `GET /skills` - Skills distribution
- `GET /matches` - Match analytics
- `GET /trends` - Hiring trends
- `GET /export` - Export data

### Chat (`/api/v1/chat`)
- `POST /query` - Natural language query
- `POST /ask-resume/{id}` - Query resume
- `POST /compare-resumes` - Compare candidates
- `POST /analyze-job/{id}` - Analyze job

**Total: 31 endpoints**

---

## 🧪 Testing

### Automated Backend Tests
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python test_api.py
```

Expected output:
```
✅ PASS - Health Check
✅ PASS - User Registration
✅ PASS - User Login
✅ PASS - Create Job
✅ PASS - Analytics Dashboard
✅ PASS - Chat Query

Results: 8/8 tests passed
```

### Manual Testing
Visit http://localhost:8000/api/docs for interactive Swagger UI

---

## 📸 Screenshots

### Landing Page
Beautiful, responsive landing page with hero section, features, and testimonials.

### Dashboard
Overview of jobs, resumes, matches, and recent activity.

### Upload Page
Drag & drop interface for uploading multiple resumes.

### Analytics
Comprehensive charts showing match statistics and trends.

---

## 🎯 Use Cases

1. **Recruitment Agencies**
   - Manage multiple job openings
   - Process hundreds of resumes quickly
   - Find best candidates using AI

2. **HR Departments**
   - Streamline hiring workflow
   - Reduce manual resume screening
   - Get AI-powered recommendations

3. **Hiring Managers**
   - Compare candidates easily
   - Export analytics for reporting
   - Make data-driven decisions

---

## 🔧 Configuration

### Backend Environment (`.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/resumematch

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/ML
HUGGINGFACEHUB_API_TOKEN=hf_xxxxxxxxxxxxx
LLM_MODEL_ID=microsoft/Phi-3-mini-4k-instruct
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Upload
MAX_FILE_SIZE_MB=10
```

### Frontend Environment (`.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 🚀 Deployment

### Backend (Production)
```powershell
# Using Uvicorn with workers
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

### Frontend (Production)
```powershell
npm run build
npm start
```

### Stop All Services
```powershell
.\stop_all.ps1
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FastAPI** - Modern web framework for Python
- **Next.js** - React framework for production
- **LangChain** - LLM application framework
- **HuggingFace** - AI model hosting
- **PostgreSQL** - Robust database system
- **Tailwind CSS** - Utility-first CSS framework

---

## 📞 Support

For issues, questions, or contributions:
- Check the [Windows Setup Guide](WINDOWS_SETUP_GUIDE.md)
- Review the [Quick Start Guide](QUICK_START.md)

---

## 🎉 Project Status

✅ **Frontend**: Complete (6 pages, responsive, animated)  
✅ **Backend**: Complete (31 endpoints, RAG pipeline, authentication)  
✅ **Database**: Complete (5 tables, relationships, migrations)  
✅ **AI/ML**: Complete (LangChain, HuggingFace, FAISS)  
✅ **Documentation**: Complete (guides, API docs, examples)  
✅ **Testing**: Complete (automated test suite)  

**Status**: Production Ready 🚀

---

**Built with ❤️ using FastAPI, Next.js, LangChain, and HuggingFace**

---

## 🎯 Getting Started Checklist

- [ ] Install Python 3.9+ from python.org
- [ ] Install Node.js 18+ from nodejs.org
- [ ] Install PostgreSQL 12+ for Windows
- [ ] Get HuggingFace API token
- [ ] Run `.\setup_database.ps1` in backend folder
- [ ] Run `.\quickstart.ps1` in backend folder
- [ ] Run `npm install` in frontend folder
- [ ] Start with `.\start_complete.ps1`
- [ ] Open http://localhost:3000
- [ ] Create account via API docs
- [ ] Upload test resumes
- [ ] Create job posting
- [ ] View analytics dashboard

**Happy recruiting! 🎯**
