import React from 'react';
import { ProjectFile, Project, User } from '../types';
import { FilesIcon, FileTextIcon, CameraIcon, DownloadIcon } from './icons';

interface FilesViewProps {
    files: ProjectFile[];
    projects: Project[];
    users: User[];
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


const FilesView: React.FC<FilesViewProps> = ({ files, projects, users }) => {

    const filesByProject = projects.map(project => ({
        ...project,
        files: files.filter(f => f.projectId === project.id)
    }));
    
    const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Inconnu';

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-6">Gestionnaire de Fichiers</h2>

            <div className="space-y-6">
                {filesByProject.map(project => (
                     <div key={project.id} className="bg-slate-900/40 rounded-2xl shadow-lg overflow-hidden border border-white/10">
                         <div className="p-4 bg-slate-800/60">
                             <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                         </div>
                         {project.files.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                     <thead className="bg-slate-800/40 text-xs text-slate-400 uppercase">
                                        <tr>
                                            <th className="px-6 py-3 w-12"></th>
                                            <th className="px-6 py-3">Nom du fichier</th>
                                            <th className="px-6 py-3">Taille</th>
                                            <th className="px-6 py-3">Dernière modification</th>
                                            <th className="px-6 py-3">Ajouté par</th>
                                            <th className="px-6 py-3 text-right"></th>
                                        </tr>
                                    </thead>
                                     <tbody className="divide-y divide-slate-800">
                                         {project.files.map(file => (
                                             <tr key={file.id} className="hover:bg-telya-green/5">
                                                 <td className="px-6 py-3">{getFileIcon(file.type)}</td>
                                                 <td className="px-6 py-3 font-semibold text-white">{file.name}</td>
                                                 <td className="px-6 py-3 text-slate-300">{file.size}</td>
                                                 <td className="px-6 py-3 text-slate-300">{file.lastModified.toLocaleDateString('fr-FR')}</td>
                                                 <td className="px-6 py-3 text-slate-300">{getUserName(file.uploadedBy)}</td>
                                                 <td className="px-6 py-3 text-right">
                                                      <button onClick={() => simulateFileDownload(file.name, `Contenu simulé pour ${file.name}`)} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                                        <DownloadIcon className="w-5 h-5"/>
                                                      </button>
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                </table>
                            </div>
                         ) : (
                            <div className="p-8 text-center text-slate-500">
                                <p>Aucun fichier dans ce projet.</p>
                            </div>
                         )}
                     </div>
                ))}
                {filesByProject.length === 0 && (
                     <div className="text-center p-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
                        <FilesIcon className="w-12 h-12 mx-auto mb-2"/>
                        Aucun projet contenant des fichiers n'a été trouvé.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilesView;
