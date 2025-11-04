import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import Modal from '../Modal';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'logo'>) => void;
  client: Client | null;
}

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, client }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Onboarding'>('Onboarding');

  useEffect(() => {
    if (client) {
      setCompanyName(client.companyName);
      setContactName(client.contactName);
      setContactEmail(client.contactEmail);
      setStatus(client.status);
    } else {
      setCompanyName('');
      setContactName('');
      setContactEmail('');
      setStatus('Onboarding');
    }
  }, [client, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ companyName, contactName, contactEmail, status, assignedEmployeeIds: client?.assignedEmployeeIds || [] });
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
            <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
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
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">Annuler</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30">Enregistrer</button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientForm;