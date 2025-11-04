import React, { useState } from 'react';
import { Invoice, Client, User, Project } from '../types';
import { BillingIcon } from './icons';
import InvoiceDetailsModal from './InvoiceDetailsModal';

interface ClientBillingViewProps {
    currentUser: User;
    invoices: Invoice[];
    clients: Client[];
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

const ClientBillingView: React.FC<ClientBillingViewProps> = ({ currentUser, invoices, clients, projects }) => {
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const myClientProfile = clients.find(c => c.contactEmail === currentUser.email);
    if (!myClientProfile) {
        return <div className="p-8 text-center">Profil client non trouvé.</div>;
    }
    
    const myInvoices = invoices.filter(inv => inv.clientId === myClientProfile.id && inv.status !== 'Draft');

    const handleViewDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setDetailsModalOpen(true);
    };

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-6">Mes Factures</h2>

            {myInvoices.length > 0 ? (
                <div className="bg-slate-900/40 rounded-2xl shadow-lg overflow-hidden border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Facture ID</th>
                                    <th className="px-6 py-3">Montant</th>
                                    <th className="px-6 py-3">Date d'échéance</th>
                                    <th className="px-6 py-3 text-center">Statut</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {myInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-telya-green/5">
                                        <td className="px-6 py-4 font-mono font-semibold text-white">{invoice.id.toUpperCase()}</td>
                                        <td className="px-6 py-4 font-semibold text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(invoice.amount)}</td>
                                        <td className="px-6 py-4 text-slate-300">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[invoice.status]}`}>
                                                {statusLabels[invoice.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleViewDetails(invoice)} 
                                                className="font-semibold text-telya-green hover:text-telya-green/80 text-xs">
                                                Voir la facture
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                 <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700">
                    <BillingIcon className="w-12 h-12 mx-auto mb-4"/>
                    <h3 className="font-display text-xl text-white">Aucune facture disponible</h3>
                    <p className="mt-1">Vos factures apparaîtront ici dès qu'elles seront émises.</p>
                </div>
            )}

            <InvoiceDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                invoice={selectedInvoice}
                client={myClientProfile}
                projectName={selectedInvoice?.projectId ? projects.find(p => p.id === selectedInvoice.projectId)?.name : undefined}
            />
        </div>
    );
};

export default ClientBillingView;