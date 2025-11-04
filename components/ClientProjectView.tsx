import React from 'react';
import { Project, User, Client, ProjectStatus } from '../types';
import { ChatBubbleLeftRightIcon, ProjectsIcon } from './icons';

interface ClientProjectViewProps {
  currentUser: User;
  projects: Project[];
  clients: Client[];
  users: User[];
  onViewChat: (project: Project) => void;
}

const statusColors: { [key in ProjectStatus]: string } = {
    [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-400 border-green-500/30',
    [ProjectStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [ProjectStatus.ON_HOLD]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    [ProjectStatus.NOT_STARTED]: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};


const ClientProjectView: React.FC<ClientProjectViewProps> = ({ currentUser, projects, clients, users, onViewChat }) => {
    const myClientProfile = clients.find(c => c.contactEmail === currentUser.email);
    if (!myClientProfile) {
        return <div className="p-6 text-center text-slate-400">Impossible de trouver votre profil client.</div>;
    }

    const myProjects = projects.filter(p => p.clientId === myClientProfile.id);

    return (
        <div className="p-6 md:p-8">
             <div className="mb-8">
                <h2 className="font-display text-4xl tracking-wide text-white">Mes Projets</h2>
                <p className="text-slate-400">Voici un aperçu de tous vos projets avec nous.</p>
            </div>

            {myProjects.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {myProjects.map(project => {
                        const team = users.filter(u => project.assignedEmployeeIds.includes(u.id));
                        const progress = project.status === ProjectStatus.COMPLETED ? 100 : project.status === ProjectStatus.IN_PROGRESS ? 60 : project.status === ProjectStatus.ON_HOLD ? 30 : 0;
                        return (
                            <div key={project.id} className="bg-slate-900/30 rounded-2xl shadow-lg border border-white/10 flex flex-col justify-between transition-all duration-300 hover:shadow-green-500/10 hover:border-white/20 hover:-translate-y-1">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-display text-2xl tracking-wide text-white pr-4">{project.name}</h3>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${statusColors[project.status]}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4 h-12 overflow-hidden">
                                        {project.description}
                                    </p>
                                    
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                                            <span>Progression</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Votre Équipe</h4>
                                        <div className="flex items-center -space-x-3">
                                            {team.map(member => (
                                                <img
                                                    key={member.id}
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    title={member.name}
                                                    className="w-9 h-9 rounded-full border-2 border-slate-800"
                                                />
                                            ))}
                                            {team.length === 0 && <span className="text-xs text-slate-500">Personne n'a encore été assigné.</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-b-2xl mt-auto">
                                     <button 
                                        onClick={() => onViewChat(project)}
                                        className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors text-sm shadow-lg shadow-green-600/20"
                                     >
                                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                                        Discussion du Projet
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                    <ProjectsIcon className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                    <h3 className="font-display text-xl tracking-wide text-white">Aucun projet trouvé</h3>
                    <p className="text-slate-400 mt-2">Vous n'avez pas encore de projet avec nous. Contactez votre manager pour commencer.</p>
                </div>
            )}
        </div>
    );
};

export default ClientProjectView;