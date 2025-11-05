# ProdMax Restart Development Script
Write-Host "Restarting ProdMax Development Servers..." -ForegroundColor Green
Write-Host ""

# Kill any existing processes on ports 3001 and 5173
Write-Host "Stopping existing servers..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*3001*" -or $_.MainWindowTitle -like "*5173*" } | Stop-Process -Force
} catch {
    Write-Host "No existing servers found" -ForegroundColor Gray
}

# Wait a moment
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are restarting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
