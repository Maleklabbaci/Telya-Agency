import React, { useState, useRef, useEffect } from 'react';
import { Project, User, Client, UserRole, ProjectStatus, TimeLog, Task } from '../types';
import { DotsVerticalIcon, PlusIcon, ClientsIcon, ProjectsIcon, ViewGridIcon, ViewColumnsIcon, ClockIcon, RefreshIcon, TasksIcon } from './icons';
import KanbanBoard from './KanbanBoard';

interface ProjectManagementViewProps {
  projects: Project[];
  users: User[];
  clients: Client[];
  currentUser: User;
  timeLogs: TimeLog[];
  tasks: Task[];
  onAdd: (data: any) => void;
  onUpdate: (data: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (project: Project) => void;
  onManualRefresh: () => void;
  onAddTask: (data: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddProject: () => void;
  onOpenEditProject: (project: Project) => void;
  onOpenDeleteProject: (project: Project) => void;
  onOpenAddTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onOpenDeleteTask: (task: Task) => void;
}

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

const projectStatusColors: { [key in ProjectStatus]: string } = {
    [ProjectStatus.COMPLETED]: 'bg-green-500/20 text-green-400',
    [ProjectStatus.IN_PROGRESS]: 'bg-blue-500/20 text-blue-400',
    [ProjectStatus.ON_HOLD]: 'bg-yellow-500/20 text-yellow-400',
    [ProjectStatus.NOT_STARTED]: 'bg-slate-500/20 text-slate-400',
};

const taskStatusStyles: Record<TaskStatus, string> = {
    'To Do': 'bg-slate-500/20 text-slate-300',
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Completed': 'bg-green-500/20 text-green-400',
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
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-lg py-1 z-20 border border-slate-700 animate-scaleIn origin-top-right">
                    {children}
                </div>
            )}
        </div>
    );
};


