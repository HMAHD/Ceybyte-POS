@echo off
REM ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
REM │                                        CEYBYTE POS                                               │
REM │                                                                                                  │
REM │                                Development Setup Script                                          │
REM │                                                                                                  │
REM │  Description: Windows batch script to set up development environment.                            │
REM │               Installs dependencies and configures development tools.                            │
REM │                                                                                                  │
REM │  Author: Akash Hasendra                                                                          │
REM │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
REM │  License: MIT License with Sri Lankan Business Terms                                             │
REM └──────────────────────────────────────────────────────────────────────────────────────────────────┘

echo Setting up CeybytePOS Development Environment...
echo.

echo 1. Installing Node.js dependencies...
call pnpm install
if %errorlevel% neq 0 (
    echo Error: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo 2. Activating Python virtual environment...
call .venv\Scripts\activate
if %errorlevel% neq 0 (
    echo Error: Failed to activate Python virtual environment
    pause
    exit /b 1
)

echo.
echo 3. Installing Python dependencies...
python -m pip install -r src-tauri/python-api/requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo 4. Setting up environment files...
if not exist .env (
    copy .env.development .env
    echo Created .env file from development template
)

echo.
echo 5. Running code quality checks...
call pnpm run lint
call pnpm run format:check
call pnpm run type-check

echo.
echo Development environment setup complete!
echo.
echo To start development:
echo   1. Frontend: pnpm run dev
echo   2. Backend:  python src-tauri/python-api/main.py
echo   3. Tauri:    pnpm run tauri dev
echo.
pause