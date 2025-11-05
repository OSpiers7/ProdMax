# Test Focus Timer Feature
Write-Host "Testing Focus Timer Feature..." -ForegroundColor Green
Write-Host ""

Write-Host "Features Implemented:" -ForegroundColor Magenta
Write-Host "  - FocusTimer component with 90-minute countdown" -ForegroundColor Green
Write-Host "  - 'Start Focus Session' button appears 5 minutes before focus sessions" -ForegroundColor Green
Write-Host "  - Timer displays task name, description, category & subcategory" -ForegroundColor Green
Write-Host "  - Visual progress indicator with circular progress" -ForegroundColor Green
Write-Host "  - Start/Pause/Stop controls" -ForegroundColor Green
Write-Host "  - Completion message when timer finishes" -ForegroundColor Green
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
Write-Host "2. Login/Register if needed" -ForegroundColor White
Write-Host "3. Navigate to Calendar" -ForegroundColor White
Write-Host "4. Create a new event:" -ForegroundColor White
Write-Host "   - Click on calendar or 'Add Task' button" -ForegroundColor White
Write-Host "   - Set time to 5 minutes from now (e.g., if now is 2:00 PM, set to 2:05 PM)" -ForegroundColor White
Write-Host "   - Enter title and description" -ForegroundColor White
Write-Host "   - Check 'This is a focus session' checkbox" -ForegroundColor White
Write-Host "   - Select category and subcategory" -ForegroundColor White
Write-Host "   - Click 'Create Event'" -ForegroundColor White
Write-Host "5. Wait a moment - 'Start Focus Session' button should appear on the event" -ForegroundColor White
Write-Host "6. Click 'Start Focus Session' button" -ForegroundColor White
Write-Host "7. Focus Timer should open showing:" -ForegroundColor White
Write-Host "   - Task name and description" -ForegroundColor White
Write-Host "   - Category and subcategory" -ForegroundColor White
Write-Host "   - 90-minute countdown timer" -ForegroundColor White
Write-Host "   - Circular progress indicator" -ForegroundColor White
Write-Host "   - Start/Pause/Stop controls" -ForegroundColor White
Write-Host ""
Write-Host "Expected Behavior:" -ForegroundColor Cyan
Write-Host "  - Button appears when event is 5 minutes away" -ForegroundColor White
Write-Host "  - Timer counts down from 90:00 to 00:00" -ForegroundColor White
Write-Host "  - Progress circle fills as time progresses" -ForegroundColor White
Write-Host "  - Can pause and resume timer" -ForegroundColor White
Write-Host "  - Completion message when timer reaches zero" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
