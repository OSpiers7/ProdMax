# Test Calendar Fix
Write-Host "Testing Calendar Fix - Backend API Updated..." -ForegroundColor Green
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
Write-Host "Calendar Fix Applied:" -ForegroundColor Magenta
Write-Host "  - Backend API now handles title/description" -ForegroundColor Green
Write-Host "  - Form validation improved" -ForegroundColor Green
Write-Host "  - Error handling added" -ForegroundColor Green
Write-Host "  - Task creation should work" -ForegroundColor Green
Write-Host ""
Write-Host "Test Steps:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:5173" -ForegroundColor White
Write-Host "2. Click Calendar in sidebar" -ForegroundColor White
Write-Host "3. Click on calendar or 'Add Task' button" -ForegroundColor White
Write-Host "4. Fill form with title and description" -ForegroundColor White
Write-Host "5. Click 'Create Event'" -ForegroundColor White
Write-Host "6. Event should appear on calendar" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
