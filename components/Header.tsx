
import React, { useState, useRef, useEffect } from 'react';
import { MenuIcon, BellIcon, RefreshIcon } from './icons';
import NotificationsPanel from './NotificationsPanel';
import { PanelNotification, User } from '../types';

interface HeaderProps {
  title: string;
  onToggleMobileNav: () => void;
  currentUser: User;
  panelNotifications: PanelNotification[];
  onNotificationClick: (notification: PanelNotification) => void;
  onMarkAllNotificationsAsRead: () => void;
  isSyncing: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleMobileNav, currentUser, panelNotifications, onNotificationClick, onMarkAllNotificationsAsRead, isSyncing }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const userNotifications = panelNotifications.filter(n => n.userId === currentUser.id).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  const hasUnread = userNotifications.some(n => !n.read);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
  };

  return (
    <header className="relative z-20 flex-shrink-0 flex items-center h-20 px-6 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl">
      <button onClick={onToggleMobileNav} className="md:hidden text-slate-300 hover:text-white mr-4">
        <MenuIcon className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-4">
        <h2 className="font-display text-2xl md:text-3xl tracking-wide text-white truncate">{title}</h2>
        {isSyncing && (
            <div className="hidden md:flex items-center space-x-2 text-green-400 animate-pulse">
                <RefreshIcon className="w-5 h-5 animate-spin" />
                <span className="text-sm font-semibold">Synchronisation...</span>
            </div>
        )}
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <div className="relative" ref={containerRef}>
          <button onClick={toggleNotifications} className="relative text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-colors">
              <BellIcon className="w-6 h-6" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-green-400/60"></span>
              )}
          </button>
          {isNotificationsOpen && 
            <NotificationsPanel 
                notifications={userNotifications}
                onClose={() => setIsNotificationsOpen(false)} 
                onNotificationClick={onNotificationClick}
                onMarkAllAsRead={onMarkAllNotificationsAsRead}
            />
          }
        </div>
      </div>
    </header>
  );
};

export default Header;