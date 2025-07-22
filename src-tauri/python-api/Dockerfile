# ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                        CEYBYTE POS                                               │
# │                                                                                                  │
# │                                   Python API Dockerfile                                          │
# │                                                                                                  │
# │  Description: Docker configuration for CeybytePOS Python FastAPI backend.                        │
# │               Multi-stage build for optimized production image.                                  │
# │                                                                                                  │
# │  Author: Akash Hasendra                                                                          │
# │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
# │  License: MIT License with Sri Lankan Business Terms                                             │
# └──────────────────────────────────────────────────────────────────────────────────────────────────┘

# Use Python 3.11 slim image for smaller size
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create database directory
RUN mkdir -p /app/data

# Initialize database
RUN python init_db.py

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["python", "main.py"]