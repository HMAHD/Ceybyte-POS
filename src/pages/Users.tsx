/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                      Users Page                                                  ║
 * ║                                                                                                  ║
 * ║  Description: Main page component for user management with admin access control.                 ║
 * ║               Provides interface for managing system users, roles, and permissions.              ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import UserManagement from '@/components/UserManagement';

const UsersPage: React.FC = () => {
  return (
    <div className='p-6'>
      <UserManagement />
    </div>
  );
};

export default UsersPage;
