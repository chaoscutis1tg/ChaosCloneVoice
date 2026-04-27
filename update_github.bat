@echo off
echo ===================================================
echo     Pushing updates to GitHub
echo ===================================================
echo.

set /p message="Enter commit message (or press Enter for default 'Update source code'): "
if "%message%"=="" set message=Update source code

echo.
echo Adding changes...
git add .

echo.
echo Committing changes...
git commit -m "%message%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ===================================================
echo Done! Your updates have been pushed to GitHub.
echo ===================================================
pause
