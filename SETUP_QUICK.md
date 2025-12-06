# 🚀 QUICK SETUP - Windows 11

## ⚡ Fast Track (5 Steps)

### Step 1: Install Requirements (One-time)
1. **Python 3.9+**: https://www.python.org/downloads/ (Check "Add to PATH")
2. **Node.js 18+**: https://nodejs.org/ (LTS version)
3. **PostgreSQL 12+**: https://www.postgresql.org/download/windows/
   - **IMPORTANT**: Remember your postgres password!
4. **HuggingFace Token**: https://huggingface.co/settings/tokens

### Step 2: Setup Database
```powershell
cd "c:\Users\afsah\Downloads\resume-screening-main\resume-screening-main\backend"
.\setup_database.ps1
```
- Enter your PostgreSQL password
- Database `resumematch` will be created

### Step 3: Setup Backend
```powershell
.\quickstart.ps1
```
When prompted:
- Database URL: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/resumematch`
- HuggingFace Token: Paste your token
- Secret Key: Press Enter (auto-generate)
- Start server now? Type `n` (we'll use the easy method)

### Step 4: Setup Frontend
```powershell
cd ..\frontend
npm install
```

### Step 5: Start Everything!
```powershell
cd ..
.\start_complete.ps1
```

## ✅ Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

## 🎯 First Time Use

1. Go to: http://localhost:8000/api/docs
2. Find `POST /api/v1/auth/register`
3. Click "Try it out"
4. Create account:
   ```json
   {
     "email": "admin@example.com",
     "username": "admin",
     "password": "admin123",
     "full_name": "Admin User"
   }
   ```
5. Click "Execute"
6. Use those credentials to log in!

## 🛑 Stop Services
```powershell
.\stop_all.ps1
```

## 🔧 Troubleshooting

### "PostgreSQL not found"
Add to PATH: `C:\Program Files\PostgreSQL\15\bin`

### "Virtual environment not found"
```powershell
cd backend
.\quickstart.ps1
```

### "Port already in use"
```powershell
.\stop_all.ps1
# Then start again
.\start_complete.ps1
```

### "Database connection failed"
Check `.env` file in backend folder has correct password

## 📝 What Got Cleaned Up

✅ Deleted all `.sh` files (Linux scripts - not needed)
✅ Deleted all `.gitignore` files (Git - not needed)
✅ Deleted all `__pycache__` folders (Python cache - not needed)
✅ Deleted `.git` directory (Git - not needed)

## 📁 New Windows Scripts Created

- `start_complete.ps1` - Start everything (RECOMMENDED)
- `start_all.ps1` - Start both servers
- `stop_all.ps1` - Stop all services
- `backend\quickstart.ps1` - First-time setup
- `backend\setup_database.ps1` - Database creation
- `backend\start_server.ps1` - Backend only

## 🎉 That's It!

You're ready to use ResumeMatch AI on Windows 11!
