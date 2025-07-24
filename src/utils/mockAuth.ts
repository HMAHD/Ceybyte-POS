/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                                   Mock Authentication System                                     │
 * │                                                                                                  │
 * │  Description: Mock authentication for development when Python API is not available.              │
 * │               Provides realistic authentication flow with default users.                         │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

interface MockUser {
  id: number;
  username: string;
  name: string;
  role: string;
  permissions: string[];
  preferred_language: string;
  password: string;
  pin: string;
}

// Mock users for development
const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    name: 'System Administrator',
    role: 'owner',
    permissions: [
      'sales',
      'inventory',
      'customers',
      'suppliers',
      'reports',
      'settings',
      'users',
      'backup',
      'system',
      'admin',
    ],
    preferred_language: 'en',
    password: 'AdminPass2025!',
    pin: '1234',
  },
  {
    id: 2,
    username: 'cashier',
    name: 'Main Cashier',
    role: 'cashier',
    permissions: ['sales', 'inventory', 'customers', 'basic_reports'],
    preferred_language: 'en',
    password: 'CashierPass2025!',
    pin: '2345',
  },
  {
    id: 3,
    username: 'helper',
    name: 'Sales Helper',
    role: 'helper',
    permissions: ['sales'],
    preferred_language: 'en',
    password: 'HelperPass2025!',
    pin: '3456',
  },
];

// Mock JWT token generation
const generateMockToken = (user: MockUser): string => {
  const payload = {
    sub: user.id.toString(),
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours
  };

  // Simple base64 encoding for mock token
  return btoa(JSON.stringify(payload));
};

// Mock token verification
const verifyMockToken = (token: string): MockUser | null => {
  try {
    const payload = JSON.parse(atob(token));

    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Find user by ID
    const user = MOCK_USERS.find(u => u.id.toString() === payload.sub);
    return user || null;
  } catch {
    return null;
  }
};

export const mockAuthService = {
  // Mock login with username/password
  login: async (
    username: string,
    password: string
  ): Promise<{
    success: boolean;
    data?: {
      access_token: string;
      token_type: string;
      expires_in: number;
      user: Omit<MockUser, 'password' | 'pin'>;
    };
    error?: string;
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return {
        success: false,
        error: 'Invalid username or password',
      };
    }

    const token = generateMockToken(user);
    const { password: _, pin: __, ...userWithoutSecrets } = user;

    return {
      success: true,
      data: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 8 * 60 * 60, // 8 hours in seconds
        user: userWithoutSecrets,
      },
    };
  },

  // Mock PIN login
  pinLogin: async (
    username: string,
    pin: string
  ): Promise<{
    success: boolean;
    data?: {
      access_token: string;
      token_type: string;
      expires_in: number;
      user: Omit<MockUser, 'password' | 'pin'>;
    };
    error?: string;
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = MOCK_USERS.find(u => u.username === username && u.pin === pin);

    if (!user) {
      return {
        success: false,
        error: 'Invalid username or PIN',
      };
    }

    const token = generateMockToken(user);
    const { password: _, pin: __, ...userWithoutSecrets } = user;

    return {
      success: true,
      data: {
        access_token: token,
        token_type: 'bearer',
        expires_in: 8 * 60 * 60, // 8 hours in seconds
        user: userWithoutSecrets,
      },
    };
  },

  // Mock user verification
  verifyUser: async (
    token: string
  ): Promise<{
    success: boolean;
    data?: Omit<MockUser, 'password' | 'pin'>;
    error?: string;
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const user = verifyMockToken(token);

    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired token',
      };
    }

    const { password: _, pin: __, ...userWithoutSecrets } = user;

    return {
      success: true,
      data: userWithoutSecrets,
    };
  },

  // Mock health check
  healthCheck: async (): Promise<{
    success: boolean;
    data?: { status: string; service: string };
    error?: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      data: {
        status: 'healthy',
        service: 'CeybytePOS Mock API',
      },
    };
  },
};

export default mockAuthService;