const ProjectManagementView: React.FC<ProjectManagementViewProps> = ({ projects, users, clients, currentUser, timeLogs, tasks, onAdd, onUpdate, onDelete, onViewDetails, onManualRefresh, onAddTask, onUpdateTask, onDeleteTask, onOpenAddProject, onOpenEditProject, onOpenDeleteProject, onOpenAddTask, onOpenEditTask, onOpenDeleteTask }) => {
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');
    const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getClientName = (id: string) => clients.find(c => c.id === id)?.companyName || 'Inconnu';

    const handleRefreshClick = () => {
        setIsRefreshing(true);
        onManualRefresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const tasksByProject = tasks.reduce((acc, task) => {
        if (!acc[task.projectId]) {
            acc[task.projectId] = [];
        }
        acc[task.projectId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);
    
    return (
        <div className="p-4 md:p-8 flex flex-col h-full">
            <div className="flex-shrink-0">
                <div className="border-b border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'projects' ? 'border-telya-green text-telya-green' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
                        >
                            <ProjectsIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'projects' ? 'text-telya-green' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>Projets</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks' ? 'border-telya-green text-telya-green' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}
                        >
                            <TasksIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'tasks' ? 'text-telya-green' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>Tâches</span>
                        </button>
                    </nav>
                </div>
            </div>

            <div className="py-6 flex-1 flex flex-col min-h-0">
                 {/* Project View */}
                <div className={`flex-1 min-h-0 ${activeTab === 'projects' ? 'flex flex-col' : 'hidden'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                           <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-telya-green/20 text-telya-green' : 'text-slate-400 hover:bg-slate-700/50'}`}><ViewGridIcon className="w-5 h-5"/></button>
                           <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-telya-green/20 text-telya-green' : 'text-slate-400 hover:bg-slate-700/50'}`}><ViewColumnsIcon className="w-5 h-5"/></button>
                           <button onClick={handleRefreshClick} className="p-2 rounded-lg text-slate-400 hover:bg-slate-700/50"><RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}/></button>
                        </div>
                        {isAdmin && (
                            <button onClick={onOpenAddProject} className="flex items-center bg-telya-green hover:bg-emerald-500 text-slate-900 font-bold py-2 px-4 rounded-lg shadow-lg shadow-telya-green/20 hover:shadow-telya-green/30 transition-all duration-300 transform hover:scale-105">
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Ajouter un projet
                            </button>
                        )}
                    </div>

                    {projects.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 overflow-y-auto p-1">
                                {projects.map(project => {
                                    const team = users.filter(u => project.assignedEmployeeIds.includes(u.id));
                                    const projectTimeLogs = timeLogs.filter(log => log.projectId === project.id);
                                    const totalHours = projectTimeLogs.reduce((acc, log) => acc + log.hours, 0);
                                    return (
                                        <div key={project.id} className="bg-slate-900/50 rounded-2xl p-5 border border-[var(--border-color)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-white text-lg pr-4">{project.name}</h3>
                                                    <ActionMenu>
                                                        <button onClick={() => onViewDetails(project)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Voir les détails</button>
                                                        <button onClick={() => onOpenEditProject(project)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Modifier</button>
                                                        <button onClick={() => onOpenDeleteProject(project)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50">Supprimer</button>
                                                    </ActionMenu>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
                                                    <ClientsIcon className="w-4 h-4" />
                                                    <span>{getClientName(project.clientId)}</span>
                                                </div>
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${projectStatusColors[project.status]}`}>
                                                    {project.status}
                                                </span>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-800">
                                                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
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
                                                        {team.length === 0 && <span className="text-xs text-slate-500 pl-3">Aucune équipe</span>}
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <ClockIcon className="w-4 h-4" />
                                                        <span>{totalHours.toFixed(1)}h</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 -m-4">
                                <KanbanBoard projects={projects} clients={clients} users={users} onUpdateProject={onUpdate} />
                            </div>
                        )
                    ) : (
                        <div className="text-center py-20 text-slate-400 flex-1 flex flex-col justify-center items-center">
                            <ProjectsIcon className="w-12 h-12 text-slate-600 mb-4"/>
                            <h3 className="font-display text-xl text-white">Aucun projet trouvé</h3>
                            <p className="mt-1">Commencez par en ajouter un nouveau.</p>
                        </div>
                    )}
                </div>

                {/* Tasks View */}
                <div className={`flex-1 min-h-0 ${activeTab === 'tasks' ? 'flex flex-col' : 'hidden'}`}>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="font-display text-3xl tracking-wide text-white">Toutes les Tâches</h2>
                        <button onClick={onOpenAddTask} className="flex items-center bg-telya-green hover:bg-emerald-500 text-slate-900 font-bold py-2 px-4 rounded-lg shadow-lg shadow-telya-green/20 hover:shadow-telya-green/30 transition-all duration-300">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nouvelle Tâche
                        </button>
                    </div>
                     <div className="space-y-6 overflow-y-auto p-1">
                        {Object.entries(tasksByProject).map(([projectId, projectTasks]) => (
                             <div key={projectId} className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                                <h3 className="font-display text-2xl text-white mb-4">{projects.find(p=>p.id === projectId)?.name}</h3>
                                <div className="space-y-3">
                                    {(projectTasks as Task[]).map(task => {
                                         const assignee = users.find(u => u.id === task.employeeId);
                                         return (
                                            <div key={task.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between gap-2">
                                                <p className="text-slate-200 flex-1">{task.title}</p>
                                                <div className="flex items-center gap-3">
                                                    {assignee && <img src={assignee.avatar} alt={assignee.name} title={`Assigné à ${assignee.name}`} className="w-6 h-6 rounded-full"/>}
                                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${taskStatusStyles[task.status]}`}>{task.status}</span>
                                                     <ActionMenu>
                                                        <button onClick={() => onOpenEditTask(task)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Modifier</button>
                                                        <button onClick={() => onOpenDeleteTask(task)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50">Supprimer</button>
                                                    </ActionMenu>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectManagementView;