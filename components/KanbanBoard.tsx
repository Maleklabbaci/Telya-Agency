
import React, { useState } from 'react';
import { Project, Client, User, ProjectStatus } from '../types';
import { ClientsIcon } from './icons';

const statusStyles: { [key in ProjectStatus]: { border: string; text: string; } } = {
    [ProjectStatus.NOT_STARTED]: { border: 'border-slate-500', text: 'text-slate-300' },
    [ProjectStatus.IN_PROGRESS]: { border: 'border-blue-500', text: 'text-blue-300' },
    [ProjectStatus.ON_HOLD]: { border: 'border-yellow-500', text: 'text-yellow-300' },
    [ProjectStatus.COMPLETED]: { border: 'border-green-500', text: 'text-green-300' },
};


interface KanbanCardProps {
    project: Project;
    client: Client | undefined;
    team: User[];
}

const KanbanCard: React.FC<KanbanCardProps> = ({ project, client, team }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("projectId", project.id);
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    return (
        <div 
            draggable 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
            className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing mb-4 shadow-md hover:border-green-500/50 transition-all duration-200"
        >
            <h4 className="font-semibold text-white mb-1">{project.name}</h4>
            {client && (
                <div className="flex items-center space-x-2 text-sm text-slate-400 mb-3">
                    <ClientsIcon className="w-4 h-4" />
                    <span>{client.companyName}</span>
                </div>
            )}
             <div className="flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                    {team.slice(0, 3).map(member => (
                        <img
                            key={member.id}
                            src={member.avatar}
                            alt={member.name}
                            title={member.name}
                            className="w-7 h-7 rounded-full border-2 border-slate-700"
                        />
                    ))}
                    {team.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold border-2 border-slate-700">
                            +{team.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface KanbanBoardProps {
    projects: Project[];
    clients: Client[];
    users: User[];
    onUpdateProject: (project: Project) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects, clients, users, onUpdateProject }) => {
    const [draggedOverColumn, setDraggedOverColumn] = useState<ProjectStatus | null>(null);

    const columns: ProjectStatus[] = Object.values(ProjectStatus);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: ProjectStatus) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData("projectId");
        const projectToMove = projects.find(p => p.id === projectId);
        if (projectToMove && projectToMove.status !== status) {
            onUpdateProject({ ...projectToMove, status: status });
        }
        setDraggedOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, status: ProjectStatus) => {
        e.preventDefault();
        setDraggedOverColumn(status);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedOverColumn(null);
    };

    return (
        <div className="flex gap-6 overflow-x-auto p-4 h-full">
            {columns.map(status => (
                <div 
                    key={status}
                    onDrop={(e) => handleDrop(e, status)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, status)}
                    onDragLeave={handleDragLeave}
                    className={`
                        w-80 flex-shrink-0 bg-slate-900/30 rounded-xl flex flex-col
                        transition-colors duration-300 border-2 border-transparent
                        ${draggedOverColumn === status ? 'border-green-500/50 bg-green-500/5' : ''}
                    `}
                >
                    <div className={`p-4 border-b-2 ${statusStyles[status].border} sticky top-0 bg-slate-900/50 rounded-t-xl z-10 backdrop-blur-sm`}>
                        <h3 className={`font-display text-lg tracking-wide ${statusStyles[status].text}`}>{status}</h3>
                    </div>
                    <div className="p-2 flex-1 overflow-y-auto">
                        <div className="p-2 h-full">
                            {projects
                                .filter(p => p.status === status)
                                .map(project => {
                                    const client = clients.find(c => c.id === project.clientId);
                                    const team = users.filter(u => project.assignedEmployeeIds.includes(u.id));
                                    return <KanbanCard key={project.id} project={project} client={client} team={team} />;
                                })
                            }
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
