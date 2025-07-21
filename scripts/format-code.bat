@echo off
REM ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
REM │                                        CEYBYTE POS                                               │
REM │                                                                                                  │
REM │                                  Code Formatting Script                                          │
REM │                                                                                                  │
REM │  Description: Format all code files using Prettier and Black.                                    │
REM │               Ensures consistent code style across the project.                                  │
REM │                                                                                                  │
REM │  Author: Akash Hasendra                                                                          │
REM │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
REM │  License: MIT License with Sri Lankan Business Terms                                             │
REM └──────────────────────────────────────────────────────────────────────────────────────────────────┘

echo Formatting CeybytePOS code...
echo.

echo 1. Formatting TypeScript/React files with Prettier...
call pnpm run format
if %errorlevel% neq 0 (
    echo Warning: Some files could not be formatted with Prettier
)

echo.
echo 2. Activating Python virtual environment...
call .venv\Scripts\activate

echo.
echo 3. Formatting Python files with Black...
python -m black src-tauri/python-api/ --line-length 88
if %errorlevel% neq 0 (
    echo Warning: Some Python files could not be formatted with Black
)

echo.
echo 4. Sorting Python imports with isort...
python -m isort src-tauri/python-api/ --profile black
if %errorlevel% neq 0 (
    echo Warning: Some Python imports could not be sorted
)

echo.
echo Code formatting complete!
echo.
pause