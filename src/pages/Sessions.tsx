/*
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                        CEYBYTE POS                                               ║
 * ║                                                                                                  ║
 * ║                                      Sessions Page                                               ║
 * ║                                                                                                  ║
 * ║  Description: Page component for session management interface containing active sessions,        ║
 * ║               login history, and audit logs with administrative controls.                        ║
 * ║                                                                                                  ║
 * ║  Author: Akash Hasendra                                                                          ║
 * ║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
 * ║  License: MIT License with Sri Lankan Business Terms                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { Sessions } from '@/components/Sessions';

const { Title } = Typography;

const SessionsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="sessions-page">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          {t('navigation.sessions')}
        </Title>
        <p className="text-gray-600">
          {t('sessions.description')}
        </p>
      </div>
      
      <Sessions />
    </div>
  );
};

export default SessionsPage;