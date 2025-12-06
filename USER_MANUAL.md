# ResumeMatch AI - User Manual

## Installation Guide

**Prerequisites:**
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+
- HuggingFace account (free) with API token

---

## Installation Guide

### Step 1: Install Required Software

**PostgreSQL Database**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Set a password for the postgres user (remember this password)
4. Use default port 5432
5. Install both PostgreSQL Server and pgAdmin 4

**Python**
1. Download Python 3.9+ from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify installation: `python --version`

**Node.js**
1. Download Node.js 18+ from https://nodejs.org/
2. Install the LTS (Long Term Support) version
3. Verify installation: `node --version`

### Step 2: Obtain HuggingFace API Token

1. Create a free account at https://huggingface.co/
2. Navigate to Settings > Access Tokens
3. Click "New token" and create a token
4. Copy the token for later use

### Step 3: Setup Database

Open PowerShell in the project directory and run:
```powershell
cd backend
.\setup_database.ps1
```

The script will:
- Check PostgreSQL installation
- Start the PostgreSQL service if needed
- Create a database named "resumematch"
- Test the database connection

When prompted, enter your PostgreSQL password.

### Step 4: Configure Backend

Continue in the backend directory:
```powershell
.\quickstart.ps1
```

This script performs the following:
- Creates a Python virtual environment
- Installs all required Python packages
- Runs an interactive setup wizard

During setup, you will be asked for:
- **Database URL**: Use `postgresql://postgres:YOUR_PASSWORD@localhost:5432/resumematch`
- **HuggingFace API Token**: Paste the token you obtained earlier
- **Secret Key**: Press Enter to auto-generate

When asked to start the server, type 'n' for now.

### Step 5: Setup Frontend

Open a new PowerShell window:
```powershell
cd frontend
npm install
```

This installs all frontend dependencies (may take a few minutes).

### Step 6: Start the Application

From the project root directory:
```powershell
.\start_complete.ps1
```

This starts both the backend and frontend servers. The script will:
- Verify PostgreSQL is running
- Start the backend API server on port 8000
- Start the frontend web server on port 3000
- Display access URLs when ready

**Access Points:**
- Frontend Application: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs

---

## Getting Started

### Creating Your Account

1. Open http://localhost:8000/api/docs in your browser
2. Locate the `POST /api/v1/auth/register` endpoint
3. Click "Try it out"
4. Fill in your details:
   ```json
   {
     "email": "your-email@example.com",
     "username": "yourusername",
     "password": "securepassword",
     "full_name": "Your Full Name"
   }
   ```
5. Click "Execute"
6. You should receive a success response

### Logging In

1. In the API documentation, find `POST /api/v1/auth/login`
2. Click "Try it out"
3. Enter your email as username and your password
4. Click "Execute"
5. Copy the access token from the response
6. Click "Authorize" at the top of the page
7. Paste the token in the format: `Bearer YOUR_TOKEN`
8. You are now authenticated

Alternatively, navigate to http://localhost:3000 and use the login interface.

---

## Main Features Walkthrough

### Feature 1: Resume Upload and Ranking

This is the primary feature that demonstrates the AI capabilities of the system.

**Purpose:** Upload multiple resumes and automatically rank them against a job description using AI.

**How it works:**
The system uses a four-stage AI pipeline:
1. **FAISS Semantic Search**: Converts resumes and job descriptions into 384-dimensional vectors using sentence-transformers. Finds top candidates based on semantic similarity.
2. **CrossEncoder Reranking**: Applies a more sophisticated model to rerank candidates for improved accuracy.
3. **Top-N Selection**: Selects the specified number of best-matching candidates.
4. **LLM Explanation**: Uses the Phi-3-mini language model to generate human-readable explanations for why each candidate was selected.

**Steps to use:**

1. Navigate to http://localhost:3000/upload

2. Prepare your materials:
   - Multiple PDF resumes (up to 50 files)
   - A complete job description
   - List of required skills (optional)

3. Upload resumes:
   - Drag and drop PDF files into the upload area, or
   - Click the upload area to browse and select files
   - The system accepts only PDF format
   - You will see each file listed with its size

4. Provide job details:
   - **Job Title**: Enter the position title (e.g., "Senior Data Engineer")
   - **Job Description**: Paste the complete job description including responsibilities and qualifications
   - **Key Requirements**: Optional, enter specific requirements (one per line)
   - **Number of Top Candidates**: Select how many candidates to rank (5, 10, 15, or 20)

5. Click "Process & Rank Resumes"

