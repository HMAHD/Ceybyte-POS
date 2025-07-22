# CeybytePOS Default Login Credentials

## Problem Solved
The 401 Unauthorized error was occurring because the database didn't have the default users that the quick switch buttons were trying to access.

## Default Users Created

### 1. Admin User (Owner Role)
- **Username:** `admin`
- **Password:** `admin123`
- **PIN:** `1234`
- **Permissions:** Full access to all features

### 2. Cashier User (Cashier Role)
- **Username:** `cashier`
- **Password:** `cashier123`
- **PIN:** `2345`
- **Permissions:** Sales, inventory, customers, basic reports

### 3. Helper User (Helper Role)
- **Username:** `helper`
- **Password:** `helper123`
- **PIN:** `3456`
- **Permissions:** Sales only

## How to Login

### Method 1: Username/Password Login
1. Select "Password" mode
2. Enter username and password from above
3. Click "Login"

### Method 2: Quick Switch with PIN
1. Click on "Admin", "Cashier", or "Helper" quick switch button
2. The form will switch to PIN mode and pre-fill the username
3. Enter the corresponding PIN
4. Click "Login"

## After Login Navigation

- **Admin (Owner):** Goes to main Dashboard with full access
- **Cashier:** Goes to main Dashboard with limited permissions
- **Helper:** Goes to Helper Mode Interface (simplified sales interface)

## Database Reinitialization

The database has been reinitialized with these default users. If you need to reset the database again, run:

```bash
python src-tauri/python-api/init_db.py
```

## Security Note

These are default development credentials. In production:
1. Change all default passwords
2. Set secure PINs
3. Create proper user accounts
4. Remove or disable default accounts