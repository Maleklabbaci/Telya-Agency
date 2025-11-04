
import React, { useState, useRef, useEffect } from 'react';
import { User, Client, UserRole } from '../types';
import ConfirmationModal from './ConfirmationModal';
import EmployeeForm from './forms/EmployeeForm';
import ClientForm from './forms/ClientForm';
import { DotsVerticalIcon, PlusIcon, BriefcaseIcon, UsersIcon } from './icons';

interface ManagementViewProps {
  type: 'employee' | 'client';
  users: User[];
  clients: Client[];
  currentUser: User;
  onAdd: (data: any) => void;
  onUpdate: (data: any) => void;
  onDelete: (id: string) => void;
  onViewClientProjects?: (client: Client) => void;
}

const statusDisplay: Record<'Active' | 'Inactive' | 'Onboarding', string> = {
    'Active': 'Actif',
    'Inactive': 'Inactif',
    'Onboarding': 'Intégration',
};

const ActionMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/50">
                <DotsVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-lg py-1 z-20 border border-slate-700">
                    {children}
                </div>
            )}
        </div>
    );
};


const ManagementView: React.FC<ManagementViewProps> = ({ type, users, clients, currentUser, onAdd, onUpdate, onDelete, onViewClientProjects }) => {
    const isEmployeeView = type === 'employee';
    const items = isEmployeeView ? users.filter(u => u.role === UserRole.EMPLOYEE) : clients;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<User | Client | null>(null);

    const handleOpenAddModal = () => {
        setSelectedItem(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (item: User | Client) => {
        setSelectedItem(item);
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteModal = (item: User | Client) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    };
    
    const handleSave = (data: Omit<User, 'id'> | Omit<Client, 'id'>) => {
        if (selectedItem) {
            onUpdate({ ...selectedItem, ...data });
        } else {
            onAdd(data);
        }
        handleCloseModals();
    };

    const handleDelete = () => {
        if (selectedItem) {
            onDelete(selectedItem.id);
        }
        handleCloseModals();
    };

    const renderEmployeeCard = (user: User) => (
      <div key={user.id} className="bg-slate-900/30 rounded-2xl p-5 border border-white/10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10">
        <div>
          <div className="flex justify-between items-start mb-4">
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
              {isAdmin && (
                  <ActionMenu>
                      <button onClick={() => handleOpenEditModal(user)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Modifier</button>
                      <button onClick={() => handleOpenDeleteModal(user)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50">Supprimer</button>
                  </ActionMenu>
              )}
          </div>
          <p className="font-semibold text-white text-lg truncate">{user.name}</p>
          <p className="text-sm text-slate-400">{user.position}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-2 text-slate-400">
              <BriefcaseIcon className="w-4 h-4"/>
              <span>Clients Assignés</span>
            </div>
            <span className="font-semibold text-white bg-slate-700/50 px-2.5 py-1 rounded-full text-xs">{user.assignedClientIds?.length || 0}</span>
        </div>
    </div>
    );
    
    const renderClientCard = (client: Client) => (
       <div key={client.id} className="bg-slate-900/30 rounded-2xl p-5 border border-white/10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-500/10">
          <div>
            <div className="flex justify-between items-start mb-4">
                <img src={client.logo} alt={client.companyName} className="w-16 h-16 p-2 object-contain bg-white rounded-full" />
                {isAdmin && (
                    <ActionMenu>
                        {onViewClientProjects && (
                            <button onClick={() => onViewClientProjects(client)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Voir les projets</button>
                        )}
                        <button onClick={() => handleOpenEditModal(client)} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50">Modifier</button>
                        <button onClick={() => handleOpenDeleteModal(client)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50">Supprimer</button>
                    </ActionMenu>
                )}
            </div>
            <p className="font-semibold text-white text-lg truncate">{client.companyName}</p>
            <p className="text-sm text-slate-400">{client.contactName}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-sm">
               <div className="flex items-center space-x-2 text-slate-400">
                <UsersIcon className="w-4 h-4"/>
                <span>Équipe Assignée</span>
              </div>
              <span className="font-semibold text-white bg-slate-700/50 px-2.5 py-1 rounded-full text-xs">{client.assignedEmployeeIds.length}</span>
          </div>
      </div>
    );


    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-display text-3xl tracking-wide text-white">
                    {isEmployeeView ? 'Employés' : 'Clients'}
                </h2>
                {isAdmin && (
                    <button onClick={handleOpenAddModal} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-300">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Ajouter {isEmployeeView ? 'un employé' : 'un client'}
                    </button>
                )}
            </div>
            
            <div className="bg-slate-900/30 rounded-2xl shadow-lg border-white/10 p-1 md:p-0">
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 p-1 md:p-6">
                        {isEmployeeView 
                            ? (items as User[]).map(renderEmployeeCard) 
                            : (items as Client[]).map(renderClientCard)}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400">
                        <div className="flex justify-center mb-4">
                            {isEmployeeView ? <UsersIcon className="w-12 h-12 text-slate-600"/> : <BriefcaseIcon className="w-12 h-12 text-slate-600"/> }
                        </div>
                        <h3 className="font-display text-xl text-white">Aucun {isEmployeeView ? 'employé' : 'client'} trouvé</h3>
                        <p className="mt-1">Commencez par en ajouter un nouveau.</p>
                    </div>
                )}
            </div>

            {isEmployeeView ? (
                <EmployeeForm 
                    isOpen={isFormModalOpen} 
                    onClose={handleCloseModals} 
                    onSave={handleSave} 
                    employee={selectedItem as User | null} 
                    clients={clients}
                />
            ) : (
                <ClientForm 
                    isOpen={isFormModalOpen} 
                    onClose={handleCloseModals} 
                    onSave={handleSave} 
                    client={selectedItem as Client | null} 
                    employees={users.filter(u => u.role === UserRole.EMPLOYEE)}
                />
            )}

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleDelete}
                title={`Supprimer ${isEmployeeView ? "l'employé" : 'le client'}`}
                message={`Êtes-vous sûr de vouloir supprimer ${selectedItem?.name || (selectedItem as Client)?.companyName}? Cette action est irréversible.`}
            />
        </div>
    );
};

export default ManagementView;
