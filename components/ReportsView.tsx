

import React from 'react';
import { Project, TimeLog, User, Client, ProjectStatus } from '../types';
import { BriefcaseIcon, ClockIcon, DollarSignIcon, TrendingUpIcon, TrendingDownIcon, UsersIcon } from './icons';

interface ReportsViewProps {
    projects: Project[];
    timeLogs: TimeLog[];
    users: User[];
    clients: Client[];
}

const StatCard: React.FC<{ title: string; value: string | number; change?: number; icon: React.ReactNode }> = ({ title, value, change, icon }) => (
    <div className="bg-slate-900/40 p-5 rounded-2xl flex items-start justify-between border border-white/10">
        <div>
            <div className="p-3 rounded-full bg-telya-green/10 text-telya-green inline-block mb-4">
                {icon}
            </div>
            <p className="font-display text-4xl tracking-wide text-white">{value}</p>
            <p className="text-sm text-slate-400">{title}</p>
        </div>
        {change !== undefined && (
             <div className={`flex items-center text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
                {Math.abs(change)}%
            </div>
        )}
    </div>
);

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="flex justify-around items-end h-64 w-full pt-4 space-x-2">
            {data.map(item => (
                <div key={item.label} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-telya-green/80 rounded-t-lg hover:bg-telya-green transition-colors" style={{ height: `${(item.value / (maxValue || 1)) * 100}%` }} title={`${item.label}: ${item.value.toFixed(1)}h`}></div>
                    <p className="text-xs text-slate-400 mt-2 text-center truncate">{item.label}</p>
                </div>
            ))}
        </div>
    );
};

const ReportsView: React.FC<ReportsViewProps> = ({ projects, timeLogs, users, clients }) => {
    const totalHoursLogged = timeLogs.reduce((acc, log) => acc + log.hours, 0);
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const billableHours = totalHoursLogged * 0.85; // Assume 85% are billable
    
    const hoursPerProject = projects.map(project => ({
        label: project.name,
        value: timeLogs.filter(log => log.projectId === project.id).reduce((acc, log) => acc + log.hours, 0)
    })).filter(p => p.value > 0).sort((a,b) => b.value - a.value).slice(0, 10);
    
    const employees = users.filter(u => u.role === 'Employee');
    const hoursPerEmployee = employees.map(employee => ({
        label: employee.name,
        value: timeLogs.filter(log => log.employeeId === employee.id).reduce((acc, log) => acc + log.hours, 0),
        avatar: employee.avatar
    })).sort((a, b) => b.value - a.value);

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h2 className="font-display text-4xl tracking-wide text-white">Rapports & Performance</h2>
                <p className="text-slate-400 mt-2">Analysez les performances de votre agence.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Heures Totales Enregistrées" value={totalHoursLogged.toFixed(1) + 'h'} change={5.2} icon={<ClockIcon className="w-6 h-6"/>} />
                <StatCard title="Projets Terminés" value={completedProjects} change={-2} icon={<BriefcaseIcon className="w-6 h-6"/>} />
                <StatCard title="Heures Facturables (Est.)" value={billableHours.toFixed(1) + 'h'} change={8} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <StatCard title="Clients Actifs" value={clients.filter(c => c.status === 'Active').length} icon={<UsersIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-display text-xl tracking-wide text-white mb-4">Heures par Projet</h3>
                     {hoursPerProject.length > 0 ? (
                        <BarChart data={hoursPerProject} />
                    ) : (
                         <div className="flex items-center justify-center h-64 text-slate-500">
                            <p>Pas assez de données pour afficher le graphique.</p>
                        </div>
                    )}
                </div>
                 <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-display text-xl tracking-wide text-white mb-4">Performance de l'Équipe</h3>
                    <ul className="space-y-4 max-h-72 overflow-y-auto pr-2">
                        {hoursPerEmployee.map(emp => (
                             <li key={emp.label} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img src={emp.avatar} alt={emp.label} className="w-9 h-9 rounded-full"/>
                                    <p className="text-sm font-semibold text-white">{emp.label}</p>
                                </div>
                                <span className="font-mono text-base font-semibold text-telya-green bg-telya-green/10 px-3 py-1 rounded-md">{emp.value.toFixed(1)}h</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;