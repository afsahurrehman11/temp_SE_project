# ResumeMatch AI - Complete Startup Script for Windows
# PowerShell version

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "   ResumeMatch AI - Complete Startup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = $PSScriptRoot
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"

# Cleanup function
function Stop-AllProcesses {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    
    # Stop by port
    $ports = @(8000, 3000)
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "✓ All services stopped" -ForegroundColor Green
    exit 0
}

# Kill any existing processes
Write-Host "Stopping any existing processes..." -ForegroundColor Blue
$ports = @(8000, 3000)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2
Write-Host "✓ Cleaned up" -ForegroundColor Green
Write-Host ""

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Blue
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgService -or $pgService.Status -ne "Running") {
    Write-Host "⚠️  PostgreSQL is not running." -ForegroundColor Yellow
    $response = Read-Host "Do you want to start PostgreSQL? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        if ($pgService) {
            Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow
            Start-Service $pgService.Name
            if ((Get-Service $pgService.Name).Status -eq "Running") {
                Write-Host "✓ PostgreSQL started" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to start PostgreSQL. Please start it manually." -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "❌ PostgreSQL service not found. Please install PostgreSQL." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ PostgreSQL is required. Exiting." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
}
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Blue
if (-not (Test-Path $backendDir)) {
    Write-Host "❌ Backend directory not found at $backendDir" -ForegroundColor Red
    exit 1
}

Set-Location $backendDir

# Check for venv
$pythonExe = $null
if (Test-Path "venv\Scripts\python.exe") {
    $pythonExe = "venv\Scripts\python.exe"
} elseif (Test-Path "..\venv\Scripts\python.exe") {
    $pythonExe = "..\venv\Scripts\python.exe"
}

if (-not $pythonExe) {
    Write-Host "❌ Virtual environment not found. Please run quickstart.ps1 first." -ForegroundColor Red
    exit 1
}

# Check if demo data exists (requires psql)
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlCmd) {
    $resumeCount = & psql -U postgres -d resumematch -tAc "SELECT COUNT(*) FROM resumes;" 2>$null
    if ($resumeCount -eq "0") {
        Write-Host "Creating demo data..." -ForegroundColor Yellow
        & $pythonExe create_demo_data.py
        Write-Host "✓ Demo data created" -ForegroundColor Green
    }
}

# Start backend
$backendJob = Start-Process -FilePath $pythonExe -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000" -PassThru -WindowStyle Normal -RedirectStandardOutput "$env:TEMP\backend.log" -RedirectStandardError "$env:TEMP\backend_error.log"
Write-Host "✓ Backend started (PID: $($backendJob.Id))" -ForegroundColor Green
Write-Host ""

# Wait for backend to be ready
Write-Host "Waiting for backend to initialize..." -ForegroundColor Blue
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline
    $attempt++
}
Write-Host ""

if ($backendReady) {
    Write-Host "✓ Backend is ready" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend may not be fully ready yet" -ForegroundColor Yellow
}
Write-Host ""

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Blue
if (-not (Test-Path $frontendDir)) {
    Write-Host "❌ Frontend directory not found at $frontendDir" -ForegroundColor Red
    Stop-AllProcesses
}

Set-Location $frontendDir

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    "NEXT_PUBLIC_API_URL=http://localhost:8000" | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✓ Created .env.local" -ForegroundColor Green
}

$frontendJob = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Normal -RedirectStandardOutput "$env:TEMP\frontend.log" -RedirectStandardError "$env:TEMP\frontend_error.log"
Write-Host "✓ Frontend starting (PID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""

# Wait for frontend to be ready
Write-Host "Waiting for frontend to initialize..." -ForegroundColor Blue
$attempt = 0
$frontendReady = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline
    $attempt++
}
Write-Host ""

if ($frontendReady) {
    Write-Host "✓ Frontend is ready" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend may not be fully ready yet" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "==============================================" -ForegroundColor Green
Write-Host "✅ All Services Started Successfully!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Services:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "👤 Demo Login:" -ForegroundColor Cyan
Write-Host "   Email:     demo@example.com" -ForegroundColor White
Write-Host "   Password:  demo123" -ForegroundColor White
Write-Host ""
Write-Host "📊 Quick Links:" -ForegroundColor Cyan
Write-Host "   Upload:    http://localhost:3000/upload" -ForegroundColor White
Write-Host "   Analytics: http://localhost:3000/analytics" -ForegroundColor White
Write-Host "   Dashboard: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📝 Logs:" -ForegroundColor Cyan
Write-Host "   Backend:   $env:TEMP\backend.log" -ForegroundColor White
Write-Host "   Frontend:  $env:TEMP\frontend.log" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running and handle Ctrl+C
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
    Stop-AllProcesses
}
