

import React from 'react';
import { User, TimeLog, Project, Task, ProjectStatus } from '../types';
import { ClockIcon, BriefcaseIcon, CheckCircleIcon, TrendingUpIcon } from './icons';

interface EmployeePerformanceViewProps {
    currentUser: User;
    timeLogs: TimeLog[];
    projects: Project[];
    tasks: Task[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-900/40 p-5 rounded-2xl flex items-center space-x-4 border border-white/10">
        <div className="bg-telya-green/10 p-3 rounded-full text-telya-green">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="font-display text-3xl tracking-wide text-white">{value}</p>
        </div>
    </div>
);

const EmployeePerformanceView: React.FC<EmployeePerformanceViewProps> = ({ currentUser, timeLogs, projects, tasks }) => {
    const myTimeLogs = timeLogs.filter(log => log.employeeId === currentUser.id);
    const myTasks = tasks.filter(t => t.employeeId === currentUser.id);
    const myProjects = projects.filter(p => p.assignedEmployeeIds.includes(currentUser.id));

    const totalHours = myTimeLogs.reduce((sum, log) => sum + log.hours, 0);
    const tasksCompleted = myTasks.filter(t => t.status === 'Completed').length;
    const activeProjects = myProjects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;

    const averageHoursPerWeek = (totalHours / 4).toFixed(1); // Assuming 4 weeks of data for demo

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h2 className="font-display text-4xl tracking-wide text-white">Ma Performance</h2>
                <p className="text-slate-400 mt-2">Voici un résumé de votre activité.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Heures Enregistrées (Total)" value={totalHours.toFixed(1) + 'h'} icon={<ClockIcon className="h-6 w-6"/>} />
                <StatCard title="Projets Actifs" value={activeProjects} icon={<BriefcaseIcon className="h-6 w-6"/>} />
                <StatCard title="Tâches Terminées" value={tasksCompleted} icon={<CheckCircleIcon className="h-6 w-6"/>} />
                <StatCard title="Moy. Heures/Semaine" value={averageHoursPerWeek + 'h'} icon={<TrendingUpIcon className="h-6 w-6"/>} />
            </div>

            <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                <h3 className="font-display text-2xl text-white mb-4">Répartition des heures par projet</h3>
                <ul className="space-y-3">
                    {myProjects.map(project => {
                        const projectHours = myTimeLogs
                            .filter(log => log.projectId === project.id)
                            .reduce((sum, log) => sum + log.hours, 0);

                        if (projectHours === 0) return null;

                        const percentage = totalHours > 0 ? (projectHours / totalHours) * 100 : 0;
                        return (
                            <li key={project.id}>
                                <div className="flex justify-between items-center mb-1">
                                    {/* FIX: Corrected malformed span tag */}
                                    <span className="text-slate-200">{project.name}</span>
                                    <span className="text-xs text-slate-400">{projectHours.toFixed(1)}h</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                    <div className="bg-telya-green h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default EmployeePerformanceView;