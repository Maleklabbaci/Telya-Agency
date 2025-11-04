import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; setEnabled: (e: boolean) => void; }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-slate-300">{label}</span>
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-green-500' : 'bg-slate-600'
            }`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
        </button>
    </div>
);


const SettingsView: React.FC<{ onLogout: () => void; }> = ({ onLogout }) => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    
    const handleDeleteAccount = () => {
        alert("Compte supprimé avec succès. Vous allez être déconnecté.");
        onLogout();
    };

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-6">Paramètres</h2>
            
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-display text-xl text-white mb-4">Notifications</h3>
                    <div className="space-y-4">
                        <ToggleSwitch label="Notifications par e-mail" enabled={emailNotifications} setEnabled={setEmailNotifications} />
                        <ToggleSwitch label="Notifications push (navigateur)" enabled={pushNotifications} setEnabled={setPushNotifications} />
                    </div>
                </div>

                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-display text-xl text-white mb-4">Apparence</h3>
                    <div className="space-y-4">
                        <ToggleSwitch label="Mode Sombre" enabled={darkMode} setEnabled={setDarkMode} />
                    </div>
                </div>
                
                 <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-display text-xl text-white mb-4">Compte</h3>
                    <div className="flex flex-col items-start space-y-4">
                       <button onClick={() => alert('Une fenêtre modale pour changer de mot de passe s\'ouvrirait ici.')} className="text-sm font-semibold text-telya-green hover:text-telya-green/80">Changer de mot de passe</button>
                       <button onClick={() => setIsDeleteConfirmOpen(true)} className="text-sm font-semibold text-red-500 hover:text-red-400">Supprimer le compte</button>
                    </div>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteAccount}
                title="Supprimer le compte"
                message="Êtes-vous absolument sûr ? Cette action est irréversible et toutes vos données seront perdues."
            />
        </div>
    );
};

export default SettingsView;
