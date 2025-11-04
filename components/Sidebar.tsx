import React, { useState } from 'react';
import { User, UserRole, View, Project, Client, ChatMessage, Invoice, Task, ProjectStatus } from '../types';
import { 
    DashboardIcon, TeamIcon, ProjectsIcon, MessagesIcon, ReportsIcon, BillingIcon, AiIcon, FilesIcon, SettingsIcon, ActivityLogIcon, 
    SwitchRoleIcon, TasksIcon, CalendarIcon, TimeTrackingIcon, PerformanceIcon, ProfileIcon, SupportIcon, DeliverablesIcon, FeedbackIcon,
    LogoutIcon, ChevronLeftIcon, ChevronRightIcon
} from './icons';

interface SidebarProps {
  currentUser: User;
  activeView: View;
  setActiveView: (view: View) => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  projects: Project[];
  clients: Client[];
  chatMessages: ChatMessage[];
  invoices: Invoice[];
  tasks: Task[];
}

interface NavLinkData {
    view: View;
    label: string;
    icon: React.FC<{ className?: string }>;
}

const NavLink: React.FC<{ data: NavLinkData; isActive: boolean; isCollapsed: boolean; onClick: () => void; badgeCount: number; }> = ({ data, isActive, isCollapsed, onClick, badgeCount }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? `${data.label}${badgeCount > 0 ? ` (${badgeCount})` : ''}` : undefined}
    className={`w-full flex items-center h-12 px-4 rounded-lg group transition-all duration-300 relative ${
      isActive
        ? 'bg-telya-green/10 text-telya-green font-semibold'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
    }`}
  >
    <div className="relative flex-shrink-0">
        <data.icon className={`w-6 h-6 transition-colors duration-200 ${isActive ? 'text-telya-green' : 'text-slate-500 group-hover:text-slate-300'}`} />
        {badgeCount > 0 && isCollapsed && (
             <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-telya-green ring-2 ring-slate-900 shadow-glow"></span>
        )}
    </div>
    <span className={`ml-4 flex-1 text-left whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{data.label}</span>
     {badgeCount > 0 && !isCollapsed && (
      <span className="ml-2 text-xs font-bold text-slate-900 bg-telya-green rounded-full h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center transition-opacity duration-300">
        {badgeCount > 9 ? '9+' : badgeCount}
      </span>
    )}
     <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-telya-green rounded-r-full shadow-glow transition-all duration-300 ${isActive ? 'h-6' : 'h-0 group-hover:h-3'}`} />
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, setActiveView, isOpenOnMobile, onCloseMobile, onLogout, projects, clients, chatMessages, invoices, tasks }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getBadgeCount = (view: View): number => {
    if (!currentUser) return 0;
    switch(view) {
        case 'messages':
        case 'support': {
            const myClientProfile = clients.find(c => c.contactEmail === currentUser.email);
            const relevantProjectIds = projects
                .filter(p => {
                    if (currentUser.role === UserRole.ADMIN) return true;
                    if (currentUser.role === UserRole.EMPLOYEE) return p.assignedEmployeeIds.includes(currentUser.id);
                    if (currentUser.role === UserRole.CLIENT) return myClientProfile ? p.clientId === myClientProfile.id : false;
                    return false;
                })
                .map(p => p.id);
            
            const projectsWithUnread = new Set(
                chatMessages
                    .filter(msg => 
                        relevantProjectIds.includes(msg.projectId) &&
                        msg.senderId !== currentUser.id &&
                        !msg.readBy.includes(currentUser.id)
                    )
                    .map(msg => msg.projectId)
            );
            return projectsWithUnread.size;
        }
        case 'projects': {
            if (currentUser.role !== UserRole.ADMIN) return 0;
            return projects.filter(p => p.status === ProjectStatus.ON_HOLD || p.status === ProjectStatus.NOT_STARTED).length;
        }
        case 'billing': {
            if (currentUser.role !== UserRole.ADMIN) return 0;
            return invoices.filter(i => i.status === 'Overdue' || i.status === 'Draft').length;
        }
        case 'my-tasks': {
            if (currentUser.role !== UserRole.EMPLOYEE) return 0;
            return tasks.filter(t => t.employeeId === currentUser.id && t.status === 'To Do').length;
        }
        default:
            return 0;
    }
  };

  const adminLinks: NavLinkData[] = [
    { view: 'dashboard', label: 'Tableau de bord', icon: DashboardIcon },
    { view: 'projects', label: 'Projets & Tâches', icon: ProjectsIcon },
    { view: 'team', label: 'Équipe & Rôles', icon: TeamIcon },
    { view: 'messages', label: 'Messages', icon: MessagesIcon },
    { view: 'reports', label: 'Rapports & Perf.', icon: ReportsIcon },
    { view: 'billing', label: 'Facturation', icon: BillingIcon },
    { view: 'ai-insights', label: 'Insights IA', icon: AiIcon },
    { view: 'files', label: 'Fichiers', icon: FilesIcon },
    { view: 'settings', label: 'Paramètres', icon: SettingsIcon },
    { view: 'activity-log', label: "Journal d'activité", icon: ActivityLogIcon },
  ];

  const employeeLinks: NavLinkData[] = [
    { view: 'my-projects', label: 'Mes Projets', icon: ProjectsIcon },
    { view: 'my-tasks', label: 'Mes Tâches', icon: TasksIcon },
    { view: 'calendar', label: 'Planning', icon: CalendarIcon },
    { view: 'messages', label: 'Messages', icon: MessagesIcon },
    { view: 'time-tracking', label: 'Heures & Temps', icon: TimeTrackingIcon },
    { view: 'project-files', label: 'Fichiers du projet', icon: FilesIcon },
    { view: 'my-performance', label: 'Performance', icon: PerformanceIcon },
    { view: 'profile', label: 'Profil', icon: ProfileIcon },
  ];

  const clientLinks: NavLinkData[] = [
    { view: 'client-dashboard', label: 'Tableau de bord', icon: DashboardIcon },
    { view: 'client-projects', label: 'Mes Projets', icon: ProjectsIcon },
    { view: 'support', label: 'Messages / Support', icon: SupportIcon },
    { view: 'deliverables', label: 'Livrables', icon: DeliverablesIcon },
    { view: 'client-billing', label: 'Facturation', icon: BillingIcon },
    { view: 'feedback', label: 'Feedback', icon: FeedbackIcon },
    { view: 'client-profile', label: 'Profil', icon: ProfileIcon },
  ];

  let links;
  switch (currentUser.role) {
    case UserRole.ADMIN: links = adminLinks; break;
    case UserRole.EMPLOYEE: links = employeeLinks; break;
    case UserRole.CLIENT: links = clientLinks; break;
    default: links = [];
  }

  const handleLinkClick = (view: View) => {
    setActiveView(view);
    onCloseMobile();
  };

  const roleDisplayNames: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'Administrateur',
      [UserRole.EMPLOYEE]: 'Employé',
      [UserRole.CLIENT]: 'Client'
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50
      md:static md:z-auto md:inset-y-auto md:h-screen
      flex flex-col bg-slate-900/60 backdrop-blur-2xl border-r border-[var(--border-color)] 
      transition-all duration-500 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
      ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
        <div className={`flex items-center justify-between flex-shrink-0 h-20 px-4 border-b border-[var(--border-color)]`}>
            <h1 className={`font-display text-3xl font-bold tracking-wider text-white transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                Tely<span className="text-telya-green text-glow">a</span>
            </h1>
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="hidden md:block p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
                {isCollapsed ? <ChevronRightIcon className="w-5 h-5"/> : <ChevronLeftIcon className="w-5 h-5"/>}
            </button>
        </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {links.map((link) => {
          const badgeCount = getBadgeCount(link.view);
          return (
              <NavLink
                key={link.view}
                data={link}
                isActive={activeView === link.view}
                isCollapsed={isCollapsed}
                onClick={() => handleLinkClick(link.view)}
                badgeCount={badgeCount}
              />
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t border-[var(--border-color)]">
        <div className={`flex items-center space-x-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <img src={currentUser.avatar} alt="User Avatar" className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className={`text-left overflow-hidden flex-1 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                <p className="font-semibold text-sm text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{roleDisplayNames[currentUser.role]}</p>
            </div>
        </div>
        <button
            onClick={onLogout}
            className={`w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
            <LogoutIcon className="w-5 h-5 flex-shrink-0"/>
            <span className={`ml-2 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;