import React from 'react';
import { Invoice } from '../types';
import Modal from './Modal';

const statusDisplay: Record<Invoice['status'], { label: string; style: string; }> = {
    'Paid': { label: 'Payée', style: 'bg-green-500/20 text-green-400' },
    'Sent': { label: 'Envoyée', style: 'bg-blue-500/20 text-blue-400' },
    'Draft': { label: 'Brouillon', style: 'bg-slate-500/20 text-slate-400' },
    'Overdue': { label: 'En retard', style: 'bg-red-500/20 text-red-400' },
};

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  clientName: string;
  projectName?: string;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoice, clientName, projectName }) => {
  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Détails de la Facture ${invoice.id.toUpperCase()}`}>
      <div className="space-y-4 text-slate-300">
        <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
          <span className="font-semibold text-white">Statut :</span>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusDisplay[invoice.status].style}`}>
            {statusDisplay[invoice.status].label}
          </span>
        </div>
        <div className="border-t border-slate-700 my-2"></div>
        <div className="p-4 bg-slate-800/50 rounded-lg space-y-3">
            <p><span className="font-semibold text-white w-32 inline-block">Client :</span> {clientName}</p>
            {projectName && <p><span className="font-semibold text-white w-32 inline-block">Projet :</span> {projectName}</p>}
            <p><span className="font-semibold text-white w-32 inline-block">Montant :</span> <span className="font-mono">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(invoice.amount)}</span></p>
            <p><span className="font-semibold text-white w-32 inline-block">Date d'émission :</span> {new Date(invoice.issueDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><span className="font-semibold text-white w-32 inline-block">Date d'échéance :</span> {new Date(invoice.dueDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors"
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
};

export default InvoiceDetailsModal;
