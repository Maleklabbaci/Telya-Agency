import React, { useState, useEffect } from 'react';
import { Project, Client, User, UserRole, TimeLog, ActiveTimer, ProjectFile, Task } from '../types';
import { ArrowLeftIcon, ClientsIcon, UsersIcon, InformationCircleIcon, ChatBubbleLeftRightIcon, ClockIcon, PlayIcon, StopIcon, PlusIcon, FileTextIcon, DownloadIcon, TasksIcon } from './icons';

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

const taskStatusStyles: Record<TaskStatus, string> = {
    'To Do': 'bg-slate-500/20 text-slate-300',
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Completed': 'bg-green-500/20 text-green-400',
};

const taskStatusOptions: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-900/30 p-6 rounded-2xl flex items-center space-x-4 border border-white/10">
        <div className="bg-green-500/10 p-3 rounded-full text-green-400">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="font-display text-2xl tracking-wide text-white">{value}</p>
        </div>
    </div>
);


interface ProjectDetailsProps {
  project: Project;
  client: Client;
  team: User[];
  tasks: Task[];
  timeLogs: TimeLog[];
  files: ProjectFile[];
  currentUser: User;
  users: User[];
  onBack: () => void;
  onViewChat: (project: Project) => void;
  activeTimer: ActiveTimer | null;
  onStartTimer: (projectId: string) => void;
  onStopTimerAndLog: (logData: Omit<TimeLog, 'id' | 'employeeId'>) => void;
  onAddFile: (fileData: Omit<ProjectFile, 'id' | 'uploadedBy' | 'lastModified'>) => void;
  onUpdateTask: (task: Task) => void;
  onOpenTimeLogForm: (hours?: number) => void;
  onOpenFileUploadModal: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, client, team, tasks, timeLogs, files, currentUser, users, onBack, onViewChat, activeTimer, onStartTimer, onStopTimerAndLog, onAddFile, onUpdateTask, onOpenTimeLogForm, onOpenFileUploadModal }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const isEmployeeOnProject = currentUser.role === UserRole.EMPLOYEE && project.assignedEmployeeIds.includes(currentUser.id);
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  const timerForThisProject = activeTimer && activeTimer.projectId === project.id && activeTimer.employeeId === currentUser.id;

  useEffect(() => {
    let interval: number;
    if (timerForThisProject) {
        setElapsedTime(Date.now() - activeTimer.startTime);
        interval = window.setInterval(() => {
            setElapsedTime(Date.now() - activeTimer.startTime);
        }, 1000);
    } else {
        setElapsedTime(0);
    }
    return () => window.clearInterval(interval);
  }, [activeTimer, timerForThisProject]);

  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStopTimer = () => {
    if (!activeTimer) return;
    const elapsedHours = (Date.now() - activeTimer.startTime) / (1000 * 60 * 60);
    onOpenTimeLogForm(elapsedHours);
  };

  const projectTimeLogs = timeLogs.filter(log => log.projectId === project.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalHours = projectTimeLogs.reduce((acc, log) => acc + log.hours, 0);

  const getUserById = (id: string) => users.find(u => u.id === id);

  return (
    <>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
          <div>
              <button
                onClick={onBack}
                className="flex items-center text-sm text-slate-400 hover:text-white font-semibold transition-colors mb-2"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Retour aux Projets
              </button>
              <h2 className="font-display text-4xl tracking-wide text-white">{project.name}</h2>
              <p className="text-slate-400">Associé à <span className="font-semibold text-slate-200">{client.companyName}</span></p>
          </div>
          <button
            onClick={() => onViewChat(project)}
            className="flex-shrink-0 flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
            Ouvrir la Discussion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Statut" value={project.status} icon={<InformationCircleIcon className="h-6 w-6" />} />
          <StatCard title="Client" value={client.companyName} icon={<ClientsIcon className="h-6 w-6" />} />
          <StatCard title="Taille de l'équipe" value={team.length} icon={<UsersIcon className="h-6 w-6" />} />
          <StatCard title="Heures Enregistrées" value={totalHours.toFixed(1)} icon={<ClockIcon className="h-6 w-6" />} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/30 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="font-display text-2xl tracking-wide text-white mb-4">Description du Projet</h3>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{project.description}</p>
            </div>

            {/* Tasks Section */}
            <div className="bg-slate-900/30 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="font-display text-2xl tracking-wide text-white mb-4">Tâches</h3>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map(task => {
                    const assignee = getUserById(task.employeeId);
                    return (
                      <div key={task.id} className="bg-slate-800/50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-slate-200 flex-1">{task.title}</p>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {assignee && <img src={assignee.avatar} alt={assignee.name} title={`Assigné à ${assignee.name}`} className="w-6 h-6 rounded-full"/>}
                          <select 
                            value={task.status} 
                            onChange={(e) => onUpdateTask({ ...task, status: e.target.value as TaskStatus })} 
                            className={`appearance-none text-xs font-semibold px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 cursor-pointer ${taskStatusStyles[task.status]}`}
                            disabled={!isAdmin && currentUser.id !== task.employeeId}
                          >
                            {taskStatusOptions.map(opt => (<option key={opt} value={opt} style={{ backgroundColor: '#1e293b' }}>{opt}</option>))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <TasksIcon className="w-10 h-10 mx-auto mb-2"/>
                  <p>Aucune tâche assignée à ce projet.</p>
                </div>
              )}
            </div>

            {/* Files Section */}
            <div className="bg-slate-900/30 rounded-2xl shadow-lg p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-2xl tracking-wide text-white">Fichiers du Projet</h3>
                {(isAdmin || isEmployeeOnProject) && (
                  <button onClick={onOpenFileUploadModal} className="flex items-center bg-telya-green/10 text-telya-green text-sm font-bold py-2 px-3 rounded-lg hover:bg-telya-green/20 transition-colors">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Ajouter un Fichier
                  </button>
                )}
              </div>
               {files.length > 0 ? (
                <div className="space-y-3">
                  {files.map(file => (
                    <div key={file.id} className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileTextIcon className="w-5 h-5 text-slate-400" />
                        <div>
                            <p className="font-semibold text-white">{file.name}</p>
                            <p className="text-xs text-slate-400">
                                {file.size} - Ajouté par {getUserById(file.uploadedBy)?.name}
                            </p>
                        </div>
                      </div>
                      <button className="p-2 rounded-full hover:bg-slate-700/50">
                        <DownloadIcon className="w-5 h-5 text-slate-300" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">Aucun fichier n'a encore été ajouté à ce projet.</p>
              )}
            </div>

          </div>
          
          <div className="space-y-8">
            {/* Time Tracking Section */}
            <div className="bg-slate-900/30 rounded-2xl shadow-lg p-6 border border-white/10">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h3 className="font-display text-2xl tracking-wide text-white">Suivi du temps</h3>
                    {(isAdmin || isEmployeeOnProject) && (
                        <div className="flex items-center gap-4">
                            {timerForThisProject && (
                                <div className="text-center">
                                    <p className="font-mono text-2xl text-green-400 tracking-wider">{formatElapsedTime(elapsedTime)}</p>
                                    <p className="text-xs text-slate-400">Temps écoulé</p>
                                </div>
                            )}
                            {timerForThisProject ? (
                                <button onClick={handleStopTimer} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-red-600/20 transition-all">
                                    <StopIcon className="w-5 h-5 mr-2"/>
                                    Arrêter
                                </button>
                            ) : (
                                <button onClick={() => onStartTimer(project.id)} disabled={!!activeTimer} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-green-600/20 transition-all disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed">
                                    <PlayIcon className="w-5 h-5 mr-2"/>
                                    Démarrer
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {projectTimeLogs.length > 0 ? (
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {projectTimeLogs.map(log => {
                            const employee = getUserById(log.employeeId);
                            return (
                                <div key={log.id} className="bg-slate-800/50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-white text-sm pr-4">{log.description}</p>
                                        <div className="bg-green-500/10 text-green-300 font-bold text-sm px-3 py-1 rounded-md whitespace-nowrap">
                                            {log.hours.toFixed(1)} h
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                                        {employee && (
                                            <div className="flex items-center space-x-2">
                                                <img src={employee.avatar} alt={employee.name} className="w-5 h-5 rounded-full" />
                                                <span>{employee.name}</span>
                                            </div>
                                        )}
                                        <span>{new Date(log.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-8">Aucune heure enregistrée.</p>
                )}
            </div>

            <div className="bg-slate-900/30 rounded-2xl shadow-lg p-6 border border-white/10">
              <h3 className="font-display text-2xl tracking-wide text-white mb-4">Équipe Assignée</h3>
              <ul className="space-y-4">
                {team.map(member => (
                  <li key={member.id} className="flex items-center space-x-4">
                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-semibold text-white">{member.name}</p>
                      <p className="text-sm text-slate-400">{member.position}</p>
                    </div>
                  </li>
                ))}
                {team.length === 0 && <p className="text-slate-400">Aucun membre d'équipe assigné.</p>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;