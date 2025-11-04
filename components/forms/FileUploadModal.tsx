import React, { useState, useRef, useCallback } from 'react';
import { ProjectFile } from '../../types';
import Modal from '../Modal';
import { FileTextIcon, CloseIcon } from '../icons';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: Omit<ProjectFile, 'id' | 'projectId' | 'uploadedBy' | 'lastModified'>) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const getFileType = (mimeType: string): ProjectFile['type'] => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'Document';
    return 'Other';
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const resetState = () => {
      setFile(null);
      setIsDeliverable(false);
      setIsDragging(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    onUpload({
        name: file.name,
        type: getFileType(file.type),
        size: formatFileSize(file.size),
        isDeliverable: isDeliverable
    });
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Téléverser un nouveau fichier">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
            <div 
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-telya-green bg-telya-green/10' : 'border-slate-700'}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />
                {!file ? (
                    <>
                        <p className="text-slate-300">Glissez-déposez un fichier ici</p>
                        <p className="text-sm text-slate-500 my-2">ou</p>
                        <button type="button" onClick={handleBrowseClick} className="font-semibold text-telya-green hover:text-telya-green/80">
                            Parcourir les fichiers
                        </button>
                    </>
                ) : (
                    <div className="w-full bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <FileTextIcon className="w-6 h-6 text-slate-400" />
                            <div>
                                <p className="font-semibold text-white text-sm">{file.name}</p>
                                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                            </div>
                         </div>
                         <button onClick={() => setFile(null)} type="button" className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                            <CloseIcon className="w-5 h-5"/>
                         </button>
                    </div>
                )}
            </div>
          
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDeliverable"
                checked={isDeliverable}
                onChange={(e) => setIsDeliverable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-green-500 focus:ring-green-500"
              />
              <label htmlFor="isDeliverable" className="ml-2 text-sm text-slate-300">Marquer comme livrable pour le client</label>
            </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">
            Annuler
          </button>
          <button
            type="submit"
            disabled={!file}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30 disabled:bg-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Téléverser
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FileUploadModal;