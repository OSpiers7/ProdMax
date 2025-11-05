# Debug Authentication 403 Error
Write-Host "Debugging 403 Authentication Error..." -ForegroundColor Green
Write-Host ""

Write-Host "Fixes Applied:" -ForegroundColor Magenta
Write-Host "  - Updated token extraction to handle Zustand persist format" -ForegroundColor Green
Write-Host "  - Added fallback for token extraction (state.token or token)" -ForegroundColor Green
Write-Host "  - Added 403 error handling (redirects to login)" -ForegroundColor Green
Write-Host "  - Added console logging for debugging" -ForegroundColor Green
Write-Host ""

Write-Host "Debugging Steps:" -ForegroundColor Cyan
Write-Host "1. Open browser DevTools (F12)" -ForegroundColor White
Write-Host "2. Go to Console tab" -ForegroundColor White
Write-Host "3. Check for token warnings or errors" -ForegroundColor White
Write-Host "4. In Application/Storage tab, check localStorage" -ForegroundColor White
Write-Host "5. Look for 'auth-storage' key" -ForegroundColor White
Write-Host "6. Verify token exists and is valid" -ForegroundColor White
Write-Host ""

Write-Host "Common Issues:" -ForegroundColor Yellow
Write-Host "  - Token might be expired (1 hour expiration)" -ForegroundColor White
Write-Host "  - Token might not be stored correctly" -ForegroundColor White
Write-Host "  - Zustand persist format might be different" -ForegroundColor White
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
Write-Host "If 403 errors persist:" -ForegroundColor Red
Write-Host "  1. Logout and login again (to refresh token)" -ForegroundColor White
Write-Host "  2. Check browser console for 'Token not found' warnings" -ForegroundColor White
Write-Host "  3. Check Network tab to see Authorization header" -ForegroundColor White
Write-Host "  4. Verify JWT_SECRET in backend/.env matches" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
