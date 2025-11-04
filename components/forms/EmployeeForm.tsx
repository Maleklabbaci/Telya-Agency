import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Modal from '../Modal';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<User, 'id' | 'role' | 'avatar'>) => void;
  employee: User | null;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onSave, employee }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setPosition(employee.position || '');
    } else {
      setName('');
      setEmail('');
      setPosition('');
    }
  }, [employee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, position, assignedClientIds: employee?.assignedClientIds || [] });
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
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeForm;