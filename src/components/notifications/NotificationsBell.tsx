'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useUnreadCount } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => {
          // Optional: prefetch on hover
        }}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Bell className="size-6" />

        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 size-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
            aria-live="polite"
            aria-atomic="true"
          >
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-2 w-96 z-50"
        >
          <NotificationsDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
