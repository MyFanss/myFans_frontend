'use client';

import { ReactNode } from 'react';

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      {children}
    </div>
  );
}
