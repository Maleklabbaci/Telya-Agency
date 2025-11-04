import React, { useState, useEffect } from 'react';
import { Task, Project, User } from '../../types';
import Modal from '../Modal';

type TaskStatus = 'To Do' | 'In Progress' | 'Completed';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  task: Task | null;
  projects: Project[];
  employees: User[];
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, task, projects, employees }) => {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setProjectId(task.projectId);
      setEmployeeId(task.employeeId);
      setStatus(task.status);
    } else {
      setTitle('');
      setProjectId(projects.length > 0 ? projects[0].id : '');
      setEmployeeId(employees.length > 0 ? employees[0].id : '');
      setStatus('To Do');
    }
  }, [task, isOpen, projects, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !employeeId) {
        alert("Veuillez sélectionner un projet et un employé.");
        return;
    }
    onSave({ title, projectId, employeeId, status });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Modifier la tâche' : 'Ajouter une nouvelle tâche'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Titre de la tâche</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required autoFocus/>
          </div>
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-slate-300 mb-1">Projet</label>
            <select id="project" value={projectId} onChange={e => setProjectId(e.target.value)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100" required>
              <option value="" disabled>Sélectionnez un projet</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-slate-300 mb-1">Assigner à</label>
            <select id="employee" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100" required>
              <option value="" disabled>Sélectionnez un employé</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100">
              {(['To Do', 'In Progress', 'Completed'] as TaskStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">Annuler</button>
          <button type="submit" disabled={!title || !projectId || !employeeId} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed">Enregistrer la tâche</button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
