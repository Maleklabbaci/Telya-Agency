import React from 'react';
import { User, UserRole, Client, Project, ProjectStatus, ChatMessage } from '../types';
import { PlusIcon, UsersIcon, ClientsIcon, ProjectsIcon, EnvelopeIcon } from './icons';

interface DashboardProps {
    currentUser: User;
    users: User[];
    clients: Client[];
    projects: Project[];
    chatMessages: ChatMessage[];
    onNavigate: (view: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-slate-900/30 p-6 rounded-2xl flex items-center space-x-4 border border-white/10 shadow-lg hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
        <div className="bg-green-500/10 p-4 rounded-full text-green-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="font-display text-3xl text-white tracking-wide">{value}</p>
        </div>
    </div>
);

const QuickActionButton: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; }> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="w-full bg-slate-800/60 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-slate-700 hover:border-green-500 hover:bg-slate-700/50 transition-all duration-300">
        <div className="bg-green-500/10 p-3 rounded-full text-green-400 mb-2">
            {icon}
        </div>
        <p className="text-sm font-semibold text-white">{label}</p>
    </button>
);

const ProjectStatusCard: React.FC<{ project: Project; client: Client | undefined }> = ({ project, client }) => {
    const progress = project.status === ProjectStatus.COMPLETED ? 100 : project.status === ProjectStatus.IN_PROGRESS ? 75 : project.status === ProjectStatus.ON_HOLD ? 25 : 5;
    
    return (
        <div className="bg-slate-900/30 p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2 space-x-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-400 truncate">{client?.companyName}</p>
                        <p className="font-semibold text-white truncate">{project.name}</p>
                    </div>
                     <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                        project.status === ProjectStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : 
                        project.status === ProjectStatus.IN_PROGRESS ? 'bg-blue-500/20 text-blue-400' :
                        project.status === ProjectStatus.ON_HOLD ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                        {project.status}
                    </span>
                </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<{ users: User[]; clients: Client[]; projects: Project[]; onNavigate: (view: string) => void; }> = ({ users, clients, projects, onNavigate }) => {
    const employeeCount = users.filter(u => u.role === UserRole.EMPLOYEE).length;
    const clientCount = clients.length;
    const activeProjectsCount = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
    const keyProjects = projects.slice(0, 4);

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Employés" value={employeeCount} icon={<UsersIcon className="h-8 w-8" />} />
            <StatCard title="Total Clients" value={clientCount} icon={<ClientsIcon className="h-8 w-8" />} />
            <StatCard title="Projets Actifs" value={activeProjectsCount} icon={<ProjectsIcon className="h-8 w-8" />} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/30 p-6 rounded-2xl border border-white/10">
                <h3 className="font-display text-xl tracking-wide mb-4 text-white">Projets Clés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {keyProjects.map(p => <ProjectStatusCard key={p.id} project={p} client={clients.find(c => c.id === p.clientId)} />)}
                </div>
            </div>
            <div className="bg-slate-900/30 p-6 rounded-2xl border border-white/10">
                 <h3 className="font-display text-xl tracking-wide mb-4 text-white">Actions Rapides</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <QuickActionButton label="Nouvel Employé" icon={<PlusIcon className="h-6 w-6"/>} onClick={() => onNavigate('employees')} />
                    <QuickActionButton label="Nouveau Client" icon={<PlusIcon className="h-6 w-6"/>} onClick={() => onNavigate('clients')} />
                    <QuickActionButton label="Nouveau Projet" icon={<PlusIcon className="h-6 w-6"/>} onClick={() => onNavigate('projects')} />
                    <QuickActionButton label="Voir Messages" icon={<EnvelopeIcon className="h-6 w-6"/>} onClick={() => onNavigate('messages')} />
                 </div>
            </div>
        </div>
      </>
    );
};

const EmployeeDashboard: React.FC<{ currentUser: User; projects: Project[]; clients: Client[] }> = ({ currentUser, projects, clients }) => {
    const myProjects = projects.filter(p => p.assignedEmployeeIds.includes(currentUser.id) && p.status === ProjectStatus.IN_PROGRESS);
    
    return (
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-white/10">
            <h3 className="font-display text-xl tracking-wide mb-4 text-white">Mes Projets Actifs</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProjects.length > 0 ? (
                    myProjects.map(p => <ProjectStatusCard key={p.id} project={p} client={clients.find(c => c.id === p.clientId)} />)
                ) : (
                    <p className="text-slate-400 md:col-span-2 lg:col-span-3">Vous n'avez aucun projet actif pour le moment.</p>
                )}
            </div>
        </div>
    );
};

const ClientDashboard: React.FC<{ currentUser: User; projects: Project[]; clients: Client[]; users: User[] }> = ({ currentUser, projects, clients, users }) => {
    const myClientProfile = clients.find(c => c.contactEmail === currentUser.email);
    const myProjects = projects.filter(p => p.clientId === myClientProfile?.id);
    const accountManagerId = myClientProfile?.assignedEmployeeIds?.[0];
    const accountManager = accountManagerId ? users.find(u => u.id === accountManagerId) : null;

    return (
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-white/10">
            <h3 className="font-display text-xl tracking-wide mb-4 text-white">Statut de mes Projets</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {myProjects.length > 0 ? (
                    myProjects.map(p => <ProjectStatusCard key={p.id} project={p} client={myClientProfile} />)
                 ) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center">
                        <ProjectsIcon className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="font-display text-xl tracking-wide text-white">Prêt à lancer votre prochain projet ?</h3>
                        <p className="text-slate-400 mt-2 max-w-md mx-auto">Vous n'avez actuellement aucun projet actif. Contactez votre chargé de compte ci-dessous pour discuter de vos idées et commencer.</p>
                        
                        {accountManager && (
                            <div className="mt-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center max-w-xs">
                                <img src={accountManager.avatar} alt={accountManager.name} className="w-16 h-16 rounded-full mb-4" />
                                <p className="font-semibold text-white">{accountManager.name}</p>
                                <p className="text-sm text-slate-400 mb-4">{accountManager.position}</p>
                                <a 
                                    href={`mailto:${accountManager.email}`}
                                    className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors text-sm shadow-lg shadow-green-600/20"
                                >
                                    <EnvelopeIcon className="w-5 h-5 mr-2" />
                                    Contacter {accountManager.name.split(' ')[0]}
                                </a>
                            </div>
                        )}
                    </div>
                 )}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, clients, projects, chatMessages, onNavigate }) => {
    
    const renderContent = () => {
        switch(currentUser.role) {
            case UserRole.ADMIN:
                return <AdminDashboard users={users} clients={clients} projects={projects} onNavigate={onNavigate} />;
            case UserRole.EMPLOYEE:
                return <EmployeeDashboard currentUser={currentUser} projects={projects} clients={clients} />;
            case UserRole.CLIENT:
                return <ClientDashboard currentUser={currentUser} projects={projects} clients={clients} users={users} />;
            default:
                return <div>Bienvenue !</div>;
        }
    };
    
    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h2 className="font-display text-4xl tracking-wide text-white">Ravi de vous revoir, <span className="text-green-400">{currentUser.name.split(' ')[0]}</span>!</h2>
                <p className="text-slate-400">Voici un aperçu de votre espace de travail aujourd'hui.</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default Dashboard;