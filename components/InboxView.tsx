import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project, ChatMessage, User, UserRole, Client } from '../types';
import { PaperAirplaneIcon, EnvelopeIcon, ArrowLeftIcon } from './icons';
import MessageWithMentions from './MessageWithMentions';

interface InboxViewProps {
  currentUser: User;
  projects: Project[];
  clients: Client[];
  users: User[];
  chatMessages: ChatMessage[];
  onSendMessage: (projectId: string, text: string) => void;
  onConversationSelect: (projectId: string) => void;
}

interface Conversation {
  project: Project;
  lastMessage: ChatMessage | null;
  isUnread: boolean;
}

const InboxView: React.FC<InboxViewProps> = ({ currentUser, projects, clients, users, chatMessages, onSendMessage, onConversationSelect }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getClientById = (id: string) => clients.find(c => c.id === id);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const mentionableUsers = useMemo(() => {
    if (!selectedProject) return [];
    const team = users.filter(u => selectedProject.assignedEmployeeIds.includes(u.id));
    const client = getClientById(selectedProject.clientId);
    const clientUser = client ? users.find(u => u.email === client.contactEmail) : null;
    if (clientUser && !team.some(t => t.id === clientUser.id)) {
        return [...team, clientUser];
    }
    return team;
  }, [selectedProject, users, clients]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedProjectId) {
      scrollToBottom();
    }
  }, [chatMessages, selectedProjectId]);
  
  const myProjects = currentUser.role === UserRole.ADMIN 
    ? projects
    : projects.filter(p => p.assignedEmployeeIds.includes(currentUser.id));

  const conversations: Conversation[] = myProjects.map(project => {
    const projectMessages = chatMessages.filter(m => m.projectId === project.id);
    const lastMessage = projectMessages.length > 0
      ? projectMessages.reduce((latest, current) => new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current)
      : null;
    const isUnread = projectMessages.some(m => m.senderId !== currentUser.id && !m.readBy.includes(currentUser.id));
    return { project, lastMessage, isUnread };
  }).sort((a, b) => {
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });

  const selectedProjectMessages = chatMessages.filter(m => m.projectId === selectedProjectId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const handleConversationSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    onConversationSelect(projectId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    const cursorPos = e.target.selectionStart || 0;
    const textUpToCursor = value.substring(0, cursorPos);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
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
    if (newMessage.trim() && selectedProjectId) {
      onSendMessage(selectedProjectId, newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation List */}
      <div className={`
        w-full md:w-1/3 md:flex flex-col h-full bg-slate-800/50 
        transition-transform duration-300 ease-in-out
        ${selectedProjectId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        md:border-r md:border-white/10
      `}>
        <div className="p-5 border-b border-white/10">
          <h2 className="font-display text-2xl tracking-wide text-white">Conversations</h2>
        </div>
        <ul className="overflow-y-auto flex-1">
          {conversations.map(({ project, lastMessage, isUnread }) => {
            const client = getClientById(project.clientId);
            const isSelected = selectedProjectId === project.id;
            return (
              <li key={project.id}>
                <button
                  onClick={() => handleConversationSelect(project.id)}
                  className={`w-full text-left p-4 border-b border-slate-900/50 hover:bg-slate-700/50 transition-colors duration-200 relative ${isSelected ? 'bg-slate-700/60' : ''}`}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-full shadow-[0_0_10px_theme(colors.green.500)]"></div>}
                  {isUnread && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]"></div>}
                  <div className="flex justify-between items-center mb-1">
                    <p className={`truncate pr-8 ${isUnread ? 'font-bold text-white' : 'font-semibold text-slate-200'}`}>{project.name}</p>
                    {lastMessage && <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {client?.companyName}
                  </p>
                  <p className="text-sm text-slate-500 truncate mt-1">
                    {lastMessage ? lastMessage.text : 'Aucun message pour le moment.'}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Chat View */}
      <div className={`
        absolute top-0 left-0 w-full h-full md:static md:w-2/3 flex flex-col
        transition-transform duration-300 ease-in-out
        ${selectedProjectId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        {selectedProject ? (
          <div className="flex flex-col h-full bg-slate-900/30">
            <div className="p-4 md:p-5 border-b border-white/10 flex items-center gap-4">
               <button onClick={() => setSelectedProjectId(null)} className="md:hidden text-slate-300 hover:text-white">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
              <div>
                <h3 className="font-display text-xl tracking-wide text-white">{selectedProject.name}</h3>
                <p className="text-sm text-slate-400">{getClientById(selectedProject.clientId)?.companyName}</p>
              </div>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {selectedProjectMessages.map(message => {
                const sender = getUserById(message.senderId);
                const isCurrentUser = message.senderId === currentUser.id;
                return (
                  <div key={message.id} className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    {!isCurrentUser && sender && (
                      <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    )}
                    <div className="max-w-xl">
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
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-slate-500">
            <div className="text-center">
              <EnvelopeIcon className="w-16 h-16 mx-auto mb-4" />
              <h3 className="font-display text-2xl tracking-wide text-white">Vos Messages</h3>
              <p className="text-slate-400">Sélectionnez une conversation pour commencer à discuter.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxView;