

import React, { useState, useRef, useEffect } from 'react';
import { AiIcon, PaperAirplaneIcon } from './icons';
import { Project, User, Client, Invoice, Task, TimeLog, ProjectStatus } from '../types';

interface Message {
    type: 'user' | 'ai';
    text: string;
}

interface AiInsightsViewProps {
    projects: Project[];
    users: User[];
    clients: Client[];
    invoices: Invoice[];
    tasks: Task[];
    timeLogs: TimeLog[];
}


const AiInsightsView: React.FC<AiInsightsViewProps> = ({ projects, users, clients, invoices, tasks, timeLogs }) => {
    const [messages, setMessages] = useState<Message[]>([
        { type: 'ai', text: "Bonjour ! Je suis l'assistant IA de Telya. Comment puis-je vous aider à analyser les données de votre agence aujourd'hui ?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const getSimulatedResponse = (query: string): string => {
        const q = query.toLowerCase();

        // Project risk analysis
        if (q.includes('projet') && (q.includes('risque') || q.includes('retard'))) {
            const projectsAtRisk = projects.filter(p => {
                const dueDate = p.dueDate ? new Date(p.dueDate) : null;
                const isOverdue = dueDate && dueDate < new Date() && p.status !== 'Terminé';
                const tasksToDo = tasks.filter(t => t.projectId === p.id && t.status === 'To Do').length;
                const tasksInProgress = tasks.filter(t => t.projectId === p.id && t.status === 'In Progress').length;
                return isOverdue || (tasksToDo > 3 && tasksInProgress === 0 && p.status === 'En cours');
            });
            if (projectsAtRisk.length > 0) {
                return `Analyse des risques en cours... ${projectsAtRisk.length} projet(s) présentent un risque. Le projet '${projectsAtRisk[0].name}' est particulièrement à risque car il est en retard sur son échéance.`;
            }
            return "D'après mon analyse, aucun projet ne semble présenter de risque de retard majeur actuellement. Bon travail !";
        }

        // Employee workload analysis
        if (q.includes('employé') && (q.includes('performance') || q.includes('chargé'))) {
            const employeeHours = users
                .filter(u => u.role === 'Employee')
                .map(emp => {
                    const hours = timeLogs
                        .filter(log => log.employeeId === emp.id)
                        .reduce((sum, log) => sum + log.hours, 0);
                    return { name: emp.name, hours };
                })
                .sort((a, b) => a.hours - b.hours);
            
            if (employeeHours.length > 0) {
                const leastBusy = employeeHours[0];
                const mostBusy = employeeHours[employeeHours.length - 1];
                return `Analyse de la charge de travail... ${mostBusy.name} est le plus chargé avec ${mostBusy.hours.toFixed(1)}h enregistrées. ${leastBusy.name} semble avoir le plus de disponibilité avec seulement ${leastBusy.hours.toFixed(1)}h.`;
            }
            return "Je n'ai pas assez de données sur les heures pour analyser la charge de travail des employés.";
        }

        // Profitability analysis
        if (q.includes('rentable') || q.includes('revenu')) {
             const projectRevenue = projects.map(p => {
                const revenue = invoices
                    .filter(inv => inv.projectId === p.id && inv.status === 'Paid')
                    .reduce((sum, inv) => sum + inv.amount, 0);
                return { name: p.name, revenue };
             }).filter(p => p.revenue > 0).sort((a, b) => b.revenue - a.revenue);
             
             if(projectRevenue.length > 0) {
                return `Analyse de la rentabilité... Le projet '${projectRevenue[0].name}' est le plus rentable avec ${projectRevenue[0].revenue.toLocaleString('fr-FR')} DZD de revenus facturés et payés.`;
             }
             return "Je n'ai pas assez de données de facturation payées liées à des projets pour déterminer le plus rentable.";
        }
        
        // Billing analysis
        if (q.includes('facturation') || q.includes('factures')) {
            const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
            if (overdueInvoices.length > 0) {
                const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                const clientName = clients.find(c => c.id === overdueInvoices[0].clientId)?.companyName;
                return `Analyse de la facturation... Il y a ${overdueInvoices.length} facture(s) en retard pour un total de ${totalOverdue.toLocaleString('fr-FR')} DZD. La plus ancienne concerne ${clientName}. Je suggère d'envoyer un rappel.`;
            }
            return "Excellente nouvelle ! Toutes les factures sont à jour.";
        }

        // Client analysis
        if (q.includes('client') && (q.includes('valeur') || q.includes('important'))) {
            const clientRevenue = clients.map(c => {
                const revenue = invoices
                    .filter(inv => inv.clientId === c.id && inv.status === 'Paid')
                    .reduce((sum, inv) => sum + inv.amount, 0);
                return { name: c.companyName, revenue };
            }).sort((a,b) => b.revenue - a.revenue);

            if (clientRevenue.length > 0 && clientRevenue[0].revenue > 0) {
                return `En termes de revenus facturés et payés, ${clientRevenue[0].name} est votre client le plus important, avec un total de ${clientRevenue[0].revenue.toLocaleString('fr-FR')} DZD.`;
            }
            return "Je ne peux pas encore déterminer le client le plus important car il n'y a pas de factures payées.";
        }
        
        // Task bottlenecks
        if (q.includes('tâche') && (q.includes('bloquée') || q.includes('ancienne'))) {
             const todoTasks = tasks.filter(t => t.status === 'To Do');
             const projectsWithOldTodos = projects.map(p => {
                const projectTodoTasks = todoTasks.filter(t => t.projectId === p.id);
                if (projectTodoTasks.length > 2 && p.status === ProjectStatus.IN_PROGRESS) {
                    return p.name;
                }
                return null;
             }).filter(Boolean);

             if (projectsWithOldTodos.length > 0) {
                return `Analyse des tâches... Le projet '${projectsWithOldTodos[0]}' a plusieurs tâches en attente. Cela pourrait créer un goulot d'étranglement. Il serait judicieux de vérifier leur statut avec l'équipe.`;
             }
             return "La répartition des tâches semble saine. Aucune accumulation critique de tâches 'À faire' n'a été détectée dans les projets en cours.";
        }

        // General Summary
        if (q.includes('résumé') || q.includes('aperçu') || q.includes('santé')) {
            const activeProjectsCount = projects.filter(p => p.status === 'En cours').length;
            const overdueInvoicesCount = invoices.filter(inv => inv.status === 'Overdue').length;
            const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
            return `Voici un résumé de l'état de l'agence :
- ${activeProjectsCount} projets sont actuellement en cours.
- ${completedTasksCount} tâches ont été terminées au total.
- ${overdueInvoicesCount} facture(s) sont en retard de paiement.
Globalement, l'activité est stable, mais il faut surveiller la facturation.`;
        }

        return "Je ne suis pas sûr de comprendre. Pourriez-vous reformuler ? Essayez 'Donne-moi un résumé de l'agence' ou 'Quel client est le plus important ?'.";
    };


    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = { type: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        setTimeout(() => {
            const aiResponse: Message = { type: 'ai', text: getSimulatedResponse(input) };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };
    
    const handleSamplePrompt = (prompt: string) => {
        setInput(prompt);
    }

    return (
        <div className="p-6 md:p-8 flex flex-col h-full">
            <h2 className="font-display text-4xl tracking-wide text-white mb-2">Insights IA</h2>
            <p className="text-slate-400 mb-6">Posez des questions en langage naturel sur votre agence.</p>
            
            <div className="flex-1 bg-slate-900/30 rounded-2xl shadow-lg border border-white/10 flex flex-col overflow-hidden">
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {message.type === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-telya-green/10 text-telya-green flex items-center justify-center flex-shrink-0">
                                    <AiIcon className="w-5 h-5"/>
                                </div>
                            )}
                            <div className={`max-w-xl px-4 py-3 rounded-2xl ${message.type === 'user' ? 'bg-green-600 text-white' : 'bg-slate-700/50 text-slate-200'}`}>
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-telya-green/10 text-telya-green flex items-center justify-center flex-shrink-0">
                                <AiIcon className="w-5 h-5"/>
                            </div>
                            <div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-700/50 text-slate-200 flex items-center space-x-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                 <div className="p-4 bg-slate-900/50 border-t border-white/10">
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {['Donne-moi un résumé de l\'agence', 'Quel client est le plus important ?', 'Y a-t-il des tâches bloquées ?'].map(prompt => (
                            <button key={prompt} onClick={() => handleSamplePrompt(prompt)} className="flex-shrink-0 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full transition-colors">{prompt}</button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Posez votre question ici..."
                            className="flex-1 block w-full rounded-full shadow-sm form-input text-slate-100 px-5 py-2.5"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-green-600/20"
                            disabled={isLoading || !input.trim()}
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AiInsightsView;