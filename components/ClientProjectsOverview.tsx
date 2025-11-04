import React from 'react';
import { Client, Project, User, ProjectStatus } from '../types';
import { ArrowLeftIcon, BriefcaseIcon } from './icons';

interface ClientProjectsOverviewProps {
  client: Client;
  projects: Project[];
  users: User[];
  onBack: () => void;
}

const statusColors: { [key in ProjectStatus]: string } = {
    [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
    [ProjectStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400',
    [ProjectStatus.ON_HOLD]: 'bg-yellow-500/20 text-yellow-400',
    [ProjectStatus.NOT_STARTED]: 'bg-slate-500/20 text-slate-400',
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-900/30 p-6 rounded-2xl flex items-center space-x-4 border border-white/10">
        <div className="bg-green-500/10 p-3 rounded-full text-green-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="font-display text-3xl tracking-wide text-white">{value}</p>
        </div>
    </div>
);


const ClientProjectsOverview: React.FC<ClientProjectsOverviewProps> = ({ client, projects, users, onBack }) => {
  const clientProjects = projects.filter(p => p.clientId === client.id);
  const totalProjects = clientProjects.length;
  const inProgressProjects = clientProjects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
  const completedProjects = clientProjects.filter(p => p.status === ProjectStatus.COMPLETED).length;
  const teamMembers = users.filter(u => client.assignedEmployeeIds.includes(u.id));

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
            <img src={client.logo} alt={client.companyName} className="w-16 h-16 p-2 object-contain bg-white rounded-full" />
            <div>
                <h2 className="font-display text-4xl tracking-wide text-white">{client.companyName}</h2>
                <p className="text-slate-400">Aperçu des projets</p>
            </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 font-semibold transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Retour aux clients
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Projets" value={totalProjects} icon={<BriefcaseIcon className="h-6 w-6" />} />
        <StatCard title="En cours" value={inProgressProjects} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12A8 8 0 1013 5.5" /></svg>} />
        <StatCard title="Terminés" value={completedProjects} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Membres de l'équipe" value={teamMembers.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
      </div>

      {/* Projects List */}
      <div className="bg-slate-900/30 rounded-2xl shadow-lg overflow-hidden border border-white/10">
        <div className="p-5 bg-slate-800/60">
            <h3 className="font-display text-xl tracking-wide text-white">Détails des projets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Nom du projet</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Équipe assignée</th>
              </tr>
            </thead>
            <tbody>
              {clientProjects.map(project => {
                const team = users.filter(u => project.assignedEmployeeIds.includes(u.id));
                return (
                  <tr key={project.id} className="border-b border-slate-700 hover:bg-green-500/5 transition-colors duration-200">
                    <td className="px-6 py-4 font-semibold text-white">{project.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[project.status]}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center -space-x-3">
                        {team.map(member => (
                          <img
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            title={member.name}
                            className="w-8 h-8 rounded-full border-2 border-slate-800"
                          />
                        ))}
                         {team.length === 0 && <span className="text-slate-400">Aucune équipe assignée</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {clientProjects.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center p-6 text-slate-400">Ce client n'a pas encore de projets.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientProjectsOverview;