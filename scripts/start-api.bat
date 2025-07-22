@echo off
echo Starting CeybytePOS Python API...
echo.

cd src-tauri\python-api

echo Checking if database exists...
if not exist ceybyte_pos.db (
    echo Database not found. Initializing...
    python init_db.py
    echo.
)

echo Starting FastAPI server...
python main.py

pause