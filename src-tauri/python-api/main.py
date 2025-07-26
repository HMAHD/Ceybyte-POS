"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                   Python FastAPI Backend                                        ║
║                                                                                                  ║
║  Description: Main FastAPI application entry point for CeybytePOS backend API.                  ║
║               Provides REST endpoints for the Tauri frontend application.                       ║
║                                                                                                  ║
║  Author: Ceybyte Development Team                                                                ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(
    title="CeybytePOS API",
    description="Backend API for CeybytePOS - Sri Lankan Point of Sale System",
    version="1.0.0"
)

# Configure CORS for Tauri frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:1420", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "CeybytePOS API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "CeybytePOS API"}

# API Routes
from api.auth import router as auth_router
from api.products import router as products_router
from api.categories import router as categories_router
from api.units import router as units_router
from api.customers import router as customers_router
from api.suppliers import router as suppliers_router
from api.sales import router as sales_router
from api.whatsapp import router as whatsapp_router
from api.terminals import router as terminals_router
from routes.printer import router as printer_router

# Include routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(units_router)
app.include_router(customers_router)
app.include_router(suppliers_router)
app.include_router(sales_router)
app.include_router(whatsapp_router)
app.include_router(terminals_router)
app.include_router(printer_router)

if __name__ == "__main__":
    # This will be called when running the API standalone for development
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )