@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-windows.ps1" %*
if errorlevel 1 (
  echo.
  echo Deployment failed. Review the message above and logs in work\windows-deployment.
  pause
  exit /b 1
)
endlocal