6. The system will:
   - Extract text from each PDF
   - Identify skills using pattern matching
   - Create vector embeddings
   - Run the AI ranking pipeline
   - Store results in the database

7. View results:
   - A success notification appears
   - Results are saved to the database
   - Navigate to Jobs or Analytics to view ranked candidates

**Technical Details:**
- Resume text is chunked into 1000-character segments with 200-character overlap
- Skills are extracted using regex matching against 50+ common technical skills
- Embeddings use the all-MiniLM-L6-v2 model (384 dimensions)
- Match scores range from 0-100%, with 70%+ considered a strong match

### Feature 2: Job Management

**Purpose:** View and manage job postings, see matched candidates for each position.

**Steps to use:**

1. Navigate to http://localhost:3000/jobs

2. View existing jobs:
   - Jobs are displayed as cards with title, description, location, and status
   - Each card shows the job type (full-time, part-time, contract)
   - Active jobs are marked with a green indicator

3. Search and filter:
   - Use the search bar to find jobs by title or description
   - Results update in real-time as you type

4. View job details:
   - Click on any job card to see full details
   - View all candidates matched to this job
   - Candidates are sorted by match score (highest first)
   - Each candidate shows:
     - Name and contact information
     - Match score with color coding (green: 70%+, yellow: 50-69%, red: <50%)
     - Extracted skills
     - AI-generated match explanation

5. Match all resumes to a job:
   - Click the "Match All Resumes" button on a job card
   - The system runs the matching algorithm for all existing resumes
   - Results appear within seconds

6. Delete a job:
   - Click the trash icon on a job card
   - Confirm deletion
   - Associated matches are also removed

### Feature 3: Analytics Dashboard

**Purpose:** View comprehensive statistics and insights about your recruitment pipeline.

**Steps to use:**

1. Navigate to http://localhost:3000/analytics

2. Overview statistics:
   - **Total Resumes**: Count of all uploaded resumes
   - **Total Jobs**: Count of all job postings
   - **Total Matches**: Count of resume-job matches created
   - **Average Match Score**: Mean score across all matches

3. Skills distribution chart:
   - Shows the top 10 most common skills across ranked candidates
   - Bar chart with skill names and frequency counts
   - Helps identify the talent pool's strengths

4. Match quality distribution:
   - Visualizes how many candidates fall into each score range
   - Categories: High (70-100%), Medium (50-69%), Low (0-49%)
   - Pie chart shows proportions

5. Filter by job:
   - Use the dropdown to select a specific job
   - All charts update to show data for that job only
   - Useful for analyzing specific positions

6. Export data:
   - Click "Export Data" button
   - Downloads analytics as JSON file
   - Includes all statistics, matches, and scores
   - Can be imported into Excel or other tools

### Feature 4: Dashboard Overview

**Purpose:** Quick overview of key metrics and recent activity.

**Steps to use:**

1. Navigate to http://localhost:3000/dashboard

2. View summary cards:
   - Four cards display total resumes, jobs, matches, and average score
   - Each card shows the current count and a relevant icon

3. Recent activity:
   - Lists recent matches and uploads
   - Shows timestamps for each activity
   - Quick access to related items

4. Quick actions:
   - Buttons to navigate to upload, jobs, and analytics
   - Streamlined workflow for common tasks

### Feature 5: Natural Language Queries

**Purpose:** Ask questions about resumes and jobs using natural language.

**Steps to use:**

1. Access via API at http://localhost:8000/api/docs

2. Find the `/api/v1/chat/query` endpoint

3. Available query types:

   **General query:**
   - Endpoint: `POST /chat/query`
   - Ask questions like "Find candidates with Python and AWS experience"
   - The system searches the vector database and returns relevant results

   **Resume-specific query:**
   - Endpoint: `POST /chat/ask-resume/{resume_id}`
   - Ask questions about a specific resume
   - Example: "What is this candidate's experience with databases?"

   **Compare resumes:**
   - Endpoint: `POST /chat/compare-resumes`
   - Provide multiple resume IDs
   - Ask comparative questions like "Who has more cloud experience?"

   **Job analysis:**
   - Endpoint: `POST /chat/analyze-job/{job_id}`
   - Ask questions about a job posting
   - Example: "What skills are most important for this role?"

4. Each query returns:
   - An answer generated by the AI
   - Source documents used to generate the answer
   - Confidence score for the response

### Feature 6: Favorites Management

**Purpose:** Bookmark promising candidates for quick access.

**Steps to use:**

1. Navigate to http://localhost:3000/favorites

