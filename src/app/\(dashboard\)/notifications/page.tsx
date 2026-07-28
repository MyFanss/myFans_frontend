'use client';

import { useState } from 'react';
import { NotificationsPageContent } from '@/components/notifications/NotificationsPageContent';
import { NotificationType } from '@/types/notifications';

export default function NotificationsPage() {
  const [selectedType, setSelectedType] = useState<NotificationType | undefined>();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  return (
    <NotificationsPageContent
      selectedType={selectedType}
      onSelectType={setSelectedType}
      showUnreadOnly={showUnreadOnly}
      onToggleUnreadOnly={setShowUnreadOnly}
    />
  );
}
