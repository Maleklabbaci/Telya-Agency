
import React, { useState } from 'react';
import { User, Client, Task, Project } from '../types';
import ManagementView from './ManagementView';
import { UsersIcon, BriefcaseIcon } from './icons';
import EmployeeTasksModal from './EmployeeTasksModal';

interface TeamViewProps {
  users: User[];
  clients: Client[];
  currentUser: User;
  tasks: Task[];
  projects: Project[];
  onAddUser: (data: any) => void;
  onUpdateUser: (data: any) => void;
  onDeleteUser: (id: string) => void;
  onAddClient: (data: any) => void;
  onUpdateClient: (data: any) => void;
  onDeleteClient: (id: string) => void;
  onViewClientProjects: (client: Client) => void;
}

const TeamView: React.FC<TeamViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'employees' | 'clients'>('employees');
    const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
    const [selectedEmployeeForTasks, setSelectedEmployeeForTasks] = useState<User | null>(null);

    const handleOpenTasksModal = (employee: User) => {
        setSelectedEmployeeForTasks(employee);
        setIsTasksModalOpen(true);
    };

    const handleCloseTasksModal = () => {
        setIsTasksModalOpen(false);
        setSelectedEmployeeForTasks(null);
    };


    return (
        <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex-shrink-0 mb-6">
                <div className="border-b border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === 'employees' 
                                    ? 'border-telya-green text-telya-green' 
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}
                            `}
                        >
                            <UsersIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'employees' ? 'text-telya-green' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>Employés</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === 'clients' 
                                    ? 'border-telya-green text-telya-green' 
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}
                            `}
                        >
                            <BriefcaseIcon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'clients' ? 'text-telya-green' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span>Clients</span>
                        </button>
                    </nav>
                </div>
            </div>

            <div className="flex-1 -m-6 md:-m-8">
                {activeTab === 'employees' ? (
                    <ManagementView 
                        type="employee"
                        users={props.users}
                        clients={props.clients}
                        currentUser={props.currentUser}
                        onAdd={props.onAddUser}
                        onUpdate={props.onUpdateUser}
                        onDelete={props.onDeleteUser}
                        onViewEmployeeTasks={handleOpenTasksModal}
                    />
                ) : (
                    <ManagementView 
                        type="client"
                        users={props.users}
                        clients={props.clients}
                        currentUser={props.currentUser}
                        onAdd={props.onAddClient}
                        onUpdate={props.onUpdateClient}
                        onDelete={props.onDeleteClient}
                        onViewClientProjects={props.onViewClientProjects}
                    />
                )}
            </div>

            <EmployeeTasksModal
                isOpen={isTasksModalOpen}
                onClose={handleCloseTasksModal}
                employee={selectedEmployeeForTasks}
                tasks={props.tasks}
                projects={props.projects}
            />
        </div>
    );
};

export default TeamView;