2. Add to favorites:
   - While viewing candidates, click the star icon
   - The resume is added to your favorites list

3. View favorites:
   - All bookmarked resumes appear on the favorites page
   - Displayed with match scores and key information

4. Remove from favorites:
   - Click the star icon again to unfavorite
   - Or use the remove button on the favorites page

### Feature 7: Notifications

**Purpose:** Receive alerts about important events.

**How it works:**
- Notifications appear in the top navigation bar
- Badge shows unread count
- Click the bell icon to view notifications

**Notification types:**
- High match found (score 70% or higher)
- Resume uploaded successfully
- Job created or updated
- Match processing complete

**Managing notifications:**
- Click a notification to view details
- Mark as read by clicking
- Click again to navigate to the related item

---

## Troubleshooting

### Backend server won't start

**Symptom:** Error messages when running `quickstart.ps1` or `start_complete.ps1`

**Solutions:**
1. Verify PostgreSQL is running:
   ```powershell
   Get-Service -Name "postgresql*"
   ```
   If not running, start it:
   ```powershell
   Start-Service postgresql*
   ```

2. Check the `.env` file in the backend directory:
   - Verify DATABASE_URL has the correct password
   - Ensure HUGGINGFACEHUB_API_TOKEN is set
   - Check SECRET_KEY is present

3. Reinstall dependencies:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

### Frontend won't load

**Symptom:** Cannot access http://localhost:3000

**Solutions:**
1. Check if the process is running:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000
   ```

2. Verify Node.js installation:
   ```powershell
   node --version
   npm --version
   ```

3. Reinstall dependencies:
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

4. Check if port 3000 is already in use by another application

### Database connection errors

**Symptom:** "Database connection failed" or authentication errors

**Solutions:**
1. Verify PostgreSQL credentials:
   - Open pgAdmin 4
   - Try connecting with your password
   - If it fails, reset the postgres password

2. Check database exists:
   ```powershell
   psql -U postgres -c "\l"
   ```
   Look for "resumematch" in the list

3. Recreate database:
   ```powershell
   cd backend
   .\setup_database.ps1
   ```

### Upload fails or processing errors

**Symptom:** Resume upload fails or shows error messages

**Solutions:**
1. Verify file format:
   - Only PDF files are supported
   - File size must be under 10MB
   - File should not be password-protected

2. Check backend logs:
   - View `$env:TEMP\backend.log`
   - Look for specific error messages

3. Verify HuggingFace token:
   - Check `.env` file has valid token
   - Test token at https://huggingface.co/settings/tokens

4. Restart the backend:
   ```powershell
   .\stop_all.ps1
   .\start_complete.ps1
   ```

### Slow performance or timeouts

**Symptom:** Operations take very long or timeout

**Solutions:**
1. Reduce number of resumes being processed at once
2. Lower the top_k parameter (default: 50)
3. Ensure sufficient RAM is available (close other applications)
4. Check internet connection (required for HuggingFace API calls)

### AI models not loading

**Symptom:** Warnings about models not available

**Solutions:**
1. Verify HuggingFace token is valid and has not expired
2. Check internet connectivity
3. Wait for models to download on first use (may take several minutes)
4. Check disk space is sufficient for model files

### Port already in use

**Symptom:** "Port 8000 already in use" or "Port 3000 already in use"

**Solutions:**
1. Stop all services:
   ```powershell
   .\stop_all.ps1
   ```

2. Force kill processes:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Stop-Process -Force
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
   ```

3. Restart:
   ```powershell
   .\start_complete.ps1
   ```

---

## Technical Support

For issues not covered in this manual:
1. Check the WINDOWS_SETUP_GUIDE.md for detailed setup instructions
2. Review backend logs at `$env:TEMP\backend.log`
3. Review frontend logs at `$env:TEMP\frontend.log`
4. Verify all prerequisites are correctly installed
5. Ensure firewall is not blocking ports 3000 and 8000

---

## Summary

ResumeMatch AI streamlines the recruitment process by automatically screening and ranking candidates using advanced AI techniques. The system combines semantic search, machine learning reranking, and natural language processing to provide accurate match scores and explanations. Users can upload resumes, create job postings, view analytics, and interact with the system through both a web interface and API endpoints.

The installation process requires PostgreSQL, Python, Node.js, and a HuggingFace API token. Once set up, the system operates with a backend API server and a frontend web application, both running locally. The main workflow involves uploading PDF resumes, providing job descriptions, and letting the AI pipeline rank candidates automatically.
