
import React, { useState, useEffect } from 'react';
import { Project, Client, User, UserRole, TimeLog, ActiveTimer } from '../types';
import { ArrowLeftIcon, ClientsIcon, UsersIcon, InformationCircleIcon, ChatBubbleLeftRightIcon, ClockIcon, PlayIcon, StopIcon } from './icons';
import TimeLogForm from './forms/TimeLogForm';

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


interface ProjectDetailsViewProps {
  project: Project;
  client: Client;
  team: User[];
  timeLogs: TimeLog[];
  currentUser: User;
  users: User[];
  onBack: () => void;
  onViewChat: (project: Project) => void;
  activeTimer: ActiveTimer | null;
  onStartTimer: (projectId: string) => void;
  onStopTimerAndLog: (logData: Omit<TimeLog, 'id' | 'employeeId'>) => void;
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ project, client, team, timeLogs, currentUser, users, onBack, onViewChat, activeTimer, onStartTimer, onStopTimerAndLog }) => {
  const [isTimeLogFormOpen, setIsTimeLogFormOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hoursForForm, setHoursForForm] = useState<number | undefined>(undefined);
  
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
    setHoursForForm(elapsedHours);
    setIsTimeLogFormOpen(true);
  };

  const handleSaveTimeLog = (logData: { date: string; hours: number; description: string; }) => {
    onStopTimerAndLog({
      ...logData,
      projectId: project.id,
    });
    setIsTimeLogFormOpen(false);
    setHoursForForm(undefined);
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
          <div className="lg:col-span-2 bg-slate-900/30 rounded-2xl shadow-lg p-6 border border-white/10">
            <h3 className="font-display text-2xl tracking-wide text-white mb-4">Description du Projet</h3>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{project.description}</p>
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

        {/* Time Tracking Section */}
        <div className="mt-8 bg-slate-900/30 rounded-2xl shadow-lg p-6 border border-white/10">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                 <h3 className="font-display text-2xl tracking-wide text-white">Suivi du temps</h3>
                 {isEmployeeOnProject && (
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
                                Arrêter le minuteur
                            </button>
                        ) : (
                            <button onClick={() => onStartTimer(project.id)} disabled={!!activeTimer} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-green-600/20 transition-all disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed">
                                <PlayIcon className="w-5 h-5 mr-2"/>
                                Démarrer le minuteur
                            </button>
                        )}
                    </div>
                 )}
            </div>
            {projectTimeLogs.length > 0 ? (
                <div className="space-y-4">
                    {projectTimeLogs.map(log => {
                        const employee = getUserById(log.employeeId);
                        return (
                            <div key={log.id} className="bg-slate-800/50 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <div>
                                    <p className="font-semibold text-white">{log.description}</p>
                                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                                      { (isAdmin || currentUser.id === log.employeeId) && employee && (
                                          <div className="flex items-center space-x-2">
                                              <img src={employee.avatar} alt={employee.name} className="w-5 h-5 rounded-full" />
                                              <span>{employee.name}</span>
                                          </div>
                                      )}
                                      <span>{new Date(log.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div className="bg-green-500/10 text-green-300 font-bold text-lg px-4 py-2 rounded-md whitespace-nowrap self-start md:self-center">
                                    {log.hours.toFixed(1)} h
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-slate-400 text-center py-8">Aucune heure n'a encore été enregistrée pour ce projet.</p>
            )}
        </div>
      </div>
      <TimeLogForm 
        isOpen={isTimeLogFormOpen} 
        onClose={() => {
            setIsTimeLogFormOpen(false);
            setHoursForForm(undefined);
        }}
        onSave={handleSaveTimeLog}
        initialHours={hoursForForm}
      />
    </>
  );
};

export default ProjectDetailsView;
