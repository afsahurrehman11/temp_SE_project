# PostgreSQL Database Setup Script for Windows
# PowerShell version

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "PostgreSQL Database Setup Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    Write-Host "📦 PostgreSQL is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download and install PostgreSQL from:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "During installation:" -ForegroundColor Yellow
    Write-Host "  1. Remember your postgres user password" -ForegroundColor Gray
    Write-Host "  2. Use default port 5432" -ForegroundColor Gray
    Write-Host "  3. Enable 'PostgreSQL Server' and 'pgAdmin 4'" -ForegroundColor Gray
    Write-Host ""
    exit 1
} else {
    Write-Host "✅ PostgreSQL is already installed" -ForegroundColor Green
}

# Check if PostgreSQL service is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne "Running") {
        Write-Host ""
        Write-Host "🚀 Starting PostgreSQL service..." -ForegroundColor Blue
        Start-Service $pgService.Name
        Write-Host "✅ PostgreSQL service started" -ForegroundColor Green
    } else {
        Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  PostgreSQL service not found. It may be installed differently." -ForegroundColor Yellow
}

# Prompt for PostgreSQL password
Write-Host ""
Write-Host "🔐 Please enter your PostgreSQL password for user 'postgres':" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword))

# Set PGPASSWORD environment variable for this session
$env:PGPASSWORD = $pgPasswordPlain

# Test connection
Write-Host ""
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Blue
$testConnection = & psql -U postgres -c "SELECT 'Connection successful!' as status;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database connection test passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection test failed" -ForegroundColor Red
    Write-Host "Error: $testConnection" -ForegroundColor Red
    exit 1
}

# Create database
Write-Host ""
Write-Host "🗄️  Creating database 'resumematch'..." -ForegroundColor Blue

# Check if database exists
$dbExists = & psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'resumematch';" 2>&1
if ($dbExists -eq "1") {
    Write-Host "✅ Database 'resumematch' already exists" -ForegroundColor Green
} else {
    & psql -U postgres -c "CREATE DATABASE resumematch;" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database 'resumematch' created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

# Test database connection
Write-Host ""
Write-Host "🔍 Testing database connection..." -ForegroundColor Blue
$dbTest = & psql -U postgres -d resumematch -c "SELECT 'Connection successful!' as status;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'resumematch' connection test passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Database connection test failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "✅ Database Setup Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database Details:" -ForegroundColor Cyan
Write-Host "  - Database: resumematch" -ForegroundColor Gray
Write-Host "  - Host: localhost" -ForegroundColor Gray
Write-Host "  - Port: 5432" -ForegroundColor Gray
Write-Host "  - User: postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "Your .env file should have:" -ForegroundColor Yellow
Write-Host "DATABASE_URL=postgresql://postgres:$pgPasswordPlain@localhost:5432/resumematch" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now you can start the backend server:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Gray
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = ""
