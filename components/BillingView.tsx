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
    onUpdateInvoice: (data: Invoice) => void;
    projects: Project[];
}

type InvoiceStatus = 'Paid' | 'Sent' | 'Draft' | 'Overdue';
type FilterStatus = InvoiceStatus | 'all' | 'unpaid';

const statusStyles: Record<InvoiceStatus, string> = {
    'Paid': 'bg-green-500/20 text-green-400',
    'Sent': 'bg-blue-500/20 text-blue-400',
    'Draft': 'bg-slate-500/20 text-slate-400',
    'Overdue': 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<FilterStatus, string> = {
    'Paid': 'Payée',
    'Sent': 'Envoyée',
    'Draft': 'Brouillon',
    'Overdue': 'En retard',
    'unpaid': 'Impayées',
    'all': 'Toutes'
};

const getEffectiveStatus = (invoice: Invoice): InvoiceStatus => {
    if (invoice.status === 'Sent' && new Date(invoice.dueDate) < new Date()) {
        return 'Overdue';
    }
    return invoice.status;
};


const BillingView: React.FC<BillingViewProps> = ({ invoices, clients, currentUser, onAddInvoice, onUpdateInvoice, projects }) => {
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const getClient = (clientId: string) => clients.find(c => c.id === clientId) || null;
    
    const invoicesWithEffectiveStatus = invoices.map(invoice => ({
        ...invoice,
        effectiveStatus: getEffectiveStatus(invoice)
    }));

    const filteredInvoices = invoicesWithEffectiveStatus.filter(invoice => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'unpaid') {
            return invoice.effectiveStatus === 'Sent' || invoice.effectiveStatus === 'Overdue';
        }
        return invoice.effectiveStatus === statusFilter;
    }).sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    const handleSave = (data: Omit<Invoice, 'id'>) => {
        onAddInvoice(data);
        setIsFormModalOpen(false);
    };
    
    const handleViewDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailsModalOpen(true);
    };

    const selectedClientForModal = selectedInvoice ? getClient(selectedInvoice.clientId) : null;

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="font-display text-3xl md:text-4xl tracking-wide text-white">Facturation</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex items-center space-x-2 bg-slate-800/50 p-1 rounded-lg overflow-x-auto">
                        <FilterIcon className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0"/>
                        {(['all', 'unpaid', 'Sent', 'Overdue', 'Paid', 'Draft'] as FilterStatus[]).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                                    statusFilter === status
                                        ? 'bg-telya-green/20 text-telya-green'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                            {statusLabels[status]}
                            </button>
                        ))}
                    </div>
                     {currentUser.role === UserRole.ADMIN && (
                         <button onClick={() => setIsFormModalOpen(true)} className="flex-shrink-0 flex items-center justify-center bg-telya-green hover:bg-emerald-500 text-slate-900 font-bold py-2 px-4 rounded-lg shadow-lg shadow-telya-green/20 hover:shadow-telya-green/30 transition-all duration-300">
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
                            {filteredInvoices.map(invoice => {
                                const effectiveStatus = invoice.effectiveStatus;
                                const client = getClient(invoice.clientId);
                                return (
                                <tr key={invoice.id} className="hover:bg-telya-green/5">
                                    <td className="px-6 py-4 font-mono font-semibold text-white whitespace-nowrap">{invoice.id.toUpperCase()}</td>
                                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{client?.companyName || 'Client inconnu'}</td>
                                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(invoice.amount)}</td>
                                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[effectiveStatus]}`}>
                                            {statusLabels[effectiveStatus as InvoiceStatus]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            {(effectiveStatus === 'Sent' || effectiveStatus === 'Overdue') && currentUser.role === UserRole.ADMIN && (
                                                <button onClick={() => onUpdateInvoice({ ...invoice, status: 'Paid' })} className="font-semibold text-green-400 hover:text-green-300 text-xs bg-green-500/10 hover:bg-green-500/20 px-3 py-1 rounded-md">
                                                    Marquer comme Payée
                                                </button>
                                            )}
                                            <button onClick={() => handleViewDetails(invoice)} className="font-semibold text-telya-green hover:text-telya-green/80 text-xs">
                                                Détails
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-slate-500">
                                        <BillingIcon className="w-12 h-12 mx-auto mb-2"/>
                                        Aucune facture ne correspond à ces filtres.
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
                client={selectedClientForModal}
                projectName={selectedInvoice?.projectId ? projects.find(p => p.id === selectedInvoice.projectId)?.name : undefined}
            />
        </div>
    );
};

export default BillingView;