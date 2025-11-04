
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import Modal from './Modal';
import { RefreshIcon, CameraIcon } from './icons';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
  currentUser: User;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, onSave, currentUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [avatar, setAvatar] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPosition(currentUser.position || '');
      setAvatar(currentUser.avatar);
    }
  }, [currentUser, isOpen]);

  const handleGenerateAvatar = () => {
    const randomId = `user-${currentUser.role.toLowerCase()}-${Date.now()}`;
    setAvatar(`https://i.pravatar.cc/150?u=${randomId}`);
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: Partial<User> = {};
    if (name !== currentUser.name) updatedData.name = name;
    if (email !== currentUser.email) updatedData.email = email;
    if (currentUser.role === UserRole.EMPLOYEE && position !== (currentUser.position || '')) updatedData.position = position;
    if (avatar !== currentUser.avatar) updatedData.avatar = avatar;

    if (Object.keys(updatedData).length > 0) {
      onSave(updatedData);
    } else {
      onClose(); // No changes, just close
    }
  };

  if (!currentUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier mon profil">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
           <div className="flex flex-col items-center space-y-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full bg-slate-700 object-cover" />
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraIcon className="w-8 h-8 text-white" />
                </div>
            </div>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <button
                type="button"
                onClick={handleGenerateAvatar}
                className="flex items-center text-sm text-slate-400 hover:text-white"
            >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Générer un avatar aléatoire
            </button>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nom complet</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              required
            />
          </div>
          {currentUser.role === UserRole.EMPLOYEE && (
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-300 mb-1">Poste</label>
              <input
                type="text"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="block w-full rounded-md shadow-sm form-input text-slate-100"
                required
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileSettingsModal;