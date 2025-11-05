import React from 'react';
import { ProjectFile, Project, User } from '../types';
import { FilesIcon, FileTextIcon, CameraIcon, DownloadIcon, PlusIcon } from './icons';

interface EmployeeFilesViewProps {
    currentUser: User;
    files: ProjectFile[];
    projects: Project[];
    onAddFile: (fileData: Omit<ProjectFile, 'id' | 'uploadedBy' | 'lastModified'>) => void;
    onOpenUploadModal: () => void;
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

const EmployeeFilesView: React.FC<EmployeeFilesViewProps> = ({ currentUser, files, projects, onAddFile, onOpenUploadModal }) => {
    const myProjects = projects.filter(p => p.assignedEmployeeIds.includes(currentUser.id));
    const myProjectIds = myProjects.map(p => p.id);
    
    const myFiles = files.filter(f => myProjectIds.includes(f.projectId));

    const filesByProject = myProjects
        .map(project => ({
            ...project,
            files: myFiles.filter(f => f.projectId === project.id)
        })).filter(p => p.files.length > 0);

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-4xl tracking-wide text-white">Fichiers de Projet</h2>
                 <button 
                    onClick={onOpenUploadModal} 
                    className="flex items-center bg-telya-green hover:bg-emerald-500 text-slate-900 font-bold py-2 px-4 rounded-lg shadow-lg shadow-telya-green/20 hover:shadow-telya-green/30 transition-all duration-300 transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Ajouter un Fichier
                </button>
            </div>

            <div className="space-y-6">
                {filesByProject.map(project => (
                     <div key={project.id} className="bg-slate-900/40 rounded-2xl shadow-lg overflow-hidden border border-white/10">
                         <div className="p-4 bg-slate-800/60">
                             <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                         </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-800/40 text-xs text-slate-400 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 w-12"></th>
                                        <th className="px-6 py-3">Nom du fichier</th>
                                        <th className="px-6 py-3">Taille</th>
                                        <th className="px-6 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {project.files.map(file => (
                                        <tr key={file.id} className="hover:bg-telya-green/5">
                                            <td className="px-6 py-3">{getFileIcon(file.type)}</td>
                                            <td className="px-6 py-3 font-semibold text-white">{file.name}</td>
                                            <td className="px-6 py-3 text-slate-300">{file.size}</td>
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
                     </div>
                ))}
                {myFiles.length === 0 && (
                     <div className="text-center p-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
                        <FilesIcon className="w-12 h-12 mx-auto mb-2"/>
                        Aucun fichier trouvé dans vos projets.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeFilesView;