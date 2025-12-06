# Resume Screening Application Startup Script for Windows
# PowerShell version

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 Resume Screening Application Startup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Blue
Set-Location $backendDir

# Check if virtual environment exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    $pythonExe = "venv\Scripts\python.exe"
} elseif (Test-Path "..\venv\Scripts\Activate.ps1") {
    $pythonExe = "..\venv\Scripts\python.exe"
} else {
    Write-Host "❌ Virtual environment not found. Please run quickstart.ps1 first." -ForegroundColor Red
    exit 1
}

# Start backend in background
$backendJob = Start-Process -FilePath $pythonExe -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -PassThru -WindowStyle Normal
Write-Host "✅ Backend started (PID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "   API Docs: http://localhost:8000/api/docs" -ForegroundColor Gray
Write-Host "   Health: http://localhost:8000/health" -ForegroundColor Gray
Write-Host ""

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Blue
Set-Location $frontendDir

$frontendJob = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Normal
Write-Host "✅ Frontend started (PID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host "   Application: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Both servers are running!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000/api/docs"
Write-Host "Frontend: http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers"
Write-Host ""
Write-Host "Process IDs saved:"
Write-Host "  Backend PID: $($backendJob.Id)"
Write-Host "  Frontend PID: $($frontendJob.Id)"
Write-Host ""

# Keep script running and wait for Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
        # Check if processes are still running
        if (-not (Get-Process -Id $backendJob.Id -ErrorAction SilentlyContinue)) {
            Write-Host "⚠️  Backend process stopped unexpectedly" -ForegroundColor Yellow
            break
        }
        if (-not (Get-Process -Id $frontendJob.Id -ErrorAction SilentlyContinue)) {
            Write-Host "⚠️  Frontend process stopped unexpectedly" -ForegroundColor Yellow
            break
        }
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
