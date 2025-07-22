#!/bin/bash

# ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
# │                                        CEYBYTE POS                                               │
# │                                                                                                  │
# │                                   Docker Setup Script                                           │
# │                                                                                                  │
# │  Description: Automated setup script for CeybytePOS Docker environment.                         │
# │               Handles development and production deployment scenarios.                           │
# │                                                                                                  │
# │  Author: Akash Hasendra                                                                          │
# │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
# │  License: MIT License with Sri Lankan Business Terms                                             │
# └──────────────────────────────────────────────────────────────────────────────────────────────────┘

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data
    mkdir -p backups
    mkdir -p logs
    
    print_success "Directories created"
}

# Function to set up environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    if [ ! -f .env ]; then
        cat > .env << EOF
# CeybytePOS Environment Configuration
JWT_SECRET_KEY=ceybyte-pos-secret-key-change-in-production-$(openssl rand -hex 32)
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CeybytePOS
VITE_COMPANY_NAME=Ceybyte.com
DATABASE_URL=sqlite:///./data/ceybyte_pos.db
CORS_ORIGINS=http://localhost:3000,http://localhost:80
EOF
        print_success "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Function to build and start services
start_production() {
    print_status "Starting production environment..."
    
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    print_success "Production environment started"
    print_status "Frontend: http://localhost"
    print_status "API: http://localhost:8000"
}

# Function to start development environment
start_development() {
    print_status "Starting development environment..."
    
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Development environment started"
    print_status "Frontend (Dev): http://localhost:3000"
    print_status "API (Dev): http://localhost:8000"
    print_status "DB Admin: http://localhost:8080"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    
    print_success "All services stopped"
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Function to show logs
show_logs() {
    local service=${1:-}
    
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Function to show help
show_help() {
    echo "CeybytePOS Docker Setup Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  prod, production    Start production environment"
    echo "  dev, development    Start development environment"
    echo "  stop               Stop all services"
    echo "  restart            Restart services"
    echo "  logs [service]     Show logs (optionally for specific service)"
    echo "  cleanup            Clean up Docker resources"
    echo "  status             Show service status"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev             # Start development environment"
    echo "  $0 prod            # Start production environment"
    echo "  $0 logs api        # Show API logs"
    echo "  $0 cleanup         # Clean up everything"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    echo ""
    docker-compose -f docker-compose.dev.yml ps
}

# Main script logic
main() {
    local command=${1:-help}
    
    case $command in
        "prod"|"production")
            check_docker
            create_directories
            setup_environment
            start_production
            ;;
        "dev"|"development")
            check_docker
            create_directories
            setup_environment
            start_development
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            start_production
            ;;
        "logs")
            show_logs $2
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            show_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"