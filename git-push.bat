@echo off
cd /d "%~dp0"
git config user.email "lab@myma.cl"
git config user.name "Cami"
git add src\App.jsx src\styles.css
git commit -m "Header: botones mas grandes y mas separados"
git push origin main
echo.
echo === LISTO! ===
pause
