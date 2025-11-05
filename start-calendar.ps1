# Start ProdMax with Calendar Focus
Write-Host "Starting ProdMax with Calendar Implementation..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Calendar Features Implemented:" -ForegroundColor Magenta
Write-Host "  ✅ Google Calendar-like interface" -ForegroundColor Green
Write-Host "  ✅ Week and Month views" -ForegroundColor Green
Write-Host "  ✅ Click to create events" -ForegroundColor Green
Write-Host "  ✅ Task form with all fields" -ForegroundColor Green
Write-Host "  ✅ Focus session toggle" -ForegroundColor Green
Write-Host "  ✅ Category-based color coding" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
