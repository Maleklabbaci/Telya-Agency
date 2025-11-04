import React from 'react';
import { Task, Project, User } from '../types';

interface EmployeeTasksViewProps {
    currentUser: User;
    tasks: Task[];
    projects: Project[];
    onUpdateTask: (task: Task) => void;
}

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

const statusStyles: Record<TaskStatus, string> = {
    'To Do': 'bg-slate-500/20 text-slate-300',
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Completed': 'bg-green-500/20 text-green-400',
};

const statusOptions: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

const EmployeeTasksView: React.FC<EmployeeTasksViewProps> = ({ currentUser, tasks, projects, onUpdateTask }) => {
    const myTasks = tasks.filter(t => t.employeeId === currentUser.id);

    const tasksByProject = myTasks.reduce((acc, task) => {
        if (!acc[task.projectId]) {
            acc[task.projectId] = [];
        }
        acc[task.projectId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Projet Inconnu';

    const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
        onUpdateTask({ ...task, status: newStatus });
    };

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-6">Mes Tâches</h2>

            <div className="space-y-6">
                {Object.entries(tasksByProject).map(([projectId, projectTasks]) => (
                    <div key={projectId} className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-display text-2xl text-white mb-4">{getProjectName(projectId)}</h3>
                        <div className="space-y-3">
                            {(projectTasks as Task[]).map(task => (
                                <div key={task.id} className="bg-slate-800/50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <p className="text-slate-200 flex-1">{task.title}</p>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                                            className={`appearance-none text-xs font-semibold px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 cursor-pointer ${statusStyles[task.status]}`}
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt} style={{ backgroundColor: '#1e293b' }}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {myTasks.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <p>Vous n'avez aucune tâche assignée pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeTasksView;