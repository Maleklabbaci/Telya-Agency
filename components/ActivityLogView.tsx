

import React, { useState } from 'react';
import { ActivityLog, User } from '../types';
import { ActivityLogIcon, FilterIcon } from './icons';

interface ActivityLogViewProps {
    activityLog: ActivityLog[];
    users: User[];
}

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

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ activityLog, users }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    const filteredLogs = activityLog.filter(log => {
        const logDate = log.timestamp;
        if (selectedUserId !== 'all' && log.userId !== selectedUserId) return false;
        if (dateFrom && logDate < new Date(dateFrom)) return false;
        if (dateTo && logDate > new Date(dateTo).setHours(23, 59, 59, 999)) return false;
        return true;
    });

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-6">Journal d'activité</h2>

            <div className="bg-slate-800/50 p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center gap-4 border border-white/10">
                <div className="flex items-center text-slate-300 font-semibold">
                    <FilterIcon className="w-5 h-5 mr-2" />
                    <span>Filtres:</span>
                </div>
                <div className="flex-1 w-full md:w-auto">
                     <select 
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full appearance-none block rounded-md shadow-sm form-input form-select text-slate-100"
                    >
                        <option value="all">Tous les utilisateurs</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <input 
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full block rounded-md shadow-sm form-input text-slate-100"
                    />
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full block rounded-md shadow-sm form-input text-slate-100"
                    />
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-2xl shadow-lg border border-white/10">
                <ul className="divide-y divide-slate-800">
                    {filteredLogs.map(log => {
                        const user = users.find(u => u.id === log.userId);
                        return (
                            <li key={log.id} className="p-4 flex items-center space-x-4">
                                <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm text-slate-200">
                                        <span className="font-bold">{user?.name}</span> {log.action} <span className="font-semibold text-telya-green">{log.details}</span>.
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500 flex-shrink-0">{timeSince(log.timestamp)}</p>
                            </li>
                        );
                    })}
                     {filteredLogs.length === 0 && (
                        <li className="p-12 text-center text-slate-500">
                            <ActivityLogIcon className="w-12 h-12 mx-auto mb-2"/>
                            Aucune activité trouvée avec les filtres actuels.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ActivityLogView;