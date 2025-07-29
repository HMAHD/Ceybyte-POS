/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                            DEPRECATED - Old JWT Authentication Context                          │
 * │                                                                                                  │
 * │  Description: DEPRECATED - This file is kept for reference only.                                 │
 * │               Use PinAuthContext.tsx for the new PIN-based authentication system.               │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

// DEPRECATED: This context is no longer used
// Use PinAuthContext instead for the new fast authentication system

// This file is deprecated and should not be imported
// Use PinAuthContext instead

export const AuthProvider = () => {
  throw new Error('AuthProvider is deprecated. Use PinAuthProvider instead.');
};

export const useAuth = () => {
  throw new Error('useAuth is deprecated. Use usePinAuth instead.');
};
