import React from 'react';
import { Project, User, Client, ProjectStatus, TimeLog } from '../types';
import { ProjectsIcon, ClockIcon, ClientsIcon } from './icons';

interface EmployeeProjectViewProps {
  projects: Project[];
  users: User[];
  clients: Client[];
  currentUser: User;
  timeLogs: TimeLog[];
  onViewDetails: (project: Project) => void;
}

const statusColors: { [key in ProjectStatus]: string } = {
    [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
    [ProjectStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400',
    [ProjectStatus.ON_HOLD]: 'bg-yellow-500/20 text-yellow-400',
    [ProjectStatus.NOT_STARTED]: 'bg-slate-500/20 text-slate-400',
};

const EmployeeProjectView: React.FC<EmployeeProjectViewProps> = ({ projects, users, clients, currentUser, timeLogs, onViewDetails }) => {
    
    const myProjects = projects.filter(p => p.assignedEmployeeIds.includes(currentUser.id));

    const getClientById = (id: string) => clients.find(c => c.id === id);
    const getEmployeesByIds = (ids: string[]) => users.filter(u => ids.includes(u.id));

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-3xl tracking-wide text-white">
                    Mes Projets
                </h2>
            </div>
            
            <div className="bg-slate-900/30 rounded-2xl shadow-lg border-white/10 p-1 md:p-0">
                {myProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-1 md:p-6">
                        {myProjects.map(project => {
                            const client = getClientById(project.clientId);
                            const team = getEmployeesByIds(project.assignedEmployeeIds);
                            const projectTimeLogs = timeLogs.filter(log => log.projectId === project.id);
                            const totalHours = projectTimeLogs.reduce((acc, log) => acc + log.hours, 0);

                            let progressPercent = 0;
                            const assumedTargetHours = 80;
                            if (project.status === ProjectStatus.COMPLETED) {
                                progressPercent = 100;
                            } else if (totalHours > 0) {
                                const calculatedProgress = (totalHours / assumedTargetHours) * 100;
                                progressPercent = Math.max(5, Math.min(calculatedProgress, 100));
                            }

                            return (
                                <div 
                                    key={project.id} 
                                    onClick={() => onViewDetails(project)}
                                    className="bg-slate-900/30 rounded-2xl p-5 border border-white/10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-white text-lg pr-4">{project.name}</h3>
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[project.status]}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                        {client && (
                                            <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
                                                <ClientsIcon className="w-4 h-4" />
                                                <span>{client.companyName}</span>
                                            </div>
                                        )}
                                        {(totalHours > 0 || project.status === ProjectStatus.COMPLETED) && (
                                            <div className="mt-4">
                                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                                    <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                                                    <div className="flex items-center">
                                                        <ClockIcon className="w-3 h-3 mr-1" />
                                                        <span>Heures enregistrées</span>
                                                    </div>
                                                    <span className="font-semibold text-white">{totalHours.toFixed(1)}h</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                        <p className="text-xs text-slate-400 mb-2">Équipe:</p>
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
                                            {team.length === 0 && <span className="text-xs text-slate-500 pl-3">Aucune</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                     <div className="text-center py-20 text-slate-400">
                         <div className="flex justify-center mb-4">
                            <ProjectsIcon className="w-12 h-12 text-slate-600"/>
                        </div>
                        <h3 className="font-display text-xl text-white">Aucun projet trouvé</h3>
                        <p className="mt-1">Aucun projet ne vous a encore été assigné.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeProjectView;