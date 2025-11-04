
import React from 'react';
import { ProjectsIcon, EnvelopeIcon } from './icons';
import { PanelNotification } from '../types';

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `il y a ${Math.floor(interval)} an${Math.floor(interval) > 1 ? 's' : ''}`;
    interval = seconds / 2592000;
    if (interval > 1) return `il y a ${Math.floor(interval)} mois`;
    interval = seconds / 86400;
    if (interval > 1) return `il y a ${Math.floor(interval)} j`;
    interval = seconds / 3600;
    if (interval > 1) return `il y a ${Math.floor(interval)} h`;
    interval = seconds / 60;
    if (interval > 1) return `il y a ${Math.floor(interval)} min`;
    return `à l'instant`;
};


const NotificationIcon: React.FC<{ type: PanelNotification['type'] }> = ({ type }) => {
    switch (type) {
        case 'project-status': return <ProjectsIcon className="w-5 h-5" />;
        case 'new-message': return <EnvelopeIcon className="w-5 h-5" />;
        default: return null;
    }
};

interface NotificationsPanelProps {
    notifications: PanelNotification[];
    onClose: () => void;
    onMarkAllAsRead: () => void;
    onNotificationClick: (notification: PanelNotification) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, onMarkAllAsRead, onNotificationClick }) => {
    
    const handleNotificationClick = (notification: PanelNotification) => {
        onNotificationClick(notification);
        onClose();
    };

    return (
        <div 
            className="absolute top-full right-0 mt-4 w-80 sm:w-96 bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl z-50 border border-white/10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-heading"
        >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h3 id="notifications-heading" className="font-display text-lg text-white">Notifications</h3>
                <button onClick={onMarkAllAsRead} className="text-sm text-green-400 hover:text-green-300 font-semibold transition-colors">
                    Tout marquer comme lu
                </button>
            </div>
            {notifications.length > 0 ? (
                <ul className="divide-y divide-slate-700/50 max-h-[60vh] overflow-y-auto">
                    {notifications.map(notification => (
                        <li key={notification.id} >
                            <button
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left p-4 hover:bg-slate-700/50 transition-colors duration-200 ${!notification.read ? 'bg-slate-700/30' : ''}`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        notification.type === 'project-status' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-purple-500/10 text-purple-400'
                                    }`}>
                                        <NotificationIcon type={notification.type} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-white truncate">{notification.title}</p>
                                        <p className="text-sm text-slate-400 truncate">{notification.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">{timeSince(notification.timestamp)}</p>
                                    </div>
                                    {!notification.read && <div className="w-2.5 h-2.5 bg-green-500 rounded-full mt-2 flex-shrink-0 shadow-[0_0_8px_theme(colors.green.500)]"></div>}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-8 text-center text-slate-400">
                    <p>Vous n'avez aucune nouvelle notification.</p>
                </div>
            )}
             <div className="p-2 bg-slate-900/50 border-t border-white/10 text-center">
                <button className="text-sm font-semibold text-slate-300 hover:text-white transition-colors w-full py-1">
                    Voir toutes les notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationsPanel;