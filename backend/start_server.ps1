# Start FastAPI Backend Server - Windows PowerShell Version

$backendDir = $PSScriptRoot

Write-Host "Starting FastAPI Backend Server..." -ForegroundColor Cyan
Write-Host "Directory: $backendDir" -ForegroundColor Gray
Write-Host ""

# Check if virtual environment exists
if (Test-Path "$backendDir\venv\Scripts\python.exe") {
    $pythonExe = "$backendDir\venv\Scripts\python.exe"
} elseif (Test-Path "$backendDir\..\venv\Scripts\python.exe") {
    $pythonExe = "$backendDir\..\venv\Scripts\python.exe"
} else {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run quickstart.ps1 first to set up the environment." -ForegroundColor Yellow
    exit 1
}

# Start the server
Set-Location $backendDir
& $pythonExe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
