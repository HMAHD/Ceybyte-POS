# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CeybytePOS is a modern Point of Sale system designed for Sri Lankan retail businesses. It's a cross-platform desktop application built with React, Tauri, and Python FastAPI, featuring offline-first architecture and multi-language support (English, Sinhala, Tamil).

## Key Technologies

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Ant Design
- **Desktop**: Tauri (Rust-based)
- **Backend**: Python FastAPI + SQLAlchemy + SQLite
- **Build Tools**: Vite (frontend), pnpm (package manager)
- **Deployment**: Docker + Docker Compose

## Essential Commands

### Development
```bash
# Start frontend dev server
pnpm dev

# Start Tauri desktop app
pnpm tauri dev

# Start Python API
cd src-tauri/python-api && python main.py
# or use the script:
scripts/start-api.bat

# Docker development (recommended)
./scripts/docker-setup.sh dev  # Linux/Mac
scripts/docker-setup.bat        # Windows
```

### Code Quality
```bash
# Linting
pnpm lint          # Check linting errors
pnpm lint:fix      # Auto-fix linting errors

# Formatting
pnpm format        # Format TypeScript/React code
pnpm format:check  # Check formatting without changes

# Type checking
pnpm type-check    # TypeScript type validation

# Format all code (TypeScript + Python)
scripts/format-code.bat  # Runs Prettier + Black + isort
```

### Building
```bash
# Build frontend for production
pnpm build

# Build Tauri desktop app
pnpm tauri build

# Docker production build
docker-compose build
docker-compose up -d
```

### Testing
```bash
# Run setup validation
python test-setup.py

# Test thermal printing
python test-thermal-printing.py

# Model tests
cd src-tauri/python-api && python test_models.py
```

## Architecture Overview

### Directory Structure
```
src/                    # React frontend
├── api/               # API client layer
├── components/        # React components
├── contexts/          # React contexts (Auth, Theme, Network)
├── hooks/             # Custom React hooks
├── i18n/              # Internationalization setup
├── locales/           # Translation files (en, si, ta)
├── types/             # TypeScript definitions
└── utils/             # Utility functions

src-tauri/
├── python-api/        # FastAPI backend
│   ├── api/          # API endpoints
│   ├── models/       # SQLAlchemy models
│   ├── database/     # Database setup
│   └── utils/        # Backend utilities
└── src/              # Rust code for Tauri

docker/                # Docker configurations
scripts/               # Development scripts
```

### Key API Endpoints
- `/api/auth/*` - Authentication (login, logout, refresh)
- `/api/users/*` - User management
- `/api/products/*` - Product CRUD
- `/api/sales/*` - Sales transactions
- `/api/customers/*` - Customer management
- `/api/settings/*` - System settings

### State Management
- **AuthContext**: Authentication state and user info
- **ThemeContext**: Theme configuration
- **NetworkContext**: Network mode (main/client computer)
- Form state: React Hook Form + Zod validation

### Database Models
Core models include: User, Product, Category, Customer, Supplier, Sale, SaleItem, Payment, CreditPayment, Settings, Terminal, AuditLog

### Authentication
- JWT-based with 8-hour expiry
- Default users: admin/admin123, cashier/cashier123, helper/helper123
- Mock authentication fallback for development
- PIN-based quick user switching

## Development Guidelines

### Code Style
- TypeScript: Use strict mode, define proper types
- React: Functional components with hooks
- Python: Follow PEP 8, use type hints
- All code must pass linting before commit
- Never use emoji's in coding and similer in other files use same ascii header in every newly created file head

### API Integration
- API base URL from environment: `VITE_API_BASE_URL`
- All API calls use the centralized `api` utility
- Error handling with proper user feedback
- Loading states for all async operations

### Internationalization
- Use `useTranslation` hook for all user-facing text
- Translation keys follow pattern: `section.component.text`
- Support for English (en), Sinhala (si), Tamil (ta)
- Number formatting respects locale

### Component Development
- Check existing components before creating new ones
- Follow Ant Design patterns for consistency
- Use Tailwind classes for styling
- Components should be typed with TypeScript

### Database Operations
- SQLite with WAL mode for concurrency
- All database operations through SQLAlchemy ORM
- Migrations handled manually
- Backup service runs in Docker production

### Thermal Printing
- Uses python-escpos library
- Sinhala/Tamil text is transliterated to ASCII
- Test with `test-thermal-printing.py`
- Printer settings in database

## Docker Development

### Quick Start
```bash
# Development with hot reload
./scripts/docker-setup.sh dev

# Production
./scripts/docker-setup.sh prod

# View logs
./scripts/docker-setup.sh logs
```

### Service URLs
- Frontend: http://localhost:3000 (dev) or http://localhost (prod)
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Docker Profiles
- `dev`: Development frontend with hot reload
- `backup`: Automated backup service
- `admin`: Database admin UI (development only)

## Common Tasks

### Adding a New Feature
1. Create TypeScript types in `src/types/`
2. Add API endpoint in `src-tauri/python-api/api/`
3. Create SQLAlchemy model if needed
4. Add API client method in `src/api/`
5. Build React component in `src/components/`
6. Add translations to locale files
7. Update routing if needed

### Adding Translations
1. Add keys to all locale files: `src/locales/{en,si,ta}/translation.json`
2. Use consistent key naming: `section.component.action`
3. Test all three languages

### Debugging
- Frontend: Browser DevTools + React DevTools
- Backend: FastAPI automatic docs at `/docs`
- Database: SQLite file at `src-tauri/python-api/ceybyte_pos.db`
- Logs: Check Docker logs or console output

## Important Notes

- Always use `pnpm` (not npm or yarn)
- Python backend requires Python 3.8+
- Database uses SQLite (no external DB required)
- All file paths in code should be absolute
- Thermal printers only support ASCII (auto-transliteration for Sinhala/Tamil)
- The app works offline-first with local data storage
- Multi-terminal support via network database sharing