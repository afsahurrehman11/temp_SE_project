# Quick Start Script for ResumeMatch Backend - Windows PowerShell Version

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "🚀 ResumeMatch Backend Quick Start" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "❌ Python is not installed. Please install Python 3.9 or higher." -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

$pythonVersion = & python --version 2>&1
Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green

# Check if PostgreSQL is installed
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    Write-Host "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed." -ForegroundColor Yellow
    Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
} else {
    Write-Host "✓ PostgreSQL client found" -ForegroundColor Green
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host ""
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Blue
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Blue
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Blue
python -m pip install --upgrade pip
pip install -r requirements.txt

# Run setup script
Write-Host ""
Write-Host "⚙️  Running setup script..." -ForegroundColor Blue
python setup.py

# Ask if user wants to start the server
Write-Host ""
$response = Read-Host "🚀 Start the development server now? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Starting server at http://localhost:8000" -ForegroundColor Green
    Write-Host "API Documentation: http://localhost:8000/api/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
} else {
    Write-Host ""
    Write-Host "To start the server manually, run:" -ForegroundColor Cyan
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "  uvicorn app.main:app --reload" -ForegroundColor Yellow
}
