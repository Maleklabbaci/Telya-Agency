

import React from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-xl animate-gradient-fade" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-xl w-full max-w-lg relative max-h-[90vh] flex flex-col border border-[var(--border-color)] animate-scaleIn" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-color)] sticky top-0 bg-slate-900/80 z-10 rounded-t-2xl">
          <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;