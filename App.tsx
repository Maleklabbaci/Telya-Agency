
import React, { useState, useEffect } from 'react';
import { User, Client, UserRole, Project, ChatMessage, ToastNotificationType, TimeLog, ActiveTimer, PanelNotification } from './types';
import { MOCK_USERS, MOCK_CLIENTS, MOCK_PROJECTS, MOCK_CHAT_MESSAGES, MOCK_TIME_LOGS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ManagementView from './components/ManagementView';
import LoginScreen from './components/LoginScreen';
import ProjectManagementView from './components/ProjectManagementView';
import ClientProjectsOverview from './components/ClientProjectsOverview';
import ProjectDetailsView from './components/ProjectDetailsView';
import ClientProjectView from './components/ClientProjectView';
import ProjectChatView from './components/ProjectChatView';
import InboxView from './components/InboxView';
import { NotificationProvider, useNotification } from './components/NotificationSystem';
import usePersistentState from './components/usePersistentState';
import ProfileSettingsModal from './components/ProfileSettingsModal';

const AppContent: React.FC = () => {
    const [users, setUsers] = usePersistentState<User[]>('telya-users', MOCK_USERS);
    const [clients, setClients] = usePersistentState<Client[]>('telya-clients', MOCK_CLIENTS);
    const [projects, setProjects] = usePersistentState<Project[]>('telya-projects', MOCK_PROJECTS);
    const [chatMessages, setChatMessages] = usePersistentState<ChatMessage[]>('telya-chatMessages', MOCK_CHAT_MESSAGES);
    const [timeLogs, setTimeLogs] = usePersistentState<TimeLog[]>('telya-timeLogs', MOCK_TIME_LOGS);
    const [activeTimer, setActiveTimer] = usePersistentState<ActiveTimer | null>('telya-activeTimer', null);
    const [panelNotifications, setPanelNotifications] = usePersistentState<PanelNotification[]>('telya-panelNotifications', []);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedClientForOverview, setSelectedClientForOverview] = useState<Client | null>(null);
    const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<Project | null>(null);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    const triggerSyncAnimation = () => {
        if (isSyncing) return;
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1500);
    };

    function updateStateAndSync<T>(setter: React.Dispatch<React.SetStateAction<T>>, data: React.SetStateAction<T>) {
        setter(data);
        triggerSyncAnimation();
    }

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setActiveView('dashboard');
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Connexion réussie', message: `Bienvenue, ${user.name.split(' ')[0]} !` });
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setSelectedClientForOverview(null);
        setSelectedProjectForDetails(null);
    };

    const handleViewClientProjects = (client: Client) => {
        setSelectedClientForOverview(client);
        setActiveView('client-projects-overview');
    };
    
    const handleViewProjectDetails = (project: Project) => {
        setSelectedProjectForDetails(project);
        setActiveView('project-details');
    };
    
    const handleViewProjectChat = (project: Project) => {
        setSelectedProjectForDetails(project);
        setActiveView('project-chat');
    };

    const handleBackToClients = () => {
        setSelectedClientForOverview(null);
        setActiveView('clients');
    };

    const handleBackToProjects = () => {
        setSelectedProjectForDetails(null);
        setActiveView('projects');
    };
    
    const handleBackFromChat = () => {
        if (currentUser?.role === UserRole.CLIENT) {
            setSelectedProjectForDetails(null);
            setActiveView('my-projects');
        } else {
            setActiveView('project-details');
        }
    };

    // --- CRUD Handlers ---

    // Profile
    const handleUpdateProfile = (updatedData: Partial<User>) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updatedData };
        
        updateStateAndSync(setUsers, prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
        setCurrentUser(updatedUser);

        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Profil mis à jour', message: 'Vos informations ont été enregistrées.' });
        setIsProfileModalOpen(false);
    };

    // Employees
    const handleAddEmployee = (employeeData: Omit<User, 'id' | 'role' | 'avatar'>) => {
        const newUser: User = {
            id: `user-emp-${Date.now()}`,
            ...employeeData,
            role: UserRole.EMPLOYEE,
            avatar: `https://i.pravatar.cc/150?u=user-emp-${Date.now()}`,
        };
        updateStateAndSync(setUsers, prev => [...prev, newUser]);
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Employé ajouté', message: 'Le nouvel employé a été ajouté avec succès.' });
    };
    const handleUpdateEmployee = (updatedEmployee: User) => {
        updateStateAndSync(setUsers, prev => prev.map(user => user.id === updatedEmployee.id ? updatedEmployee : user));
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Employé mis à jour', message: 'Les informations ont été mises à jour.' });
    };
    const handleDeleteEmployee = (employeeId: string) => {
        // Unassign from projects
        const updatedProjects = projects.map(p => ({
            ...p,
            assignedEmployeeIds: p.assignedEmployeeIds.filter(id => id !== employeeId)
        }));
        setProjects(updatedProjects);
        // Unassign from clients
        const updatedClients = clients.map(c => ({
            ...c,
            assignedEmployeeIds: c.assignedEmployeeIds.filter(id => id !== employeeId)
        }));
        setClients(updatedClients);
        // Delete time logs
        const updatedTimeLogs = timeLogs.filter(log => log.employeeId !== employeeId);
        setTimeLogs(updatedTimeLogs);
        // Delete user
        updateStateAndSync(setUsers, prev => prev.filter(user => user.id !== employeeId));
        addNotification({ type: ToastNotificationType.INFO, title: 'Employé supprimé', message: "L'employé et ses données associées ont été supprimés." });
    };

    // Clients
    const handleAddClient = (clientData: Omit<Client, 'id' | 'logo'>) => {
        const newClient: Client = {
            id: `client-${Date.now()}`,
            ...clientData,
            logo: `https://logo.clearbit.com/${clientData.companyName.toLowerCase().replace(/\s/g, '')}.com`,
        };
        updateStateAndSync(setClients, prev => [...prev, newClient]);
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Client ajouté', message: 'Le nouveau client a été ajouté avec succès.' });
    };
    const handleUpdateClient = (updatedClient: Client) => {
        updateStateAndSync(setClients, prev => prev.map(client => client.id === updatedClient.id ? updatedClient : client));
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Client mis à jour', message: 'Les informations ont été mises à jour.' });
    };
    const handleDeleteClient = (clientId: string) => {
        const projectsToDelete = projects.filter(p => p.clientId === clientId).map(p => p.id);

        const updatedProjects = projects.filter(p => p.clientId !== clientId);
        setProjects(updatedProjects);

        const updatedChatMessages = chatMessages.filter(msg => !projectsToDelete.includes(msg.projectId));
        setChatMessages(updatedChatMessages);

        const updatedTimeLogs = timeLogs.filter(log => !projectsToDelete.includes(log.projectId));
        setTimeLogs(updatedTimeLogs);

        const updatedUsers = users.map(u => ({
            ...u,
            assignedClientIds: u.assignedClientIds?.filter(id => id !== clientId)
        }));
        setUsers(updatedUsers);

        updateStateAndSync(setClients, prev => prev.filter(client => client.id !== clientId));
        addNotification({ type: ToastNotificationType.INFO, title: 'Client supprimé', message: 'Le client et tous ses projets associés ont été supprimés.' });
    };

    // Projects
    const handleAddProject = (projectData: Omit<Project, 'id'>) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            ...projectData,
        };
        updateStateAndSync(setProjects, prev => [...prev, newProject]);
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Projet créé', message: 'Le nouveau projet a été créé avec succès.' });
    };
    const handleUpdateProject = (updatedProject: Project) => {
        const oldProject = projects.find(p => p.id === updatedProject.id);
        if (oldProject && oldProject.status !== updatedProject.status) {
            const client = clients.find(c => c.id === updatedProject.clientId);
            const clientUser = client ? users.find(u => u.email === client.contactEmail) : null;
            
            const recipients = [...new Set(updatedProject.assignedEmployeeIds)];
            if (clientUser) {
                recipients.push(clientUser.id);
            }

            const newNotifications: PanelNotification[] = recipients.map(userId => ({
                id: `panel-notif-${Date.now()}-${userId}`,
                userId,
                projectId: updatedProject.id,
                type: 'project-status',
                title: `Statut du projet mis à jour`,
                description: `Le projet "${updatedProject.name}" est maintenant "${updatedProject.status}".`,
                timestamp: new Date(),
                read: false,
            }));
            
            updateStateAndSync(setPanelNotifications, prev => [...prev, ...newNotifications]);
        }
        
        updateStateAndSync(setProjects, prev => prev.map(project => project.id === updatedProject.id ? updatedProject : project));
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Projet mis à jour', message: 'Les détails du projet ont été mis à jour.' });
    };
    const handleDeleteProject = (projectId: string) => {
        const updatedChatMessages = chatMessages.filter(msg => msg.projectId !== projectId);
        setChatMessages(updatedChatMessages);
        
        const updatedTimeLogs = timeLogs.filter(log => log.projectId !== projectId);
        setTimeLogs(updatedTimeLogs);

        updateStateAndSync(setProjects, prev => prev.filter(project => project.id !== projectId));
        addNotification({ type: ToastNotificationType.INFO, title: 'Projet supprimé', message: 'Le projet et ses données associées ont été supprimés.' });
    };

    // Chat
    const handleAddChatMessage = (projectId: string, text: string) => {
        if (!currentUser) return;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            projectId,
            senderId: currentUser.id,
            text,
            timestamp: new Date(),
        };
        updateStateAndSync(setChatMessages, prev => [...prev, newMessage]);

        // Create notifications
        const client = clients.find(c => c.id === project.clientId);
        const clientUser = client ? users.find(u => u.email === client.contactEmail) : null;
        
        let recipients = [...new Set(project.assignedEmployeeIds)];
        if (clientUser) {
            recipients.push(clientUser.id);
        }
        
        // Filter out the sender
        recipients = recipients.filter(id => id !== currentUser.id);

        const newNotifications: PanelNotification[] = recipients.map(userId => ({
            id: `panel-notif-${Date.now()}-${userId}`,
            userId,
            projectId: project.id,
            type: 'new-message',
            title: `Nouveau message dans "${project.name}"`,
            description: `${currentUser.name}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`,
            timestamp: new Date(),
            read: false,
        }));
        
        updateStateAndSync(setPanelNotifications, prev => [...prev, ...newNotifications]);
    };

    // Time Tracking
    const handleStartTimer = (projectId: string) => {
        if (!currentUser) return;
        const newTimer = {
            projectId,
            employeeId: currentUser.id,
            startTime: Date.now(),
        };
        updateStateAndSync(setActiveTimer, newTimer);
        addNotification({ type: ToastNotificationType.INFO, title: 'Minuteur démarré', message: `Le suivi du temps a commencé.` });
    };

    const handleStopTimerAndLog = (logData: Omit<TimeLog, 'id' | 'employeeId'>) => {
        if (!currentUser) return;
        const newLog: TimeLog = {
            id: `tl-${Date.now()}`,
            employeeId: currentUser.id,
            ...logData,
        };
        updateStateAndSync(setTimeLogs, prev => [...prev, newLog]);
        setActiveTimer(null); // No sync on this one, covered by setTimeLogs
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Heures enregistrées', message: 'Vos heures ont été ajoutées au projet.' });
    };

    // Notifications
    const handleNotificationClick = (notification: PanelNotification) => {
        updateStateAndSync(setPanelNotifications, prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));

        const project = projects.find(p => p.id === notification.projectId);
        if (!project) return;

        setSelectedProjectForDetails(project);
        if (notification.type === 'new-message') {
            setActiveView('project-chat');
        } else {
            setActiveView('project-details');
        }
    };
    
    const handleMarkAllNotificationsAsRead = () => {
        if (!currentUser) return;
        updateStateAndSync(setPanelNotifications, prev => 
            prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n)
        );
    };

    if (!currentUser) {
        return <LoginScreen users={users} onLogin={handleLogin} />;
    }

    const getPageTitle = () => {
        if (activeView === 'client-projects-overview' && selectedClientForOverview) {
            return `Projets : ${selectedClientForOverview.companyName}`;
        }
        if (activeView === 'project-details' && selectedProjectForDetails) {
            return `Détails : ${selectedProjectForDetails.name}`;
        }
        if (activeView === 'project-chat' && selectedProjectForDetails) {
            return `Discussion : ${selectedProjectForDetails.name}`;
        }
        switch (activeView) {
            case 'dashboard': return 'Tableau de bord';
            case 'messages': return 'Messages';
            case 'employees': return 'Gestion des Employés';
            case 'clients': return 'Gestion des Clients';
            case 'projects': return 'Gestion des Projets';
            case 'my-clients': return 'Mes Clients';
            case 'my-projects': return 'Mes Projets';
            case 'my-team': return 'Mon Équipe';
            default: return 'Telya';
        }
    };

    const isInboxView = activeView === 'messages' && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EMPLOYEE);

    const renderMainContent = () => {
        if (activeView === 'client-projects-overview' && selectedClientForOverview) {
            return <ClientProjectsOverview client={selectedClientForOverview} projects={projects} users={users} onBack={handleBackToClients} />;
        }
        if (activeView === 'project-details' && selectedProjectForDetails) {
            const client = clients.find(c => c.id === selectedProjectForDetails.clientId);
            const team = users.filter(u => selectedProjectForDetails.assignedEmployeeIds.includes(u.id));
            if (!client) return null;
            return <ProjectDetailsView 
                project={selectedProjectForDetails} 
                client={client} 
                team={team} 
                currentUser={currentUser}
                timeLogs={timeLogs}
                users={users}
                onBack={handleBackToProjects} 
                onViewChat={handleViewProjectChat} 
                activeTimer={activeTimer}
                onStartTimer={handleStartTimer}
                onStopTimerAndLog={handleStopTimerAndLog}
            />;
        }
        if (activeView === 'project-chat' && selectedProjectForDetails) {
            const projectMessages = chatMessages.filter(m => m.projectId === selectedProjectForDetails.id);
            const client = clients.find(c => c.id === selectedProjectForDetails.clientId);
            return <ProjectChatView 
                project={selectedProjectForDetails} 
                messages={projectMessages} 
                currentUser={currentUser} 
                users={users}
                client={client}
                onSendMessage={(text) => handleAddChatMessage(selectedProjectForDetails.id, text)}
                onBack={handleBackFromChat}
            />;
        }


        switch (activeView) {
            case 'dashboard':
                return <Dashboard currentUser={currentUser} users={users} clients={clients} projects={projects} chatMessages={chatMessages} onNavigate={setActiveView} />;
            case 'messages':
                if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EMPLOYEE) {
                    return <InboxView
                        currentUser={currentUser}
                        users={users}
                        clients={clients}
                        projects={projects}
                        chatMessages={chatMessages}
                        onSendMessage={handleAddChatMessage}
                    />;
                }
                return null;
            case 'employees':
                if (currentUser.role === UserRole.ADMIN) {
                    return <ManagementView type="employee" users={users} clients={clients} currentUser={currentUser} onAdd={handleAddEmployee} onUpdate={handleUpdateEmployee} onDelete={handleDeleteEmployee} />;
                }
                return null;
            case 'clients':
                 if (currentUser.role === UserRole.ADMIN) {
                    return <ManagementView type="client" users={users} clients={clients} currentUser={currentUser} onAdd={handleAddClient} onUpdate={handleUpdateClient} onDelete={handleDeleteClient} onViewClientProjects={handleViewClientProjects} />;
                }
                return null;
            case 'projects':
                if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.EMPLOYEE) {
                    return <ProjectManagementView 
                                projects={projects} 
                                users={users} 
                                clients={clients} 
                                currentUser={currentUser} 
                                onAdd={handleAddProject} 
                                onUpdate={handleUpdateProject} 
                                onDelete={handleDeleteProject} 
                                onViewDetails={handleViewProjectDetails} 
                                timeLogs={timeLogs} 
                                onManualRefresh={triggerSyncAnimation} />;
                }
                return null;
            case 'my-clients':
                if (currentUser.role === UserRole.EMPLOYEE) {
                    const myClients = clients.filter(client => currentUser.assignedClientIds?.includes(client.id));
                    return (
                        <ManagementView type="client" users={users} clients={myClients} currentUser={currentUser} onAdd={handleAddClient} onUpdate={handleUpdateClient} onDelete={handleDeleteClient} />
                    );
                }
                return null;
            case 'my-projects':
                if (currentUser.role === UserRole.CLIENT) {
                    return <ClientProjectView currentUser={currentUser} projects={projects} clients={clients} users={users} onViewChat={handleViewProjectChat} />;
                }
                return null;
            case 'my-team':
                if (currentUser.role === UserRole.CLIENT) {
                     const myClientProfile = clients.find(c => c.contactEmail === currentUser.email);
                     const myTeam = users.filter(user => myClientProfile?.assignedEmployeeIds.includes(user.id) && user.role === UserRole.EMPLOYEE);
                     return (
                        <ManagementView type="employee" users={myTeam} clients={clients} currentUser={currentUser} onAdd={handleAddEmployee} onUpdate={handleUpdateEmployee} onDelete={handleDeleteEmployee} />
                    );
                }
                return null;
            default:
                return <Dashboard currentUser={currentUser} users={users} clients={clients} projects={projects} chatMessages={chatMessages} onNavigate={setActiveView} />;
        }
    };


    return (
        <div className="relative min-h-screen">
            <div className="flex h-screen w-full text-slate-200">
                <Sidebar 
                    currentUser={currentUser} 
                    activeView={
                        activeView.startsWith('client-projects') ? 'clients' : 
                        activeView.startsWith('project-details') || activeView.startsWith('project-chat') ? 'projects' : 
                        activeView
                    } 
                    setActiveView={setActiveView} 
                    isOpenOnMobile={isMobileNavOpen}
                    onCloseMobile={() => setIsMobileNavOpen(false)}
                    onLogout={handleLogout}
                    onOpenProfileSettings={() => setIsProfileModalOpen(true)}
                />
                <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-hidden">
                    <Header 
                        title={getPageTitle()}
                        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        currentUser={currentUser}
                        panelNotifications={panelNotifications}
                        onNotificationClick={handleNotificationClick}
                        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
                        isSyncing={isSyncing}
                    />
                    <main className={`flex-1 rounded-2xl md:rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 ${isInboxView ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                        {renderMainContent()}
                    </main>
                </div>
            </div>
            {isMobileNavOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                    onClick={() => setIsMobileNavOpen(false)}
                ></div>
            )}
             <ProfileSettingsModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleUpdateProfile}
                currentUser={currentUser}
            />
        </div>
    );
};

export const App: React.FC = () => {
    return (
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    );
};
