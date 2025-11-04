import React from 'react';
import { User, Project, ActivityLog, ProjectStatus, Invoice, Task } from '../types';
import { BriefcaseIcon, DollarSignIcon, CheckCircleIcon, UsersIcon, BellIcon, ActivityLogIcon, TeamIcon, LightbulbIcon, PauseIcon } from './icons';

interface AdminDashboardProps {
    currentUser: User;
    users: User[];
    projects: Project[];
    activityLog: ActivityLog[];
    invoices: Invoice[];
    tasks: Task[];
    onUpdateInvoice: (invoice: Invoice) => void;
    onViewProjectDetails: (project: Project) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-900/50 p-5 rounded-2xl flex items-center space-x-4 border border-[var(--border-color)] transition-all duration-300 hover:border-telya-green/50 hover:shadow-2xl hover:shadow-telya-green/10 hover:-translate-y-1">
        <div className="bg-telya-green/10 p-3 rounded-full text-telya-green">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="font-display text-3xl tracking-wide text-white">{value}</p>
        </div>
    </div>
);

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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, users, projects, activityLog, invoices, tasks, onUpdateInvoice, onViewProjectDetails }) => {
    
    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return 'Bonjour';
        if (hours < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }

    const activeProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRevenueRaw = invoices
        .filter(invoice => {
            const issueDate = new Date(invoice.issueDate);
            return invoice.status === 'Paid' &&
                   issueDate.getMonth() === currentMonth &&
                   issueDate.getFullYear() === currentYear;
        })
        .reduce((total, invoice) => total + invoice.amount, 0);
    const monthlyRevenue = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(monthlyRevenueRaw);

    const tasksCompleted = tasks.filter(t => t.status === 'Completed').length;
    const teamOnline = users.filter(u => u.role !== 'Client' && u.activityStatus === 'online').length;

    const employees = users.filter(u => u.role === 'Employee');

    const projectStatusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const handleValidateInvoice = () => {
        const invoiceToValidate = invoices.find(inv => inv.id === 'inv-002');
        if (invoiceToValidate) {
            onUpdateInvoice({ ...invoiceToValidate, status: 'Paid' });
        }
    };

    const handleViewOverdueProject = () => {
        const projectToView = projects.find(p => p.name.includes('Innovatech'));
        if (projectToView) {
            onViewProjectDetails(projectToView);
        }
    };


    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h2 className="font-display text-4xl tracking-wide text-white">
                    {getGreeting()}, <span className="text-telya-green">{currentUser.name.split(' ')[0]}</span>!
                </h2>
                <p className="text-slate-400 mt-2">Voici un aperçu de votre agence aujourd'hui.</p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Projets Actifs" value={activeProjects} icon={<BriefcaseIcon className="h-6 w-6" />} />
                <StatCard title="Revenus (Mois)" value={monthlyRevenue} icon={<DollarSignIcon className="h-6 w-6" />} />
                <StatCard title="Tâches Terminées" value={tasksCompleted} icon={<CheckCircleIcon className="h-6 w-6" />} />
                <StatCard title="Équipe en ligne" value={teamOnline} icon={<UsersIcon className="h-6 w-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Alerts */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-[var(--border-color)]">
                        <h3 className="font-display text-xl tracking-wide text-white flex items-center"><BellIcon className="w-6 h-6 mr-3 text-telya-green"/>Alertes & Actions Rapides</h3>
                        <div className="mt-4 space-y-3">
                            <div className="bg-yellow-500/10 p-3 rounded-lg flex justify-between items-center">
                                <p className="text-sm text-yellow-300">Le projet <span className="font-bold">Innovatech</span> est en retard de 2 jours.</p>
                                <button onClick={handleViewOverdueProject} className="text-xs bg-yellow-500/20 text-white font-semibold px-3 py-1 rounded-md hover:bg-yellow-500/40 transition-colors">Voir le projet</button>
                            </div>
                             <div className="bg-blue-500/10 p-3 rounded-lg flex justify-between items-center">
                                <p className="text-sm text-blue-300">Nouvelle facture de <span className="font-bold">Quantum Corp</span> à valider.</p>
                                <button onClick={handleValidateInvoice} className="text-xs bg-blue-500/20 text-white font-semibold px-3 py-1 rounded-md hover:bg-blue-500/40 transition-colors">Valider</button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-[var(--border-color)]">
                        <h3 className="font-display text-xl tracking-wide text-white flex items-center"><ActivityLogIcon className="w-6 h-6 mr-3 text-telya-green"/>Journal d'activité Récent</h3>
                        <ul className="mt-4 space-y-4">
                            {activityLog.slice(0, 4).map(log => {
                                const user = users.find(u => u.id === log.userId);
                                return (
                                    <li key={log.id} className="flex items-center space-x-4">
                                        <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full"/>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-200">
                                                <span className="font-bold">{user?.name}</span> {log.action} <span className="font-semibold text-telya-green">{log.details}</span>.
                                            </p>
                                            <p className="text-xs text-slate-500">{timeSince(log.timestamp)}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Team Status */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-[var(--border-color)]">
                        <h3 className="font-display text-xl tracking-wide text-white flex items-center"><TeamIcon className="w-6 h-6 mr-3 text-telya-green"/>Statut de l'équipe</h3>
                        <ul className="mt-4 space-y-3">
                            {employees.map(emp => (
                                <li key={emp.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full"/>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{emp.name}</p>
                                            <p className="text-xs text-slate-400">{emp.position}</p>
                                        </div>
                                    </div>
                                    {emp.activityStatus === 'online' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" title="En ligne"></div>}
                                    {emp.activityStatus === 'paused' && <PauseIcon className="w-4 h-4 text-yellow-400" title="En pause"/>}
                                    {emp.activityStatus === 'offline' && <div className="w-2.5 h-2.5 bg-slate-600 rounded-full" title="Hors ligne"></div>}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-[var(--border-color)]">
                         <h3 className="font-display text-xl tracking-wide text-white flex items-center"><LightbulbIcon className="w-6 h-6 mr-3 text-telya-green"/>Insights IA</h3>
                         <div className="mt-4 space-y-2 text-sm">
                            <p className="text-slate-300">💡 <span className="font-semibold">Bob Williams</span> est sous-chargé cette semaine. Pensez à lui assigner une nouvelle tâche.</p>
                             <p className="text-slate-300">📈 Le projet <span className="font-semibold">Stellar Goods</span> a un risque de retard de 35%.</p>
                         </div>
                    </div>
                     {/* Projects Overview */}
                     <div className="bg-slate-900/50 p-6 rounded-2xl border border-[var(--border-color)]">
                         <h3 className="font-display text-xl tracking-wide text-white mb-4">Aperçu des Projets</h3>
                         <div className="space-y-3">
                            {Object.entries(projectStatusCounts).map(([status, count]) => (
                                <div key={status}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-300">{status}</span>
                                        <span className="text-slate-400">{count} / {projects.length}</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-telya-green h-2 rounded-full" style={{ width: `${(count as number / projects.length) * 100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;