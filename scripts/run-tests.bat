@echo off
REM 
REM ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
REM ║                                        CEYBYTE POS                                               ║
REM ║                                                                                                  ║
REM ║                                    Test Runner Script                                            ║
REM ║                                                                                                  ║
REM ║  Description: Windows batch script to run CeybytePOS setup tests with virtual environment.       ║
REM ║               Activates Python venv and runs the test script.                                    ║
REM ║                                                                                                  ║
REM ║  Author: Akash Hasendra                                                                          ║
REM ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
REM ║  License: MIT License with Sri Lankan Business Terms                                             ║
REM ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
REM

echo Testing CeybytePOS Setup...
call .venv\Scripts\activate
python test-setup.py
pause