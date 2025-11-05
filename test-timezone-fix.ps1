# Test Calendar Timezone Fix
Write-Host "Testing Calendar Timezone Fix..." -ForegroundColor Green
Write-Host ""

Write-Host "Timezone Fix Applied:" -ForegroundColor Magenta
Write-Host "  - Added formatLocalDateTime() helper function" -ForegroundColor Green
Write-Host "  - Calendar click times now preserve local timezone" -ForegroundColor Green
Write-Host "  - Form inputs show correct local times" -ForegroundColor Green
Write-Host "  - No more 4-hour offset issue" -ForegroundColor Green
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
Write-Host "Test Steps:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:5173" -ForegroundColor White
Write-Host "2. Click Calendar in sidebar" -ForegroundColor White
Write-Host "3. Click and drag on calendar at a specific time" -ForegroundColor White
Write-Host "4. Check that form shows the SAME time you clicked" -ForegroundColor White
Write-Host "5. Create the event" -ForegroundColor White
Write-Host "6. Verify event appears at the correct time" -ForegroundColor White
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Cyan
Write-Host "  - Click at 2:00 PM → Form shows 2:00 PM" -ForegroundColor White
Write-Host "  - Drag for 1 hour → Form shows 2:00 PM - 3:00 PM" -ForegroundColor White
Write-Host "  - Event appears at correct time on calendar" -ForegroundColor White
Write-Host "  - No timezone offset issues" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
