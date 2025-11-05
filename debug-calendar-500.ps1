# Debug Calendar 500 Error
Write-Host "Debugging Calendar 500 Error..." -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server with Debug Logging..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "Starting Frontend Server with Debug Logging..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Debug Logging Added:" -ForegroundColor Magenta
Write-Host "  - Frontend: Logs event data being sent" -ForegroundColor Green
Write-Host "  - Backend: Logs received request and user ID" -ForegroundColor Green
Write-Host "  - Backend: Logs database operation details" -ForegroundColor Green
Write-Host "  - Enhanced error messages with specific details" -ForegroundColor Green
Write-Host ""
Write-Host "Debug Steps:" -ForegroundColor Cyan
Write-Host "1. Go to http://localhost:5173" -ForegroundColor White
Write-Host "2. Login/Register if needed" -ForegroundColor White
Write-Host "3. Click Calendar in sidebar" -ForegroundColor White
Write-Host "4. Click on calendar or 'Add Task' button" -ForegroundColor White
Write-Host "5. Fill out the form with:" -ForegroundColor White
Write-Host "   - Title: 'Test Event'" -ForegroundColor White
Write-Host "   - Description: 'Test Description'" -ForegroundColor White
Write-Host "   - Select a category" -ForegroundColor White
Write-Host "6. Click 'Create Event'" -ForegroundColor White
Write-Host "7. Check browser console for detailed logs" -ForegroundColor White
Write-Host "8. Check backend terminal for server logs" -ForegroundColor White
Write-Host ""
Write-Host "Look for these specific logs:" -ForegroundColor Yellow
Write-Host "  - 'Sending event data:' (Frontend)" -ForegroundColor White
Write-Host "  - 'Received calendar event request:' (Backend)" -ForegroundColor White
Write-Host "  - 'User ID:' (Backend)" -ForegroundColor White
Write-Host "  - 'Creating calendar event with data:' (Backend)" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
