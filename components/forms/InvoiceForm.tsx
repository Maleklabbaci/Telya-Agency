
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

  // Initialize/reset form state when it opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const issueDateStr = today.toISOString().split('T')[0];
      setIssueDate(issueDateStr);
      setClientId(clients.length > 0 ? clients[0].id : '');
      setProjectId(undefined);
      setAmount('');
      setStatus('Draft');
    }
  }, [isOpen, clients]);

  // Update available projects when client changes, without resetting dates
  useEffect(() => {
    if (clientId) {
      setAvailableProjects(projects.filter(p => p.clientId === clientId));
      setProjectId(undefined);
    } else {
      setAvailableProjects([]);
    }
  }, [clientId, projects]);

  // Automatically update due date to be one month after issue date
  useEffect(() => {
    if (issueDate) {
      const issueDateObj = new Date(issueDate);
      const utcDate = new Date(Date.UTC(issueDateObj.getUTCFullYear(), issueDateObj.getUTCMonth(), issueDateObj.getUTCDate()));
      utcDate.setUTCMonth(utcDate.getUTCMonth() + 1);
      setDueDate(utcDate.toISOString().split('T')[0]);
    }
  }, [issueDate]);


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
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-slate-300 mb-1.5">Client</label>
              <select id="client" value={clientId} onChange={e => setClientId(e.target.value)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100" required>
                <option value="" disabled>Sélectionnez un client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-slate-300 mb-1.5">Projet (Optionnel)</label>
              <select id="project" value={projectId || ''} onChange={e => setProjectId(e.target.value || undefined)} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100" disabled={availableProjects.length === 0}>
                <option value="">Aucun projet spécifique</option>
                {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1.5">Montant</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-400 sm:text-sm">DA</span>
                </div>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100 pl-9" required min="1" placeholder="5000" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-slate-300 mb-1.5">Date d'émission</label>
              <input type="date" id="issueDate" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1.5">Date d'échéance</label>
              <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="block w-full rounded-md shadow-sm form-input text-slate-100" required />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1.5">Statut initial</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value as 'Sent' | 'Draft')} className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100">
              <option value="Draft">Brouillon</option>
              <option value="Sent">Envoyée</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">Annuler</button>
          <button type="submit" disabled={!clientId || !amount || !issueDate || !dueDate} className="px-4 py-2 rounded-lg bg-telya-green text-slate-900 hover:bg-emerald-500 font-bold transition-all duration-300 shadow-lg shadow-telya-green/20 hover:shadow-telya-green/30 disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed">Créer la facture</button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceForm;
