

import React from 'react';
import { User, UserRole } from '../types';
import { DashboardIcon, UsersIcon, ClientsIcon, ProjectsIcon, EnvelopeIcon, LogoutIcon, CogIcon } from './icons';

interface SidebarProps {
  currentUser: User;
  activeView: string;
  setActiveView: (view: string) => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onOpenProfileSettings: () => void;
  unreadCount: number;
}

const NavLink: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; count: number; onClick: () => void; }> = ({ icon, label, isActive, count, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg group ${
      isActive
        ? 'bg-green-500/10 text-green-400 font-semibold shadow-[0_0_15px_rgba(34,197,94,0.4)]'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
    }`}
  >
    <div className="flex items-center">
      <span className={`transition-colors duration-300 ${isActive ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
      <span className="ml-3">{label}</span>
    </div>
    {count > 0 && (
      <span className="ml-auto text-xs bg-green-600 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-slate-800">
        {count}
      </span>
    )}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeView, setActiveView, isOpenOnMobile, onCloseMobile, onLogout, onOpenProfileSettings, unreadCount }) => {
  const commonLinks = [
    { view: 'dashboard', label: 'Tableau de bord', icon: <DashboardIcon className="w-6 h-6" />, count: 0 },
  ];
  
  const messageLink = { view: 'messages', label: 'Messages', icon: <EnvelopeIcon className="w-6 h-6" />, count: unreadCount };

  const adminLinks = [
    ...commonLinks,
    messageLink,
    { view: 'employees', label: 'Employés', icon: <UsersIcon className="w-6 h-6" />, count: 0 },
    { view: 'clients', label: 'Clients', icon: <ClientsIcon className="w-6 h-6" />, count: 0 },
    { view: 'projects', label: 'Projets', icon: <ProjectsIcon className="w-6 h-6" />, count: 0 },
  ];
  
  const employeeLinks = [
    ...commonLinks,
    messageLink,
    { view: 'projects', label: 'Projets', icon: <ProjectsIcon className="w-6 h-6" />, count: 0 },
    { view: 'my-clients', label: 'Mes Clients', icon: <ClientsIcon className="w-6 h-6" />, count: 0 },
  ];

  const clientLinks = [
    ...commonLinks,
    { view: 'my-projects', label: 'Mes Projets', icon: <ProjectsIcon className="w-6 h-6" />, count: 0 },
    { view: 'my-team', label: 'Mon Équipe', icon: <UsersIcon className="w-6 h-6" />, count: 0 },
  ];

  let links;
  switch (currentUser.role) {
    case UserRole.ADMIN:
      links = adminLinks;
      break;
    case UserRole.EMPLOYEE:
      links = employeeLinks;
      break;
    case UserRole.CLIENT:
      links = clientLinks;
      break;
    default:
      links = commonLinks;
  }

  const handleLinkClick = (view: string) => {
    setActiveView(view);
    onCloseMobile();
  };

  const roleDisplayNames: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'Administrateur',
      [UserRole.EMPLOYEE]: 'Employé',
      [UserRole.CLIENT]: 'Client'
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50
      md:static md:z-auto md:inset-y-auto md:h-full
      flex flex-col w-64 bg-slate-900/40 backdrop-blur-2xl border-r border-white/10 
      transition-transform duration-300 ease-in-out
      ${isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
    `}>
      <div className="flex items-center justify-center h-20 flex-shrink-0 border-b border-white/10">
        <h1 className="font-display text-3xl font-bold tracking-wider text-white">Tely<span className="text-green-500 text-glow">a</span></h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ view, label, icon, count }) => (
          <NavLink
            key={view}
            icon={icon}
            label={label}
            isActive={activeView === view}
            onClick={() => handleLinkClick(view)}
            count={count}
          />
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center space-x-3 mb-4">
            <img src={currentUser.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
            <div className="text-left overflow-hidden flex-1">
                <p className="font-semibold text-sm text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{roleDisplayNames[currentUser.role]}</p>
            </div>
             <button onClick={onOpenProfileSettings} title="Modifier le profil" className="ml-auto text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50 transition-colors">
                <CogIcon className="w-5 h-5" />
            </button>
        </div>
        <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
            <LogoutIcon className="w-5 h-5 mr-2"/>
            Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Sidebar;