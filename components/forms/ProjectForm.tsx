
import React, { useState, useEffect } from 'react';
import { Project, Client, User, ProjectStatus } from '../../types';
import Modal from '../Modal';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => void;
  project: Project | null;
  clients: Client[];
  employees: User[];
}

const ProjectForm: React.FC<ProjectFormProps> = ({ isOpen, onClose, onSave, project, clients, employees }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.NOT_STARTED);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setClientId(project.clientId);
      setStatus(project.status);
      setAssignedEmployeeIds(project.assignedEmployeeIds);
    } else {
      setName('');
      setDescription('');
      setClientId(clients.length > 0 ? clients[0].id : '');
      setStatus(ProjectStatus.NOT_STARTED);
      setAssignedEmployeeIds([]);
    }
    setEmployeeSearch('');
  }, [project, isOpen, clients]);

  const handleEmployeeToggle = (employeeId: string) => {
    setAssignedEmployeeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
        alert("Veuillez sélectionner un client.");
        return;
    }
    onSave({ name, description, clientId, status, assignedEmployeeIds });
  };
  
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Modifier le projet' : 'Ajouter un nouveau projet'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nom du projet</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required autoFocus/>
          </div>
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-slate-300 mb-1">Client</label>
            <select id="client" value={clientId} onChange={e => setClientId(e.target.value)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100" required>
              <option value="" disabled>Sélectionnez un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100">
              {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Assigner une équipe</label>
            <input 
              type="text"
              placeholder="Rechercher un employé..."
              value={employeeSearch}
              onChange={e => setEmployeeSearch(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100 mb-2"
            />
            <div className="p-2 border border-slate-700 rounded-md max-h-32 overflow-y-auto space-y-1 bg-slate-900">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="flex items-center p-1 rounded-md hover:bg-slate-700">
                  <input
                    type="checkbox"
                    id={`emp-${emp.id}`}
                    checked={assignedEmployeeIds.includes(emp.id)}
                    onChange={() => handleEmployeeToggle(emp.id)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-green-500 focus:ring-green-500"
                  />
                  <label htmlFor={`emp-${emp.id}`} className="ml-2 text-sm text-slate-300">{emp.name}</label>
                </div>
              ))}
               {filteredEmployees.length === 0 && <p className="text-sm text-slate-500 text-center p-2">Aucun employé trouvé.</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">Annuler</button>
          <button type="submit" disabled={!name || !clientId} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed">Enregistrer le projet</button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;
