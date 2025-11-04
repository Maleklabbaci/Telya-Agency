import React, { useState, useEffect } from 'react';
import { User, UserRole, View, Project, Client, ActivityLog, TimeLog, ChatMessage, ActiveTimer, ToastNotificationType, Invoice, ProjectFile, Task, Feedback, PanelNotification } from './types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_CLIENTS, MOCK_ACTIVITY_LOG, MOCK_TIME_LOGS, MOCK_CHAT_MESSAGES, MOCK_INVOICES, MOCK_FILES, MOCK_TASKS, MOCK_FEEDBACK, MOCK_PANEL_NOTIFICATIONS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import usePersistentState from './components/usePersistentState';
import { NotificationProvider, useNotification } from './components/NotificationSystem';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ProjectManagementView from './components/ProjectManagementView';
import TeamView from './components/TeamView';
import ClientProjectsOverview from './components/ClientProjectsOverview';
import ProjectDetailsView from './components/ProjectDetailsView';
import ClientProjectView from './components/ClientProjectView';
import ProjectChatView from './components/ProjectChatView';
import InboxView from './components/InboxView';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import EmployeeProjectView from './components/EmployeeProjectView';
import ReportsView from './components/ReportsView';
import BillingView from './components/BillingView';
import FilesView from './components/FilesView';
import ActivityLogView from './components/ActivityLogView';
import AiInsightsView from './components/AiInsightsView';
import SettingsView from './components/SettingsView';
import EmployeeTasksView from './components/EmployeeTasksView';
import EmployeeCalendarView from './components/EmployeeCalendarView';
import EmployeeTimeTrackingView from './components/EmployeeTimeTrackingView';
import EmployeeFilesView from './components/EmployeeFilesView';
import EmployeePerformanceView from './components/EmployeePerformanceView';
import ClientDeliverablesView from './components/ClientDeliverablesView';
import ClientBillingView from './components/ClientBillingView';
import ClientFeedbackView from './components/ClientFeedbackView';

const ViewPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-6 md:p-8 flex items-center justify-center h-full">
        <div className="text-center">
            <h2 className="font-display text-4xl tracking-wide text-white">{title}</h2>
            <p className="text-slate-400 mt-2">Le contenu de cette page est en cours de construction.</p>
        </div>
    </div>
);


