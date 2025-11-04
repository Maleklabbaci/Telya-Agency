
import React, { useState, useEffect } from 'react';
import { Invoice, Client, Project } from '../../types';
import Modal from '../Modal';

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Omit<Invoice, 'id'>) => void;
  clients: Client[];
  projects: Project[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ isOpen, onClose, onSave, clients, projects }) => {
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Sent' | 'Draft'>('Draft');

  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setClientId('');
      setProjectId(undefined);
      setAmount('');
      setIssueDate('');
      setDueDate('');
      setStatus('Draft');
    } else {
      setIssueDate(new Date().toISOString().split('T')[0]);
      if (clients.length > 0 && !clientId) {
        setClientId(clients[0].id);
      }
    }
  }, [isOpen, clients, clientId]);

  useEffect(() => {
    if (clientId) {
      setAvailableProjects(projects.filter(p => p.clientId === clientId));
      setProjectId(undefined); // Reset project when client changes
    } else {
      setAvailableProjects([]);
    }
  }, [clientId, projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    onSave({ 
      clientId, 
      projectId, 
      amount: amountNum, 
      issueDate, 
      dueDate, 
      status 
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une nouvelle facture">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-slate-300 mb-1">Client</label>
            <select id="client" value={clientId} onChange={e => setClientId(e.target.value)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100" required>
              <option value="" disabled>Sélectionnez un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-slate-300 mb-1">Projet (Optionnel)</label>
            <select id="project" value={projectId || ''} onChange={e => setProjectId(e.target.value || undefined)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100" disabled={availableProjects.length === 0}>
              <option value="">Aucun projet spécifique</option>
              {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">Montant (DA)</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required min="1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-slate-300 mb-1">Date d'émission</label>
              <input type="date" id="issueDate" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1">Date d'échéance</label>
              <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">Statut</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value as 'Sent' | 'Draft')} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100">
              <option value="Draft">Brouillon</option>
              <option value="Sent">Envoyée</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">Annuler</button>
          <button type="submit" disabled={!clientId || !amount || !issueDate || !dueDate} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed">Créer la facture</button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceForm;
