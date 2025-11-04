
import React, { useState, useEffect } from 'react';
import { User, Client } from '../../types';
import Modal from '../Modal';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<User, 'id' | 'role' | 'avatar'>) => void;
  employee: User | null;
  clients: Client[];
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onSave, employee, clients }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setPosition(employee.position || '');
      setAssignedClientIds(employee.assignedClientIds || []);
    } else {
      setName('');
      setEmail('');
      setPosition('');
      setAssignedClientIds([]);
    }
  }, [employee, isOpen]);
  
  const handleClientToggle = (clientId: string) => {
    setAssignedClientIds(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, position, assignedClientIds });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? "Modifier l'employé" : 'Ajouter un nouvel employé'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nom complet</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-300 mb-1">Poste</label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              required
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-300">Assigner des clients</label>
            <div className="mt-2 p-2 border border-slate-700 rounded-md max-h-32 overflow-y-auto space-y-1 bg-slate-900">
              {clients.map(client => (
                <div key={client.id} className="flex items-center p-1 rounded-md hover:bg-slate-700">
                  <input
                    type="checkbox"
                    id={`client-${client.id}`}
                    checked={assignedClientIds.includes(client.id)}
                    onChange={() => handleClientToggle(client.id)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-green-500 focus:ring-green-500"
                  />
                  <label htmlFor={`client-${client.id}`} className="ml-2 text-sm text-slate-300">{client.companyName}</label>
                </div>
              ))}
              {clients.length === 0 && <p className="text-sm text-slate-500 text-center p-2">Aucun client disponible.</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!name || !email || !position}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeForm;
