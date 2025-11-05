# Test Calendar 400 Error Fix
Write-Host "Testing Calendar 400 Error Fix..." -ForegroundColor Green
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
Write-Host "400 Error Fix Applied:" -ForegroundColor Magenta
Write-Host "  - Added start/end date parameters to API calls" -ForegroundColor Green
Write-Host "  - Added proper error handling" -ForegroundColor Green
Write-Host "  - Added error display in UI" -ForegroundColor Green
Write-Host "  - Reduced retry attempts to prevent spam" -ForegroundColor Green
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Cyan
Write-Host "  - No 400 errors in console" -ForegroundColor White
Write-Host "  - Calendar loads without errors" -ForegroundColor White
Write-Host "  - Task creation works" -ForegroundColor White
Write-Host "  - Events appear on calendar" -ForegroundColor White
Write-Host ""
Write-Host "Test Steps:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:5173" -ForegroundColor White
Write-Host "2. Login/Register if needed" -ForegroundColor White
Write-Host "3. Click Calendar in sidebar" -ForegroundColor White
Write-Host "4. Check browser console for errors" -ForegroundColor White
Write-Host "5. Try creating a task" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
