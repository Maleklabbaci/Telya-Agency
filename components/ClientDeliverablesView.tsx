import React from 'react';
import { ProjectFile, Project, User, Client } from '../types';
import { DeliverablesIcon, DownloadIcon, FileTextIcon, CameraIcon } from './icons';

interface ClientDeliverablesViewProps {
    currentUser: User;
    files: ProjectFile[];
    projects: Project[];
    clients: Client[];
}

const getFileIcon = (type: ProjectFile['type']) => {
    switch(type) {
        case 'PDF':
        case 'Document':
        case 'Spreadsheet':
            return <FileTextIcon className="w-6 h-6 text-blue-400" />;
        case 'Image':
            return <CameraIcon className="w-6 h-6 text-purple-400" />;
        default:
            return <FileTextIcon className="w-6 h-6 text-slate-400" />;
    }
};

const simulateFileDownload = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

const ClientDeliverablesView: React.FC<ClientDeliverablesViewProps> = ({ currentUser, files, projects, clients }) => {
    const myClientProfile = clients.find(c => c.contactEmail === currentUser.email);
    if (!myClientProfile) {
        return <div className="p-8 text-center">Profil client non trouvé.</div>;
    }

    const myProjectIds = projects.filter(p => p.clientId === myClientProfile.id).map(p => p.id);
    const myDeliverables = files.filter(f => myProjectIds.includes(f.projectId) && f.isDeliverable);

    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Projet Inconnu';

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-6">Mes Livrables</h2>
            
            {myDeliverables.length > 0 ? (
                <div className="bg-slate-900/40 rounded-2xl shadow-lg overflow-hidden border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3"></th>
                                    <th className="px-6 py-3">Nom du fichier</th>
                                    <th className="px-6 py-3">Projet</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-right">Télécharger</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {myDeliverables.map(file => (
                                    <tr key={file.id} className="hover:bg-telya-green/5">
                                        <td className="px-6 py-4">{getFileIcon(file.type)}</td>
                                        <td className="px-6 py-4 font-semibold text-white">{file.name}</td>
                                        <td className="px-6 py-4 text-slate-300">{getProjectName(file.projectId)}</td>
                                        <td className="px-6 py-4 text-slate-300">{file.lastModified.toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => simulateFileDownload(file.name, `Contenu simulé pour ${file.name}`)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                                <DownloadIcon className="w-5 h-5"/>
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
                    <DeliverablesIcon className="w-12 h-12 mx-auto mb-4"/>
                    <h3 className="font-display text-xl text-white">Aucun livrable disponible</h3>
                    <p className="mt-1">Les fichiers finaux de vos projets apparaîtront ici.</p>
                </div>
            )}
        </div>
    );
};

export default ClientDeliverablesView;