const AppContent: React.FC = () => {
    const { addNotification } = useNotification();
    
    const [users, setUsers] = usePersistentState<User[]>('telya-users', MOCK_USERS);
    const [projects, setProjects] = usePersistentState<Project[]>('telya-projects', MOCK_PROJECTS);
    const [clients, setClients] = usePersistentState<Client[]>('telya-clients', MOCK_CLIENTS);
    const [activityLog, setActivityLog] = usePersistentState<ActivityLog[]>('telya-activity-log', MOCK_ACTIVITY_LOG);
    const [timeLogs, setTimeLogs] = usePersistentState<TimeLog[]>('telya-time-logs', MOCK_TIME_LOGS);
    const [chatMessages, setChatMessages] = usePersistentState<ChatMessage[]>('telya-chat-messages', MOCK_CHAT_MESSAGES);
    const [activeTimer, setActiveTimer] = usePersistentState<ActiveTimer | null>('telya-active-timer', null);
    const [invoices, setInvoices] = usePersistentState<Invoice[]>('telya-invoices', MOCK_INVOICES);
    const [files, setFiles] = usePersistentState<ProjectFile[]>('telya-files', MOCK_FILES);
    const [tasks, setTasks] = usePersistentState<Task[]>('telya-tasks', MOCK_TASKS);
    const [feedback, setFeedback] = usePersistentState<Feedback[]>('telya-feedback', MOCK_FEEDBACK);
    const [panelNotifications, setPanelNotifications] = usePersistentState<PanelNotification[]>('telya-panel-notifications', MOCK_PANEL_NOTIFICATIONS);


    const [currentUser, setCurrentUser] = usePersistentState<User | null>('telya-currentUser', null);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
    
    // States for detailed views
    const [detailedProject, setDetailedProject] = useState<Project | null>(null);
    const [detailedClient, setDetailedClient] = useState<Client | null>(null);
    const [chatProject, setChatProject] = useState<Project | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [previousView, setPreviousView] = useState<View>('dashboard');
    
    useEffect(() => {
        document.documentElement.classList.add('dark');
        if (currentUser && !detailedProject && !detailedClient && !chatProject) {
            const defaultView: View = currentUser.role === UserRole.CLIENT ? 'client-dashboard' 
                : currentUser.role === UserRole.ADMIN ? 'dashboard'
                : 'my-projects';
            setActiveView(defaultView);
        }
    }, [currentUser]);
    
    // Handlers for navigation and state changes
    const navigateTo = (view: View) => {
        setDetailedProject(null);
        setDetailedClient(null);
        setChatProject(null);
        setActiveView(view);
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setActiveTimer(null); // Stop timer on logout
    };
    
    const addLogEntry = (userId: string, action: string, details?: string) => {
        const newLog: ActivityLog = {
            id: `al-${Date.now()}`,
            userId,
            action,
            details,
            timestamp: new Date(),
        };
        setActivityLog(prev => [newLog, ...prev]);
    };

    // Data Manipulation Handlers
    const handleAddProject = (projectData: Omit<Project, 'id'>) => {
        const newProject: Project = { ...projectData, id: `proj-${Date.now()}` };
        setProjects(prev => [...prev, newProject]);
        if(currentUser) addLogEntry(currentUser.id, "a créé le projet", newProject.name);
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Projet Ajouté', message: `Le projet "${newProject.name}" a été créé avec succès.`});
    };
    const handleUpdateProject = (updatedProject: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        if(currentUser) addLogEntry(currentUser.id, "a mis à jour le projet", updatedProject.name);
        addNotification({type: ToastNotificationType.INFO, title: 'Projet Mis à Jour', message: `Le projet "${updatedProject.name}" a été mis à jour.`});
    };
    const handleDeleteProject = (id: string) => {
        const projectToDelete = projects.find(p => p.id === id);
        setProjects(prev => prev.filter(p => p.id !== id));
        if(currentUser && projectToDelete) addLogEntry(currentUser.id, "a supprimé le projet", projectToDelete.name);
        addNotification({type: ToastNotificationType.ERROR, title: 'Projet Supprimé', message: `Le projet "${projectToDelete?.name}" a été supprimé.`});
    };

    const handleAddUser = (userData: Omit<User, 'id' | 'role' | 'avatar'>) => {
        const newUser: User = { ...userData, id: `user-emp-${Date.now()}`, role: UserRole.EMPLOYEE, avatar: `https://i.pravatar.cc/150?u=user-emp-${Date.now()}` };
        setUsers(prev => [...prev, newUser]);
        if(currentUser) addLogEntry(currentUser.id, "a ajouté l'employé", newUser.name);
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Employé Ajouté', message: `${newUser.name} a été ajouté à l'équipe.`});
    };
    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if(currentUser && currentUser.id === updatedUser.id) setCurrentUser(updatedUser);
        if(currentUser) addLogEntry(currentUser.id, "a mis à jour l'employé", updatedUser.name);
        addNotification({type: ToastNotificationType.INFO, title: 'Profil Mis à Jour', message: `Le profil de ${updatedUser.name} a été mis à jour.`});
    };
    const handleDeleteUser = (id: string) => {
        const userToDelete = users.find(u => u.id === id);
        setUsers(prev => prev.filter(u => u.id !== id));
        if(currentUser && userToDelete) addLogEntry(currentUser.id, "a supprimé l'employé", userToDelete.name);
        addNotification({type: ToastNotificationType.ERROR, title: 'Employé Supprimé', message: `${userToDelete?.name} a été supprimé.`});
    };

    const handleAddClient = (clientData: Omit<Client, 'id' | 'logo'>) => {
        const newClient: Client = { ...clientData, id: `client-${Date.now()}`, logo: `https://logo.clearbit.com/${clientData.companyName.toLowerCase().replace(/\s/g, '')}.com` };
        setClients(prev => [...prev, newClient]);
        if(currentUser) addLogEntry(currentUser.id, "a ajouté le client", newClient.companyName);
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Client Ajouté', message: `Le client ${newClient.companyName} a été ajouté.`});
    };
    const handleUpdateClient = (updatedClient: Client) => {
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
        if(currentUser) addLogEntry(currentUser.id, "a mis à jour le client", updatedClient.companyName);
        addNotification({type: ToastNotificationType.INFO, title: 'Client Mis à Jour', message: `Les informations pour ${updatedClient.companyName} ont été mises à jour.`});
    };
    const handleDeleteClient = (id: string) => {
        const clientToDelete = clients.find(c => c.id === id);
        setClients(prev => prev.filter(c => c.id !== id));
        if(currentUser && clientToDelete) addLogEntry(currentUser.id, "a supprimé le client", clientToDelete.companyName);
        addNotification({type: ToastNotificationType.ERROR, title: 'Client Supprimé', message: `${clientToDelete?.companyName} a été supprimé.`});
    };
    
    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        addNotification({type: ToastNotificationType.INFO, title: 'Tâche mise à jour', message: `Le statut de la tâche "${updatedTask.title}" est maintenant "${updatedTask.status}".`});
    }

    const handleAddFeedback = (feedbackData: Omit<Feedback, 'id' | 'timestamp'>) => {
        const newFeedback: Feedback = { ...feedbackData, id: `fb-${Date.now()}`, timestamp: new Date() };
        setFeedback(prev => [newFeedback, ...prev]);
        if(currentUser) addLogEntry(currentUser.id, "a soumis un feedback pour", projects.find(p => p.id === newFeedback.projectId)?.name);
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Feedback Envoyé', message: `Merci pour vos commentaires !`});
    };

    const handleAddInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
        const newInvoice: Invoice = { ...invoiceData, id: `inv-${Date.now()}` };
        setInvoices(prev => [newInvoice, ...prev]);
        if(currentUser) addLogEntry(currentUser.id, "a créé la facture", newInvoice.id.toUpperCase());
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Facture Créée', message: `La facture "${newInvoice.id.toUpperCase()}" a été créée.`});
    };
    
    const handleUpdateInvoice = (updatedInvoice: Invoice) => {
        setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? updatedInvoice : i));
        if(currentUser) addLogEntry(currentUser.id, "a mis à jour la facture", updatedInvoice.id.toUpperCase());
        addNotification({type: ToastNotificationType.INFO, title: 'Facture Mise à Jour', message: `La facture "${updatedInvoice.id.toUpperCase()}" a été mise à jour.`});
    };
    
    const handleAddFile = (fileData: Omit<ProjectFile, 'id' | 'uploadedBy' | 'lastModified'>) => {
        if (!currentUser) return;
        const newFile: ProjectFile = {
            ...fileData,
            id: `file-${Date.now()}`,
            uploadedBy: currentUser.id,
            lastModified: new Date(),
        };
        setFiles(prev => [newFile, ...prev]);
        const projectName = projects.find(p => p.id === newFile.projectId)?.name;
        addLogEntry(currentUser.id, "a téléversé le fichier", `${newFile.name} dans ${projectName}`);
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Fichier Téléversé', message: `Le fichier "${newFile.name}" a été ajouté.` });
    };

    const handleSendMessage = (projectId: string, text: string) => {
        if (!currentUser) return;
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            projectId,
            senderId: currentUser.id,
            text,
            timestamp: new Date(),
            readBy: [currentUser.id]
        };
        setChatMessages(prev => [...prev, newMessage]);
        addLogEntry(currentUser.id, "a envoyé un message dans", projects.find(p=>p.id === projectId)?.name || 'un projet');
    };

    const handleMarkConversationAsRead = (projectId: string) => {
        if (!currentUser) return;
        setChatMessages(prev => prev.map(msg => 
            (msg.projectId === projectId && !msg.readBy.includes(currentUser.id))
            ? { ...msg, readBy: [...msg.readBy, currentUser.id] }
            : msg
        ));
    };

    const handleStartTimer = (projectId: string) => {
        if (activeTimer) {
             addNotification({type: ToastNotificationType.ERROR, title: 'Minuteur Actif', message: `Veuillez arrêter le minuteur en cours avant d'en démarrer un nouveau.`});
            return;
        }
        if (!currentUser) return;
        setActiveTimer({ projectId, employeeId: currentUser.id, startTime: Date.now() });
        addNotification({type: ToastNotificationType.INFO, title: 'Minuteur Démarré', message: `Le suivi du temps a commencé pour le projet.`});
    };

    const handleStopTimerAndLog = (logData: Omit<TimeLog, 'id' | 'employeeId'>) => {
        if (!currentUser || !activeTimer) return;
        const newLog: TimeLog = { ...logData, id: `tl-${Date.now()}`, employeeId: currentUser.id };
        setTimeLogs(prev => [newLog, ...prev]);
        setActiveTimer(null);
        addLogEntry(currentUser.id, `a enregistré ${logData.hours.toFixed(1)}h sur`, projects.find(p=>p.id === logData.projectId)?.name || 'un projet');
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Temps Enregistré', message: `${logData.hours.toFixed(1)} heures ont été enregistrées avec succès.`});
    };
    
    const handleToggleNotificationsPanel = () => {
        setIsNotificationsPanelOpen(prev => !prev);
    };

    const handleMarkAllNotificationsAsRead = () => {
        setPanelNotifications(prev => prev.map(n => ({ ...n, read: true })));
        addNotification({ type: ToastNotificationType.INFO, title: 'Notifications lues', message: 'Toutes les notifications ont été marquées comme lues.' });
    };

    const handleNotificationClick = (notification: PanelNotification) => {
        setPanelNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        const project = projects.find(p => p.id === notification.projectId);
        if (project) {
            if (notification.type === 'new-message') {
                handleViewChat(project);
            } else {
                handleViewProjectDetails(project);
            }
        }
    };
    
    const handleManualRefresh = () => {
        addNotification({ type: ToastNotificationType.INFO, title: 'Données rafraîchies', message: 'Les données du projet ont été mises à jour.' });
    };

    // View Navigation Handlers
    const handleViewProjectDetails = (project: Project) => {
        setPreviousView(activeView);
        setDetailedProject(project);
    };
    const handleViewClientProjects = (client: Client) => {
        setPreviousView(activeView);
        setDetailedClient(client);
    };
    const handleViewChat = (project: Project) => {
        setPreviousView(activeView);
        setChatProject(project);
    };
    const handleBack = () => {
        setDetailedProject(null);
        setDetailedClient(null);
        setChatProject(null);
        setActiveView(previousView);
    };
    
    useEffect(() => {
        if(activeView === 'profile' || activeView === 'client-profile') {
            setIsProfileModalOpen(true);
            setActiveView(previousView); // Revert to previous view so modal can close nicely
        }
    }, [activeView]);

    const getPageTitle = (view: View): string => {
        if(detailedProject) return "Détails du Projet";
        if(detailedClient) return "Projets du Client";
        if(chatProject) return "Discussion de Projet";
        const viewTitles: Record<View, string> = {
            'dashboard': 'Tableau de bord',
            'projects': 'Projets & Tâches',
            'team': 'Équipe & Rôles',
            'messages': 'Messages',
            'reports': 'Rapports & Performance',
            'billing': 'Facturation',
            'ai-insights': 'Insights IA',
            'files': 'Fichiers',
            'settings': 'Paramètres',
            'activity-log': "Journal d'activité",
            'my-projects': 'Mes Projets',
            'my-tasks': 'Mes Tâches',
            'calendar': 'Planning',
            'time-tracking': 'Suivi du Temps',
            'project-files': 'Fichiers de Projet',
            'my-performance': 'Ma Performance',
            'profile': 'Profil',
            'client-dashboard': 'Tableau de bord Client',
            'client-projects': 'Mes Projets',
            'support': 'Support & Messages',
            'deliverables': 'Livrables',
            'client-billing': 'Facturation',
            'feedback': 'Feedback',
            'client-profile': 'Mon Profil',
            'login': 'Connexion',
        };
        return viewTitles[view] || "Telya";
    };
    
    const currentViewKey = detailedProject?.id || detailedClient?.id || chatProject?.id || activeView;


    const renderMainContent = () => {
        if (!currentUser) return null;

        // Detailed views take priority
        if (detailedProject) {
            const client = clients.find(c => c.id === detailedProject.clientId);
            const team = users.filter(u => detailedProject.assignedEmployeeIds.includes(u.id));
            if (!client) return <div>Erreur: Client introuvable</div>;
            return <ProjectDetailsView 
                project={detailedProject} 
                client={client} 
                team={team} 
                timeLogs={timeLogs}
                files={files.filter(f => f.projectId === detailedProject.id)}
                currentUser={currentUser}
                users={users}
                onBack={handleBack} 
                onViewChat={handleViewChat}
                activeTimer={activeTimer}
                onStartTimer={handleStartTimer}
                onStopTimerAndLog={handleStopTimerAndLog}
                onAddFile={handleAddFile}
            />;
        }
        if (detailedClient) {
            return <ClientProjectsOverview client={detailedClient} projects={projects} users={users} onBack={handleBack} />;
        }
        if(chatProject) {
            const client = clients.find(c => c.id === chatProject.clientId);
            return <ProjectChatView 
                project={chatProject}
                messages={chatMessages.filter(m => m.projectId === chatProject.id)}
                currentUser={currentUser}
                users={users}
                client={client}
                onSendMessage={(text) => handleSendMessage(chatProject.id, text)}
                onBack={handleBack}
            />
        }

        // Role-based views
        const clientProfile = clients.find(c=>c.contactEmail === currentUser.email);

        switch (currentUser.role) {
            case UserRole.ADMIN:
                switch (activeView) {
                    case 'dashboard': return <AdminDashboard currentUser={currentUser} users={users} projects={projects} activityLog={activityLog} invoices={invoices} onUpdateInvoice={handleUpdateInvoice} onViewProjectDetails={handleViewProjectDetails} />;
                    case 'projects': return <ProjectManagementView projects={projects} users={users} clients={clients} currentUser={currentUser} timeLogs={timeLogs} onAdd={handleAddProject} onUpdate={handleUpdateProject} onDelete={handleDeleteProject} onViewDetails={handleViewProjectDetails} onManualRefresh={handleManualRefresh} />;
                    case 'team': return <TeamView users={users} clients={clients} currentUser={currentUser} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} onViewClientProjects={handleViewClientProjects}/>;
                    case 'messages': return <InboxView currentUser={currentUser} projects={projects} clients={clients} users={users} chatMessages={chatMessages} onSendMessage={handleSendMessage} onConversationSelect={handleMarkConversationAsRead}/>;
                    case 'reports': return <ReportsView projects={projects} timeLogs={timeLogs} users={users} clients={clients} />;
                    case 'billing': return <BillingView invoices={invoices} clients={clients} currentUser={currentUser} onAddInvoice={handleAddInvoice} projects={projects} />;
                    case 'ai-insights': return <AiInsightsView />;
                    case 'files': return <FilesView files={files} projects={projects} users={users} />;
                    case 'settings': return <SettingsView onLogout={handleLogout} />;
                    case 'activity-log': return <ActivityLogView activityLog={activityLog} users={users} />;
                    default: return <ViewPlaceholder title={getPageTitle(activeView)} />;
                }
            case UserRole.EMPLOYEE:
                 switch (activeView) {
                    case 'my-projects': return <EmployeeProjectView currentUser={currentUser} projects={projects} clients={clients} users={users} timeLogs={timeLogs} onViewDetails={handleViewProjectDetails} />;
                    case 'my-tasks': return <EmployeeTasksView currentUser={currentUser} tasks={tasks} projects={projects} onUpdateTask={handleUpdateTask} />;
                    case 'calendar': return <EmployeeCalendarView currentUser={currentUser} projects={projects} />;
                    case 'messages': return <InboxView currentUser={currentUser} projects={projects} clients={clients} users={users} chatMessages={chatMessages} onSendMessage={handleSendMessage} onConversationSelect={handleMarkConversationAsRead}/>;
                    case 'time-tracking': return <EmployeeTimeTrackingView currentUser={currentUser} timeLogs={timeLogs} projects={projects} />;
                    case 'project-files': return <EmployeeFilesView currentUser={currentUser} files={files} projects={projects} onAddFile={handleAddFile} />;
                    case 'my-performance': return <EmployeePerformanceView currentUser={currentUser} timeLogs={timeLogs} projects={projects} tasks={tasks} />;
                    default: return <ViewPlaceholder title={getPageTitle(activeView)} />;
                }
            case UserRole.CLIENT:
                switch (activeView) {
                    case 'client-dashboard': return <Dashboard currentUser={currentUser} />;
                    case 'client-projects': return <ClientProjectView currentUser={currentUser} projects={projects} clients={clients} users={users} onViewChat={handleViewChat} />;
                    case 'support': return <InboxView currentUser={currentUser} projects={projects.filter(p => clientProfile && p.clientId === clientProfile.id)} clients={clients} users={users} chatMessages={chatMessages} onSendMessage={handleSendMessage} onConversationSelect={handleMarkConversationAsRead}/>;
                    case 'deliverables': return <ClientDeliverablesView currentUser={currentUser} files={files} projects={projects} clients={clients} />;
                    case 'client-billing': return <ClientBillingView currentUser={currentUser} invoices={invoices} clients={clients} />;
                    case 'feedback': return <ClientFeedbackView currentUser={currentUser} feedback={feedback} projects={projects} clients={clients} onAddFeedback={handleAddFeedback} />;
                    default: return <ViewPlaceholder title={getPageTitle(activeView)} />;
                }
            default:
                return <Dashboard currentUser={currentUser} />;
        }
    };


    if (!currentUser) {
        return <LoginScreen users={users} onLogin={handleLogin} />;
    }

    return (
        <div className="relative min-h-screen aurora-bg">
            <div className="flex h-screen w-full relative z-10">
                <Sidebar 
                    currentUser={currentUser} 
                    activeView={activeView} 
                    setActiveView={navigateTo} 
                    isOpenOnMobile={isMobileNavOpen}
                    onCloseMobile={() => setIsMobileNavOpen(false)}
                    onLogout={handleLogout}
                    projects={projects}
                    clients={clients}
                    chatMessages={chatMessages}
                    invoices={invoices}
                    tasks={tasks}
                />
                <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-hidden h-full">
                    <Header 
                        title={getPageTitle(activeView)}
                        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        currentUser={currentUser}
                        onToggleNotificationsPanel={handleToggleNotificationsPanel}
                        isNotificationsPanelOpen={isNotificationsPanelOpen}
                        notifications={panelNotifications.filter(n => n.userId === currentUser.id || currentUser.role === UserRole.ADMIN)}
                        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                        onNotificationClick={handleNotificationClick}
                    />
                    <main className="flex-1 rounded-2xl md:rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-[var(--border-color)] overflow-y-auto">
                        <div key={currentViewKey} className="animate-fadeInUp">
                           {renderMainContent()}
                        </div>
                    </main>
                </div>
            </div>
            {isMobileNavOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileNavOpen(false)}
                ></div>
            )}
            <ProfileSettingsModal 
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                currentUser={currentUser}
                onSave={(data) => {
                    handleUpdateUser({ ...currentUser, ...data });
                    setIsProfileModalOpen(false);
                }}
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