@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Chaos Studio - Frontend Dev Server
if exist "C:\Program Files\nodejs" set "PATH=C:\Program Files\nodejs;%PATH%"
npm run dev
pause
