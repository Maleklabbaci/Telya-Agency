
import React, { useState } from 'react';
import { Feedback, Project, User, Client, ProjectStatus } from '../types';
import { StarIcon, FeedbackIcon } from './icons';

interface ClientFeedbackViewProps {
    currentUser: User;
    feedback: Feedback[];
    projects: Project[];
    clients: Client[];
    onAddFeedback: (feedbackData: Omit<Feedback, 'id' | 'timestamp'>) => void;
}

const StarRating: React.FC<{ rating: number; setRating?: (r: number) => void }> = ({ rating, setRating }) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
            <StarIcon
                key={star}
                onClick={setRating ? () => setRating(star) : undefined}
                className={`w-6 h-6 ${rating >= star ? 'text-yellow-400' : 'text-slate-600'} ${setRating ? 'cursor-pointer' : ''}`}
            />
        ))}
    </div>
);


const ClientFeedbackView: React.FC<ClientFeedbackViewProps> = ({ currentUser, feedback, projects, clients, onAddFeedback }) => {
    const [selectedProject, setSelectedProject] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const myClientProfile = clients.find(c => c.contactEmail === currentUser.email);
    if (!myClientProfile) {
        return <div className="p-8 text-center">Profil client non trouvé.</div>;
    }

    const myFeedback = feedback.filter(f => f.clientId === myClientProfile.id);
    const completedProjects = projects.filter(p => p.clientId === myClientProfile.id && p.status === ProjectStatus.COMPLETED);

    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Projet Inconnu';
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || rating === 0 || !comment.trim()) {
            alert("Veuillez remplir tous les champs.");
            return;
        }
        onAddFeedback({
            clientId: myClientProfile.id,
            projectId: selectedProject,
            rating,
            comment
        });
        // Reset form
        setSelectedProject('');
        setRating(0);
        setComment('');
    };

    return (
        <div className="p-6 md:p-8">
            <h2 className="font-display text-4xl tracking-wide text-white mb-8">Feedback & Témoignages</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Feedback Form */}
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="font-display text-2xl text-white mb-4">Donner un feedback</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="project" className="block text-sm font-medium text-slate-300 mb-1">Projet terminé</label>
                            <select
                                id="project"
                                value={selectedProject}
                                onChange={e => setSelectedProject(e.target.value)}
                                className="appearance-none block w-full rounded-md shadow-sm form-input form-select text-slate-100"
                                required
                            >
                                <option value="" disabled>Sélectionnez un projet</option>
                                {completedProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Votre note</label>
                            <StarRating rating={rating} setRating={setRating} />
                        </div>
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-slate-300 mb-1">Commentaire</label>
                             <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                className="block w-full rounded-md shadow-sm form-input text-slate-100"
                                placeholder="Comment s'est passée votre expérience avec nous sur ce projet ?"
                                required
                            />
                        </div>
                        <div className="text-right">
                             <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20"
                            >
                                Envoyer le feedback
                            </button>
                        </div>
                    </form>
                </div>
                {/* Past Feedback */}
                <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/10">
                     <h3 className="font-display text-2xl text-white mb-4">Vos feedbacks précédents</h3>
                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {myFeedback.length > 0 ? myFeedback.map(fb => (
                            <div key={fb.id} className="bg-slate-800/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-white">{getProjectName(fb.projectId)}</h4>
                                    <StarRating rating={fb.rating} />
                                </div>
                                <p className="text-sm text-slate-300 italic">"{fb.comment}"</p>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500">
                                <FeedbackIcon className="w-10 h-10 mx-auto mb-2"/>
                                <p>Vous n'avez pas encore soumis de feedback.</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ClientFeedbackView;
