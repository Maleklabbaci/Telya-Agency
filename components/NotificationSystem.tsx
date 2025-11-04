

import React, { useState, useContext, createContext, useCallback, useEffect } from 'react';
import { ToastNotification, ToastNotificationType } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, CloseIcon } from './icons';

// --- CONTEXT & HOOK ---

interface NotificationContextType {
  addNotification: (notification: Omit<ToastNotification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// --- SINGLE NOTIFICATION COMPONENT ---

const Toast: React.FC<{ notification: ToastNotification; onClose: (id: string) => void; }> = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(notification.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  const typeDetails = {
    [ToastNotificationType.SUCCESS]: {
      icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
      barClass: 'bg-green-500',
    },
    [ToastNotificationType.ERROR]: {
      icon: <XCircleIcon className="w-6 h-6 text-red-400" />,
      barClass: 'bg-red-500',
    },
    [ToastNotificationType.INFO]: {
      icon: <InformationCircleIcon className="w-6 h-6 text-blue-400" />,
      barClass: 'bg-blue-500',
    },
  };

  return (
    <div className={`
        w-full max-w-sm bg-slate-800/80 backdrop-blur-lg shadow-2xl rounded-lg pointer-events-auto ring-1 ring-white/10 overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        animate-enter
    `} role="alert">
      <div className="p-4 relative">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {typeDetails[notification.type].icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-semibold text-white">{notification.title}</p>
            <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={handleClose} className="inline-flex rounded-md text-slate-400 hover:text-white focus:outline-none">
              <span className="sr-only">Close</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 h-1 ${typeDetails[notification.type].barClass} animate-progress`}></div>
      </div>
      <style>{`
        @keyframes enter {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-enter { animation: enter 0.3s ease-out forwards; }

        @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
        }
        .animate-progress { animation: progress 5s linear forwards; }
      `}</style>
    </div>
  );
};


// --- PROVIDER & CONTAINER ---

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = new Date().toISOString() + Math.random();
    setNotifications(prev => [...prev, { id, ...notification }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 z-[100]">
        <div className="w-full max-w-sm space-y-4">
          {notifications.map(n => (
            <Toast key={n.id} notification={n} onClose={removeNotification} />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};