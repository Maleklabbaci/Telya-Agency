import React from 'react';
import { MenuIcon, BellIcon } from './icons';
import { User, UserRole, PanelNotification } from '../types';
import NotificationsPanel from './NotificationsPanel';


interface HeaderProps {
  title: string;
  onToggleMobileNav: () => void;
  currentUser: User;
  onToggleNotificationsPanel: () => void;
  isNotificationsPanelOpen: boolean;
  notifications: PanelNotification[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: PanelNotification) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleMobileNav, currentUser, onToggleNotificationsPanel, isNotificationsPanelOpen, notifications, onMarkAllAsRead, onNotificationClick }) => {
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="relative z-20 flex-shrink-0 flex items-center h-20 px-6 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl">
      <button onClick={onToggleMobileNav} className="md:hidden text-slate-300 hover:text-white mr-4">
        <MenuIcon className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-4">
        <h2 className="font-display text-2xl md:text-3xl tracking-wide text-white truncate">{title}</h2>
      </div>
      <div className="ml-auto flex items-center space-x-4">
         <div className="relative">
            <button onClick={onToggleNotificationsPanel} className="relative text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                     <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-telya-green ring-2 ring-slate-800 shadow-glow"></span>
                )}
            </button>
            {isNotificationsPanelOpen && (
                <NotificationsPanel 
                    notifications={notifications}
                    onClose={onToggleNotificationsPanel}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onNotificationClick={onNotificationClick}
                />
            )}
         </div>
        <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full" />
      </div>
    </header>
  );
};

export default Header;
