

import React, { useState, useRef, useEffect } from 'react';
import { Project, User, Client, UserRole, ProjectStatus, TimeLog } from '../types';
import ConfirmationModal from './ConfirmationModal';
import ProjectForm from './forms/ProjectForm';
import { DotsVerticalIcon, PlusIcon, ClientsIcon, ProjectsIcon, ViewGridIcon, ViewColumnsIcon, ClockIcon, RefreshIcon } from './icons';
import KanbanBoard from './KanbanBoard';

interface ProjectManagementViewProps {
  projects: Project[];
  users: User[];
  clients: Client[];
  currentUser: User;
  timeLogs: TimeLog[];
  onAdd: (data: any) => void;
  onUpdate: (data: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (project: Project) => void;
  onManualRefresh: () => void;
}

const statusColors: { [key in ProjectStatus]: string } = {
    [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
    [ProjectStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400',
    [ProjectStatus.ON_HOLD]: 'bg-yellow-500/20 text-yellow-400',
    [ProjectStatus.NOT_STARTED]: 'bg-slate-500/20 text-slate-400',
};

const ActionMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50">
                <DotsVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-lg py-1 z-20 border border-slate-700">
                    {children}
                </div>
            )}
        </div>
    );
};


const ProjectManagementView: React.FC<ProjectManagementViewProps> = ({ projects, users, clients, currentUser, timeLogs, onAdd, onUpdate, onDelete, onViewDetails, onManualRefresh }) => {
    const isAdmin = currentUser.role === UserRole.ADMIN;

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getClientById = (id: string) => clients.find(c => c.id === id);
    const getEmployeesByIds = (ids: string[]) => users.filter(u => ids.includes(u.id));

    const handleOpenAddModal = () => {
        setSelectedProject(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (project: Project) => {
        setSelectedProject(project);
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteModal = (project: Project) => {
        setSelectedProject(project);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedProject(null);
    };

    const handleSave = (data: Omit<Project, 'id'>) => {
        if (selectedProject) {
            onUpdate({ ...selectedProject, ...data });
        } else {
            onAdd(data);
        }
        handleCloseModals();
    };

    const handleDelete = () => {
        if (selectedProject) {
            onDelete(selectedProject.id);
        }
        handleCloseModals();
    };

    const handleRefreshClick = () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        onManualRefresh(); 
        
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1500);
    };

    return (
        <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-3xl tracking-wide text-white">
                    Projets
                </h2>
                <div className="flex items-center gap-4">
                     <button
                        onClick={handleRefreshClick}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors disabled:cursor-wait disabled:text-green-400"
                        aria-label="Rafraîchir les données"
                    >
                        <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center space-x-1 p-1 bg-slate-800/50 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-green-600/20 text-green-400' : 'text-slate-400 hover:text-white'}`}
                            aria-label="Vue grille"
                        >
                            <ViewGridIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-green-600/20 text-green-400' : 'text-slate-400 hover:text-white'}`}
                            aria-label="Vue Kanban"
                        >
                            <ViewColumnsIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {isAdmin && (
                        <button onClick={handleOpenAddModal} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-300">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nouveau Projet
                        </button>
                    )}
                </div>
            </div>
            
            <div className={`bg-slate-900/30 rounded-2xl shadow-lg border-white/10 ${viewMode === 'kanban' ? 'flex-1 overflow-hidden' : 'p-1 md:p-0'}`}>
                 {projects.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-1 md:p-6">
                            {projects.map(project => {
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
                                    <div key={project.id} className="bg-slate-900/30 rounded-2xl p-5 border border-white/10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 onClick={() => onViewDetails(project)} className="font-semibold text-white text-lg pr-4 cursor-pointer hover:text-green-400 transition-colors">{project.name}</h3>
                                                <ActionMenu>
                                                    <button onClick={() => onViewDetails(project)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Détails</button>
                                                    {isAdmin && (
                                                    <>
                                                        <button onClick={() => handleOpenEditModal(project)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Modifier</button>
                                                        <button onClick={() => handleOpenDeleteModal(project)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50">Supprimer</button>
                                                    </>
                                                    )}
                                                </ActionMenu>
                                            </div>
                                            {client && (
                                                <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
                                                    <ClientsIcon className="w-4 h-4" />
                                                    <span>{client.companyName}</span>
                                                </div>
                                            )}
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[project.status]}`}>
                                                {project.status}
                                            </span>
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
                        <KanbanBoard projects={projects} clients={clients} users={users} onUpdateProject={onUpdate} />
                    )
                ) : (
                    <div className="text-center py-20 text-slate-400">
                         <div className="flex justify-center mb-4">
                            <ProjectsIcon className="w-12 h-12 text-slate-600"/>
                        </div>
                        <h3 className="font-display text-xl text-white">Aucun projet trouvé</h3>
                        <p className="mt-1">Commencez par en créer un nouveau.</p>
                    </div>
                )}
            </div>

            <ProjectForm
                isOpen={isFormModalOpen}
                onClose={handleCloseModals}
                onSave={handleSave}
                project={selectedProject}
                clients={clients}
                employees={users.filter(u => u.role === UserRole.EMPLOYEE)}
            />

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title="Supprimer le Projet"
                message={`Êtes-vous sûr de vouloir supprimer le projet "${selectedProject?.name}" ? Cette action est irréversible.`}
            />
        </div>
    );
};

export default ProjectManagementView;