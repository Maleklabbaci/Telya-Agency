import React from 'react';
import { Invoice, Client } from '../types';
import Modal from './Modal';
import { DownloadIcon } from './icons';

const statusDisplay: Record<Invoice['status'], { label: string; style: string; }> = {
    'Paid': { label: 'Payée', style: 'bg-emerald-100 text-emerald-700' },
    'Sent': { label: 'Envoyée', style: 'bg-blue-100 text-blue-700' },
    'Draft': { label: 'Brouillon', style: 'bg-slate-200 text-slate-700' },
    'Overdue': { label: 'En retard', style: 'bg-red-100 text-red-700' },
};

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  client: Client | null;
  projectName?: string;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoice, client, projectName }) => {
  if (!invoice || !client) return null;
  
  const handlePrint = () => {
    window.print();
  };

  const effectiveStatus = (invoice.status === 'Sent' && new Date(invoice.dueDate) < new Date()) ? 'Overdue' : invoice.status;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const taxRate = 0.05;
  const taxAmount = invoice.amount * taxRate;
  const totalAmount = invoice.amount + taxAmount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Facture ${invoice.id.toUpperCase()}`} maxWidthClass="max-w-4xl">
        <style>{`
            @media print {
                body > *:not(.invoice-print-area) {
                    display: none !important;
                }
                .invoice-print-area, .invoice-print-area #invoice-content {
                    display: block !important;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: auto;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                #invoice-content {
                    box-shadow: none !important;
                    border: none !important;
                    border-radius: 0 !important;
                    margin: 0 !important;
                    padding: 2rem !important;
                }
                .no-print {
                    display: none !important;
                }
            }
        `}</style>
      <div id="invoice-content" className="bg-slate-50 text-slate-900 p-6 sm:p-10 rounded-lg font-sans print:bg-white print:p-8">
        {/* Header */}
        <header className="flex justify-between items-start pb-6 border-b border-slate-200">
          <div>
            <div className="font-display text-4xl font-bold text-slate-900">Tely<span className="text-emerald-500">a</span>.</div>
            <p className="text-sm text-slate-500 mt-1">123 Rue de l'Agence, Alger, Algérie</p>
            <p className="text-sm text-slate-500">contact@telya.com</p>
          </div>
          <div className="text-right">
            <h2 className="font-display text-3xl font-semibold text-slate-700">FACTURE</h2>
            <p className="text-sm text-slate-500">#{invoice.id.toUpperCase()}</p>
          </div>
        </header>

        {/* Client, Dates, Status */}
        <section className="grid sm:grid-cols-2 gap-4 mt-8">
            <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Facturé à</p>
                <p className="font-bold text-slate-800 text-lg">{client.companyName}</p>
                <p className="text-sm text-slate-600">{client.contactName}</p>
                <p className="text-sm text-slate-600">{client.contactEmail}</p>
            </div>
            <div className="text-left sm:text-right text-sm space-y-2">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date d'émission</p>
                  <p className="font-medium text-slate-700">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date d'échéance</p>
                  <p className="font-medium text-slate-700">{formatDate(invoice.dueDate)}</p>
                </div>
                 <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Statut</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full inline-block ${statusDisplay[effectiveStatus].style}`}>
                    {statusDisplay[effectiveStatus].label}
                    </span>
                </div>
            </div>
        </section>


        {/* Items Table */}
        <section className="mt-10">
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="p-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-l-lg">Description</th>
                        <th className="p-3 text-sm font-semibold text-slate-600 bg-slate-100 text-right rounded-r-lg">Montant</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-slate-100">
                        <td className="p-4 align-top">
                            <p className="font-semibold text-slate-800">{projectName ? `Prestations pour le projet "${projectName}"` : 'Prestations de services de marketing digital'}</p>
                            <p className="text-xs text-slate-500 mt-1">Période du {formatDate(invoice.issueDate)}</p>
                        </td>
                        <td className="p-4 text-right align-top font-mono text-slate-700">{formatCurrency(invoice.amount)}</td>
                    </tr>
                </tbody>
            </table>
        </section>

        {/* Totals */}
        <section className="flex justify-end mt-8">
            <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                    <p>Sous-total</p>
                    <p className="font-mono">{formatCurrency(invoice.amount)}</p>
                </div>
                <div className="flex justify-between text-slate-600">
                    <p>TVA (5%)</p>
                    <p className="font-mono">{formatCurrency(taxAmount)}</p>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900 bg-emerald-100/70 p-3 rounded-lg">
                    <p>Total à payer</p>
                    <p className="font-mono text-emerald-600">{formatCurrency(totalAmount)}</p>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
            <p className="font-semibold">Merci pour votre confiance !</p>
            <p>Pour toute question, contactez-nous à <span className="font-medium text-slate-600">contact@telya.com</span>.</p>
        </footer>
      </div>
      <div className="flex justify-end space-x-4 mt-6 no-print">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors"
        >
          Fermer
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center px-4 py-2 rounded-lg bg-telya-green text-slate-900 hover:bg-emerald-500 font-semibold transition-colors"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Imprimer / PDF
        </button>
      </div>
    </Modal>
  );
};

// This wrapper is needed for the print styles to correctly isolate the modal content.
const PrintableInvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = (props) => {
    if (!props.isOpen) return null;
    return (
        <div className="invoice-print-area">
            <InvoiceDetailsModal {...props} />
        </div>
    );
};


export default PrintableInvoiceDetailsModal;
