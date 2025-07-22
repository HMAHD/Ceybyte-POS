@echo off
REM ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
REM │                                        CEYBYTE POS                                               │
REM │                                                                                                  │
REM │                                Docker Setup Script (Windows)                                    │
REM │                                                                                                  │
REM │  Description: Windows batch script for CeybytePOS Docker environment setup.                     │
REM │               Handles development and production deployment scenarios.                           │
REM │                                                                                                  │
REM │  Author: Akash Hasendra                                                                          │
REM │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
REM │  License: MIT License with Sri Lankan Business Terms                                             │
REM └──────────────────────────────────────────────────────────────────────────────────────────────────┘

setlocal enabledelayedexpansion

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
if not exist "data" mkdir data
if not exist "backups" mkdir backups
if not exist "logs" mkdir logs

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating environment file...
    (
        echo # CeybytePOS Environment Configuration
        echo JWT_SECRET_KEY=ceybyte-pos-secret-key-change-in-production
        echo VITE_API_BASE_URL=http://localhost:8000
        echo VITE_APP_NAME=CeybytePOS
        echo VITE_COMPANY_NAME=Ceybyte.com
        echo DATABASE_URL=sqlite:///./data/ceybyte_pos.db
        echo CORS_ORIGINS=http://localhost:3000,http://localhost:80
    ) > .env
    echo [SUCCESS] Environment file created
)

REM Parse command line argument
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=help

if "%COMMAND%"=="prod" goto :production
if "%COMMAND%"=="production" goto :production
if "%COMMAND%"=="dev" goto :development
if "%COMMAND%"=="development" goto :development
if "%COMMAND%"=="stop" goto :stop
if "%COMMAND%"=="restart" goto :restart
if "%COMMAND%"=="logs" goto :logs
if "%COMMAND%"=="cleanup" goto :cleanup
if "%COMMAND%"=="status" goto :status
if "%COMMAND%"=="help" goto :help
goto :help

:production
echo [INFO] Starting production environment...
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo [SUCCESS] Production environment started
echo [INFO] Frontend: http://localhost
echo [INFO] API: http://localhost:8000
goto :end

:development
echo [INFO] Starting development environment...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
echo [SUCCESS] Development environment started
echo [INFO] Frontend (Dev): http://localhost:3000
echo [INFO] API (Dev): http://localhost:8000
echo [INFO] DB Admin: http://localhost:8080
goto :end

:stop
echo [INFO] Stopping all services...
docker-compose down
docker-compose -f docker-compose.dev.yml down
echo [SUCCESS] All services stopped
goto :end

:restart
echo [INFO] Restarting services...
call :stop
timeout /t 2 /nobreak >nul
call :production
goto :end

:logs
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto :end

:cleanup
echo [INFO] Cleaning up Docker resources...
docker-compose down -v
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
echo [SUCCESS] Cleanup completed
goto :end

:status
echo [INFO] Service Status:
docker-compose ps
echo.
docker-compose -f docker-compose.dev.yml ps
goto :end

:help
echo CeybytePOS Docker Setup Script
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   prod, production    Start production environment
echo   dev, development    Start development environment
echo   stop               Stop all services
echo   restart            Restart services
echo   logs [service]     Show logs (optionally for specific service)
echo   cleanup            Clean up Docker resources
echo   status             Show service status
echo   help               Show this help message
echo.
echo Examples:
echo   %0 dev             # Start development environment
echo   %0 prod            # Start production environment
echo   %0 logs api        # Show API logs
echo   %0 cleanup         # Clean up everything
goto :end

:end
pause