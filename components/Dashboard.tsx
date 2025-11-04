import React from 'react';
import { User, UserRole } from '../types';

interface DashboardProps {
    currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
    
    const getGreeting = () => {
        const hours = new Date().getHours();
        if (hours < 12) return 'Bonjour';
        if (hours < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h2 className="font-display text-4xl tracking-wide text-white">
                    {getGreeting()}, <span className="text-telya-green">{currentUser.name.split(' ')[0]}</span>!
                </h2>
                <p className="text-slate-400 mt-2">Bienvenue sur votre espace de travail Telya.</p>
            </div>
            {/* Le contenu spécifique au tableau de bord de chaque rôle sera développé ici. */}
            <div className="bg-slate-900/30 rounded-2xl p-8 border border-white/10 text-center">
                <h3 className="font-display text-2xl text-white">Tableau de bord</h3>
                 <p className="text-slate-400 mt-2">Le contenu de cette page est en cours de construction.</p>
            </div>
        </div>
    );
};

export default Dashboard;