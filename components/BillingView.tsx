import React, { useState } from 'react';
import { Invoice, Client, User, UserRole, Project } from '../types';
import { BillingIcon, FilterIcon, PlusIcon } from './icons';
import InvoiceForm from './forms/InvoiceForm';
import InvoiceDetailsModal from './InvoiceDetailsModal';

interface BillingViewProps {
    invoices: Invoice[];
    clients: Client[];
    currentUser: User;
    onAddInvoice: (data: Omit<Invoice, 'id'>) => void;
    projects: Project[];
}

type InvoiceStatus = 'Paid' | 'Sent' | 'Draft' | 'Overdue';

const statusStyles: Record<InvoiceStatus, string> = {
    'Paid': 'bg-green-500/20 text-green-400',
    'Sent': 'bg-blue-500/20 text-blue-400',
    'Draft': 'bg-slate-500/20 text-slate-400',
    'Overdue': 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<InvoiceStatus, string> = {
    'Paid': 'Payée',
    'Sent': 'Envoyée',
    'Draft': 'Brouillon',
    'Overdue': 'En retard',
};

const BillingView: React.FC<BillingViewProps> = ({ invoices, clients, currentUser, onAddInvoice, projects }) => {
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.companyName || 'Client inconnu';
    };
    
    const filteredInvoices = invoices.filter(invoice => {
        if (statusFilter === 'all') return true;
        return invoice.status === statusFilter;
    }).sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    const handleSave = (data: Omit<Invoice, 'id'>) => {
        onAddInvoice(data);
        setIsFormModalOpen(false);
    };
    
    const handleViewDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailsModalOpen(true);
    };

    return (
        <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="font-display text-4xl tracking-wide text-white">Facturation</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 bg-slate-800/50 p-1 rounded-lg">
                        <FilterIcon className="w-5 h-5 text-slate-400 ml-2"/>
                        {(['all', 'Paid', 'Sent', 'Overdue', 'Draft'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                    statusFilter === status
                                        ? 'bg-telya-green/20 text-telya-green'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                            {status === 'all' ? 'Toutes' : statusLabels[status as InvoiceStatus]}
                            </button>
                        ))}
                    </div>
                     {currentUser.role === UserRole.ADMIN && (
                         <button onClick={() => setIsFormModalOpen(true)} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-300">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nouvelle Facture
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-2xl shadow-lg overflow-hidden border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
                            <tr>
                                <th className="px-6 py-3">Facture ID</th>
                                <th className="px-6 py-3">Client</th>
                                <th className="px-6 py-3">Montant</th>
                                <th className="px-6 py-3">Date d'échéance</th>
                                <th className="px-6 py-3 text-center">Statut</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredInvoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-telya-green/5">
                                    <td className="px-6 py-4 font-mono font-semibold text-white">{invoice.id.toUpperCase()}</td>
                                    <td className="px-6 py-4 text-slate-300">{getClientName(invoice.clientId)}</td>
                                    <td className="px-6 py-4 font-semibold text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(invoice.amount)}</td>
                                    <td className="px-6 py-4 text-slate-300">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[invoice.status]}`}>
                                            {statusLabels[invoice.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleViewDetails(invoice)} className="font-semibold text-telya-green hover:text-telya-green/80 text-xs">Voir Détails</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-slate-500">
                                        <BillingIcon className="w-12 h-12 mx-auto mb-2"/>
                                        Aucune facture ne correspond à ce filtre.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <InvoiceForm
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSave}
                clients={clients}
                projects={projects}
            />
            
            <InvoiceDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                invoice={selectedInvoice}
                clientName={selectedInvoice ? getClientName(selectedInvoice.clientId) : ''}
                projectName={selectedInvoice?.projectId ? projects.find(p => p.id === selectedInvoice.projectId)?.name : undefined}
            />
        </div>
    );
};

export default BillingView;
