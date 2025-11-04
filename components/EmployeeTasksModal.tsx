import React from 'react';
import { User, Task, Project } from '../types';
import Modal from './Modal';
import { TasksIcon } from './icons';

interface EmployeeTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  tasks: Task[];
  projects: Project[];
}

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

const statusStyles: Record<TaskStatus, string> = {
    'To Do': 'bg-slate-500/20 text-slate-300',
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Completed': 'bg-green-500/20 text-green-400',
};


const EmployeeTasksModal: React.FC<EmployeeTasksModalProps> = ({ isOpen, onClose, employee, tasks, projects }) => {
  if (!employee) return null;

  const employeeTasks = tasks.filter(t => t.employeeId === employee.id);
  
  const tasksByProject = employeeTasks.reduce((acc, task) => {
    const project = projects.find(p => p.id === task.projectId);
    const projectName = project ? project.name : 'Projet Inconnu';
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Tâches de ${employee.name}`}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {Object.entries(tasksByProject).length > 0 ? (
          Object.entries(tasksByProject).map(([projectName, projectTasks]) => (
            <div key={projectName}>
              <h4 className="font-semibold text-telya-green mb-2">{projectName}</h4>
              <ul className="space-y-2">
                {(projectTasks as Task[]).map(task => (
                  <li key={task.id} className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-200">{task.title}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[task.status]}`}>
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500">
             <TasksIcon className="w-10 h-10 mx-auto mb-2"/>
            <p>{employee.name} n'a aucune tâche assignée pour le moment.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmployeeTasksModal;