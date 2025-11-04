
import React, { useState, useEffect } from 'react';
import { Client, User } from '../../types';
import Modal from '../Modal';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'logo'>) => void;
  client: Client | null;
  employees: User[];
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, client, employees }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Onboarding'>('Onboarding');
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);

  useEffect(() => {
    if (client) {
      setCompanyName(client.companyName);
      setContactName(client.contactName);
      setContactEmail(client.contactEmail);
      setStatus(client.status);
      setAssignedEmployeeIds(client.assignedEmployeeIds || []);
    } else {
      setCompanyName('');
      setContactName('');
      setContactEmail('');
      setStatus('Onboarding');
      setAssignedEmployeeIds([]);
    }
  }, [client, isOpen]);
  
  const handleEmployeeToggle = (employeeId: string) => {
    setAssignedEmployeeIds(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ companyName, contactName, contactEmail, status, assignedEmployeeIds });
  };
  
  const statusOptions: Record<'Active' | 'Inactive' | 'Onboarding', string> = {
      'Active': 'Actif',
      'Inactive': 'Inactif',
      'Onboarding': 'Intégration',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Modifier le client' : 'Ajouter un nouveau client'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">Nom de l'entreprise</label>
            <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required autoFocus/>
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-slate-300 mb-1">Nom du contact</label>
            <input type="text" id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-300 mb-1">E-mail du contact</label>
            <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as any)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100">
              {(Object.keys(statusOptions) as Array<keyof typeof statusOptions>).map((key) => (
                <option key={key} value={key}>{statusOptions[key]}</option>
              ))}
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-300">Assigner une équipe</label>
            <div className="mt-2 p-2 border border-slate-700 rounded-md max-h-32 overflow-y-auto space-y-1 bg-slate-900">
              {employees.map(emp => (
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
               {employees.length === 0 && <p className="text-sm text-slate-500 text-center p-2">Aucun employé disponible.</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">Annuler</button>
          <button type="submit" disabled={!companyName || !contactName || !contactEmail} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientForm;
