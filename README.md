# CeybytePOS

A modern, free Point of Sale system designed specifically for Sri Lankan retail businesses.

## Features

- **Multi-language Support**: English, Sinhala, and Tamil with offline font support
- **Offline-first**: Works without internet connection (including fonts)
- **Multi-terminal**: Connect multiple computers
- **Direct Printing**: Thermal receipt printing without dialogs
- **WhatsApp Integration**: Send receipts and reports
- **Customer Credit Management**: Digital credit book system
- **Supplier Credit Tracking**: Manage supplier payments
- **Power Cut Management**: UPS monitoring and auto-save
- **Sri Lankan Business Features**: Festival calendar, area grouping, local payment methods

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Desktop**: Tauri (Rust)
- **Backend**: Python FastAPI
- **Database**: SQLite with network sharing
- **Printing**: ESC/POS thermal printers

## Development Setup

### Prerequisites

- Node.js 18+
- Rust (for Tauri)
- Python 3.8+
- pnpm package manager
- uv (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ceybyte-POS
   ```

2. **Install uv (Python package manager)**
   ```bash
   # Windows
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. **Set up Python virtual environment**
   ```bash
   uv venv
   # Windows
   .venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```

4. **Install Python dependencies**
   ```bash
   uv pip install -r src-tauri/python-api/requirements.txt
   ```

5. **Install Node.js dependencies**
   ```bash
   pnpm install
   ```

### Development

1. **Start the Python API** (in terminal 1):
   ```bash
   # Make sure virtual environment is activated
   python src-tauri/python-api/main.py
   ```
   API will be available at: http://127.0.0.1:8000

2. **Start the frontend development server** (in terminal 2):
   ```bash
   pnpm run dev
   ```
   Frontend will be available at: http://localhost:3000

3. **Start Tauri development** (in terminal 3):
   ```bash
   pnpm run tauri dev
   ```

### Building for Production

```bash
# Build frontend
pnpm run build

# Build Tauri app
pnpm run tauri build
```

### API Endpoints

- Health Check: `GET http://127.0.0.1:8000/health`
- API Documentation: `GET http://127.0.0.1:8000/docs` (FastAPI auto-generated docs)

### Font Support

The application uses system fonts for offline support:
- **English**: Segoe UI, Tahoma, Geneva, Verdana
- **Sinhala**: Nirmala UI, Iskoola Pota (Windows system fonts)
- **Tamil**: Nirmala UI, Latha (Windows system fonts)
- **POS Display**: Consolas, Courier New (monospace for receipts)

No internet connection required for font loading.

### Thermal Printing Multi-Language Support

**Important Note**: Thermal printers have limited character set support. Here's how CeybytePOS handles multi-language printing:

#### Character Set Limitations
- Most thermal printers support only ASCII characters (CP437, ISO-8859-1)
- Sinhala and Tamil characters are **not directly supported** by thermal printers
- Unicode characters will be **transliterated to ASCII equivalents**

#### How Multi-Language Printing Works

1. **English Text**: Prints directly without modification
2. **Sinhala Text**: Automatically converted to ASCII equivalents
   - Example: `අ` → `a`, `ක` → `ka`, `සාම්පල්` → `sample`
3. **Tamil Text**: Automatically converted to ASCII equivalents
   - Example: `அ` → `a`, `க` → `ka`, `மாதிரி` → `mathiri`

#### Supported Thermal Printers
- **Epson TM Series**: TM-T20, TM-T82 (most common in Sri Lanka)
- **Star TSP Series**: TSP100, TSP650
- **Generic 80mm/58mm**: Most ESC/POS compatible printers

#### Receipt Example
```
        SAMPLE SHOP
    කොළඹ, ශ්‍රී ලංකාව
   Colombo, Sri Lanka
   Tel: +94 11 234 5678
================================
Receipt No: R001
Date: 2025-01-22 10:30 AM
--------------------------------
බත් / Rice        2 x Rs. 150.00
                        Rs. 300.00
කිරි / Milk        1 x Rs. 200.00
                        Rs. 200.00
--------------------------------
Subtotal:               Rs. 500.00
Tax:                     Rs. 75.00
TOTAL:                  Rs. 575.00

Payment: මුදල් / Cash
Change: Rs. 25.00
================================
        ස්තූතියි!
        Thank You!
    Powered by Ceybyte.com
```

#### Thermal Printing Features
- Direct ESC/POS command printing (no Windows dialogs)
- Automatic paper cutting
- Cash drawer control
- Receipt formatting with proper alignment
- Multi-language transliteration
- Printer auto-detection
- Error handling and retry logic

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── api/               # API client
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── locales/           # Translation files
│   └── assets/            # Static assets
├── src-tauri/             # Tauri backend
│   ├── python-api/        # Python FastAPI backend
│   └── src/               # Rust code
└── .kiro/                 # Kiro IDE specifications
    └── specs/pos-system/  # Project specifications
```

## License

Free to use for Sri Lankan retail businesses.

**Powered by Ceybyte.com**

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
