
import React, { useState, useRef, useEffect } from 'react';
import { AiIcon, PaperAirplaneIcon } from './icons';

interface Message {
    type: 'user' | 'ai';
    text: string;
}

const AiInsightsView: React.FC = () => {
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
        if (q.includes('projet') && (q.includes('risque') || q.includes('retard'))) {
            return "Analyse des risques en cours... Le projet 'Lancement de Stellar Goods' présente un risque de retard de 35% en raison de la complexité des tâches initiales. Je recommande d'assigner un membre d'équipe supplémentaire pour la phase de planification.";
        }
        if (q.includes('employé') && (q.includes('performance') || q.includes('chargé'))) {
            return "Analyse de la charge de travail... Bob Williams semble être sous-utilisé cette semaine avec seulement 8 heures enregistrées. Il pourrait être disponible pour de nouvelles tâches. Alice Johnson, en revanche, a enregistré 45 heures, indiquant une charge de travail élevée.";
        }
        if (q.includes('rentable') || q.includes('revenu')) {
            return "Analyse de la rentabilité... Le projet 'Campagne SEO Quantum Corp' a eu la meilleure marge bénéficiaire le mois dernier (45%). Les projets de refonte de site ont en moyenne une marge de 25%.";
        }
        if (q.includes('facturation') || q.includes('factures')) {
             return "Analyse de la facturation... Il y a actuellement 1 facture en retard ('NextGen Dynamics') pour un montant de 2,500€. Je suggère d'envoyer un rappel de paiement automatisé.";
        }
        return "Je ne suis pas sûr de comprendre. Pourriez-vous reformuler votre question ? Vous pouvez me demander des choses comme 'Quel projet est le plus rentable ?' ou 'Quel employé est surchargé ?'.";
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
                    <div className="flex gap-2 mb-2">
                        {['Quel projet présente un risque de retard ?', 'Quel employé est le moins chargé ?', 'Montre-moi les factures en retard.'].map(prompt => (
                            <button key={prompt} onClick={() => handleSamplePrompt(prompt)} className="text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full transition-colors">{prompt}</button>
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
