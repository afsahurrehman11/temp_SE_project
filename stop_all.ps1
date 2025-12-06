# Stop Resume Screening Application - Windows PowerShell Version

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🛑 Resume Screening Application Shutdown" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill process by port
function Stop-ProcessByPort {
    param(
        [int]$Port,
        [string]$Name
    )
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Stopping $Name (Port $Port, PID: $($process.Id))..." -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force
                Start-Sleep -Seconds 1
                Write-Host "✅ $Name stopped" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "ℹ️  $Name not running on port $Port" -ForegroundColor Gray
    }
}

# Function to kill process by name
function Stop-ProcessByName {
    param(
        [string]$ProcessName,
        [string]$DisplayName
    )
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    
    if ($processes) {
        Write-Host "Stopping $DisplayName processes..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 1
        Write-Host "✅ $DisplayName stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No $DisplayName processes found" -ForegroundColor Gray
    }
}

# Stop Backend (Port 8000)
Write-Host "Stopping Backend Server..." -ForegroundColor Blue
Stop-ProcessByPort -Port 8000 -Name "Backend"
Write-Host ""

# Stop Frontend (Port 3000)
Write-Host "Stopping Frontend Server..." -ForegroundColor Blue
Stop-ProcessByPort -Port 3000 -Name "Frontend"
Write-Host ""

# Stop any remaining Python processes (uvicorn)
Write-Host "Stopping any remaining Python/Uvicorn processes..." -ForegroundColor Blue
Get-Process | Where-Object { $_.ProcessName -like "*python*" -and $_.CommandLine -like "*uvicorn*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host ""

# Stop any remaining Node processes
Write-Host "Stopping any remaining Node.js processes..." -ForegroundColor Blue
Stop-ProcessByName -ProcessName "node" -DisplayName "Node.js"
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ All services stopped successfully" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
