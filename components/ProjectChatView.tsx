import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project, ChatMessage, User, Client } from '../types';
import { ArrowLeftIcon, PaperAirplaneIcon } from './icons';
import MessageWithMentions from './MessageWithMentions';

interface ProjectChatViewProps {
  project: Project;
  messages: ChatMessage[];
  currentUser: User;
  users: User[];
  client?: Client;
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

const ProjectChatView: React.FC<ProjectChatViewProps> = ({ project, messages, currentUser, users, client, onSendMessage, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getUserById = (id: string) => users.find(u => u.id === id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const mentionableUsers = useMemo(() => {
    const team = users.filter(u => project.assignedEmployeeIds.includes(u.id));
    const clientUser = client ? users.find(u => u.email === client.contactEmail) : null;
    if (clientUser && !team.some(t => t.id === clientUser.id)) {
        return [...team, clientUser];
    }
    return team;
  }, [project, users, client]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    const cursorPos = e.target.selectionStart || 0;
    const textUpToCursor = value.substring(0, cursorPos);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionQuery(query);
      setShowSuggestions(true);
      setSuggestions(mentionableUsers.filter(u => u.name.toLowerCase().includes(query)));
    } else {
      setShowSuggestions(false);
    }
  };

  const handleMentionSelect = (user: User) => {
    const currentMessage = newMessage;
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textUpToCursor = currentMessage.substring(0, cursorPos);
    const startIndex = textUpToCursor.lastIndexOf('@');
    
    const newMessageValue = 
      currentMessage.substring(0, startIndex) +
      `@${user.name} ` +
      currentMessage.substring(cursorPos);
      
    setNewMessage(newMessageValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const sortedMessages = [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return (
    <div className="p-6 md:p-8 flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
        <div>
           <button
              onClick={onBack}
              className="flex items-center text-sm text-slate-400 hover:text-white font-semibold transition-colors mb-2"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour
            </button>
          <h2 className="font-display text-4xl tracking-wide text-white">{project.name}</h2>
        </div>
      </div>

      <div className="flex-1 bg-slate-900/30 rounded-2xl shadow-lg border border-white/10 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {sortedMessages.map(message => {
            const sender = getUserById(message.senderId);
            const isCurrentUser = message.senderId === currentUser.id;
            return (
              <div key={message.id} className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!isCurrentUser && sender && (
                  <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                <div className={`max-w-xl`}>
                  <div className={`px-4 py-3 rounded-2xl ${isCurrentUser ? 'bg-green-600 text-white rounded-br-lg' : 'bg-slate-700/50 text-slate-200 rounded-bl-lg'}`}>
                    <MessageWithMentions text={message.text} allUsers={users} />
                  </div>
                   <div className={`mt-1 px-1 text-xs text-slate-400 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {!isCurrentUser && <span className="font-semibold">{sender?.name?.split(' ')[0]}</span>}
                      {' '}
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                 {isCurrentUser && sender && (
                  <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-slate-900/50 border-t border-white/10 relative">
           {showSuggestions && suggestions.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {suggestions.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleMentionSelect(user)}
                  className="w-full text-left flex items-center p-2 hover:bg-slate-700"
                >
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full mr-2" />
                  <span className="text-sm text-white">{user.name}</span>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Écrivez votre message... tapez @ pour mentionner"
              className="flex-1 block w-full rounded-full shadow-sm form-input text-slate-100 px-5 py-2.5"
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-green-600 text-white rounded-full p-3 hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-green-600/20"
              disabled={!newMessage.trim()}
              aria-label="Envoyer le message"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectChatView;