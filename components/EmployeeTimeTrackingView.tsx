import React from 'react';
import { TimeLog, User, Project } from '../types';
import { ClockIcon } from './icons';

interface EmployeeTimeTrackingViewProps {
    currentUser: User;
    timeLogs: TimeLog[];
    projects: Project[];
}

const EmployeeTimeTrackingView: React.FC<EmployeeTimeTrackingViewProps> = ({ currentUser, timeLogs, projects }) => {
    const myTimeLogs = timeLogs.filter(log => log.employeeId === currentUser.id);

    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Projet Inconnu';
    
    const logsByDate = myTimeLogs.reduce((acc, log) => {
        (acc[log.date] = acc[log.date] || []).push(log);
        return acc;
    }, {} as Record<string, TimeLog[]>);
    
    const sortedDates = Object.keys(logsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-6">Heures & Temps</h2>

            {sortedDates.length > 0 ? (
                <div className="space-y-6">
                    {sortedDates.map(date => {
                        const logs = logsByDate[date];
                        const dailyTotal = logs.reduce((sum, log) => sum + log.hours, 0);
                        return (
                            <div key={date} className="bg-slate-900/40 p-5 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
                                    <h3 className="font-semibold text-white text-lg">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                    <span className="font-mono text-base font-semibold text-telya-green bg-telya-green/10 px-3 py-1 rounded-md">Total: {dailyTotal.toFixed(1)}h</span>
                                </div>
                                <div className="space-y-3">
                                    {logs.map(log => (
                                        <div key={log.id} className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-200">{getProjectName(log.projectId)}</p>
                                                <p className="text-xs text-slate-400">{log.description}</p>
                                            </div>
                                            <span className="font-semibold text-slate-300">{log.hours.toFixed(1)}h</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500">
                    <ClockIcon className="w-12 h-12 mx-auto mb-4"/>
                    <h3 className="font-display text-xl text-white">Aucun temps enregistré</h3>
                    <p className="mt-1">Utilisez le minuteur sur la page de détails d'un projet pour commencer.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeTimeTrackingView;