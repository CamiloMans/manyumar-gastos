@echo off
cd /d "%~dp0"
echo === Limpiando lock files ===
del /f /q .git\index.lock 2>nul
del /f /q .git\HEAD.lock 2>nul
del /f /q .git\objects\maintenance.lock 2>nul

echo === Revirtiendo commit malo ===
git reset HEAD~1

echo === Haciendo commit correcto ===
git config user.email "lab@myma.cl"
git config user.name "Cami"
git add package.json src\App.jsx
git commit -m "Ajustes: selectores de empresa, categorias, detalles y origenes de ingreso configurables"

echo === Pusheando a origin/main ===
git push origin main

echo.
echo === LISTO! Presiona cualquier tecla para cerrar ===
pause
