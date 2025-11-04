import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheckIcon, UsersIcon, ClientsIcon, ArrowUturnLeftIcon } from './icons';

interface LoginScreenProps {
    users: User[];
    onLogin: (user: User) => void;
}

// FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
// React.ReactNode is a more robust type for elements that can be rendered.
const roleDetails: { [key in UserRole]: { icon: React.ReactNode; name: string; description: string } } = {
    [UserRole.ADMIN]: {
        icon: <ShieldCheckIcon className="w-10 h-10" />,
        name: 'Administrateur',
        description: "Gérez les employés, les clients et les projets.",
    },
    [UserRole.EMPLOYEE]: {
        icon: <UsersIcon className="w-10 h-10" />,
        name: 'Employé',
        description: 'Accédez à vos projets et clients assignés.',
    },
    [UserRole.CLIENT]: {
        icon: <ClientsIcon className="w-10 h-10" />,
        name: 'Client',
        description: 'Suivez vos projets et communiquez avec votre équipe.',
    }
};

const RoleCard: React.FC<{
    role: UserRole;
    onClick: () => void;
    isSelected: boolean;
    isAnyRoleSelected: boolean;
}> = ({ role, onClick, isSelected, isAnyRoleSelected }) => {
    const details = roleDetails[role];
    return (
        <div
            onClick={onClick}
            className={`
                group bg-slate-900/30 rounded-3xl p-6 flex flex-col items-center text-center cursor-pointer 
                transition-all duration-500 ease-in-out transform-gpu 
                border ${isSelected ? 'border-green-500 shadow-2xl shadow-green-600/20' : 'border-white/10 hover:border-white/20'}
                ${isAnyRoleSelected && !isSelected ? 'opacity-30 scale-90 hover:opacity-100' : 'opacity-100 hover:-translate-y-2'}
            `}
        >
            <div className={`
                mb-4 text-green-400 transition-transform duration-500
                ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
            `}>
                {details.icon}
            </div>
            <h3 className={`font-display text-2xl mb-1 text-white`}>{details.name}</h3>
            <p className="text-slate-400 text-sm h-10">{details.description}</p>
        </div>
    );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [credential, setCredential] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setError(null);
        setCredential('');
        setAdminPassword('');
    };
    
    const handleBack = () => {
        setSelectedRole(null);
        setError(null);
        setAdminPassword('');
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const ADMIN_PASSWORD = 'admin'; // Mot de passe administrateur simple
        const adminUser = users.find(u => u.role === UserRole.ADMIN);

        if (adminPassword === ADMIN_PASSWORD) {
            if (adminUser) {
                onLogin(adminUser);
            } else {
                setError("Configuration d'administrateur introuvable.");
            }
        } else {
            setError('Mot de passe administrateur incorrect.');
            const form = (e.target as HTMLFormElement);
            form.classList.remove('shake');
            void form.offsetWidth; // trigger reflow
            form.classList.add('shake');
        }
    };

    const handleUserLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole || !credential.trim()) return;

        const user = users.find(u =>
            u.role === selectedRole &&
            u.email.toLowerCase() === credential.trim().toLowerCase()
        );
        
        if (user) {
            onLogin(user);
        } else {
            setError('Adresse e-mail incorrecte. Veuillez réessayer.');
            const form = (e.target as HTMLFormElement);
            form.classList.remove('shake');
            void form.offsetWidth; // trigger reflow
            form.classList.add('shake');
        }
    };

    const getTitle = () => {
        if (!selectedRole) return "Le centre de commande de votre agence digitale";
        if (selectedRole === UserRole.ADMIN) return `Connexion Administrateur`;
        return `Connectez-vous à votre espace ${roleDetails[selectedRole].name}`;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 dot-grid">
           <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="font-display text-5xl md:text-7xl tracking-wide text-white">
                        Bienvenue sur <span className="text-green-500 text-glow">Telya</span>
                    </h1>
                    <p className="text-slate-300 mt-4 text-lg max-w-2xl mx-auto">
                       {getTitle()}
                    </p>
                </div>
                
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 transition-all duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {(Object.keys(roleDetails) as UserRole[]).map(role => (
                            <RoleCard
                                key={role}
                                role={role}
                                onClick={() => handleRoleSelect(role)}
                                isSelected={selectedRole === role}
                                isAnyRoleSelected={selectedRole !== null}
                            />
                       ))}
                    </div>

                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${selectedRole ? 'max-h-[500px] mt-8' : 'max-h-0 mt-0'}`}>
                        <div className="flex justify-center mb-6">
                            <button onClick={handleBack} className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors">
                                <ArrowUturnLeftIcon className="w-4 h-4" />
                                <span>Changer de rôle</span>
                            </button>
                        </div>
                        
                        {selectedRole === UserRole.ADMIN && (
                             <form onSubmit={handleAdminLogin} className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">
                                <input
                                    type="password"
                                    value={adminPassword}
                                    onChange={(e) => {
                                        setAdminPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Entrez le mot de passe"
                                    className="block w-full rounded-lg shadow-sm form-input text-slate-100 text-center text-lg px-4 py-3"
                                    required
                                    autoFocus
                                />
                                {error && <p className="text-red-400 text-sm -mt-2">{error}</p>}
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20"
                                >
                                    Se Connecter
                                </button>
                            </form>
                        )}

                        {(selectedRole === UserRole.EMPLOYEE || selectedRole === UserRole.CLIENT) && (
                            <form onSubmit={handleUserLogin} className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">
                                <input
                                    type="email"
                                    value={credential}
                                    onChange={(e) => {
                                        setCredential(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Entrez votre e-mail"
                                    className="block w-full rounded-lg shadow-sm form-input text-slate-100 text-center text-lg px-4 py-3"
                                    required
                                    autoFocus
                                />
                                {error && <p className="text-red-400 text-sm -mt-2">{error}</p>}
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20"
                                >
                                    Accéder à mon espace
                                </button>
                            </form>
                        )}
                    </div>
                </div>
           </div>
        </div>
    );
};

export default LoginScreen;