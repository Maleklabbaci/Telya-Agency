import React, { useState, useEffect } from 'react';
import { User, UserRole, View, Project, Client, ActivityLog, TimeLog, ChatMessage, ActiveTimer, ToastNotificationType, Invoice, ProjectFile, Task, Feedback, PanelNotification, ProjectStatus } from './types';
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
import ProjectDetails from './components/ProjectDetails';
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

    useEffect(() => {
        if (isMobileNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = ''; // Cleanup on component unmount
        };
    }, [isMobileNavOpen]);
    
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
    
    const addPanelNotifications = (notificationData: Omit<PanelNotification, 'id' | 'timestamp' | 'read' | 'userId'> & { userIds: string[] }) => {
        const { userIds, ...rest } = notificationData;
        const newNotifications: PanelNotification[] = userIds.map(userId => ({
            ...rest,
            id: `notif-${Date.now()}-${Math.random()}`,
            userId,
            timestamp: new Date(),
            read: false,
        }));
        setPanelNotifications(prev => [...newNotifications, ...prev]);
    };

    // Data Manipulation Handlers
    const handleAddProject = (projectData: Omit<Project, 'id'>) => {
        const newProject: Project = { ...projectData, id: `proj-${Date.now()}` };
        setProjects(prev => [...prev, newProject]);
        if(currentUser) addLogEntry(currentUser.id, "a créé le projet", newProject.name);
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Projet Ajouté', message: `Le projet "${newProject.name}" a été créé avec succès.`});
        const adminIds = users.filter(u => u.role === UserRole.ADMIN).map(u => u.id);
        addPanelNotifications({
            userIds: adminIds,
            projectId: newProject.id,
            type: 'project-status',
            title: 'Nouveau Projet Créé',
            description: `Le projet "${newProject.name}" vient d'être ajouté.`,
        });
    };
    const handleUpdateProject = (updatedProject: Project) => {
        const oldProject = projects.find(p => p.id === updatedProject.id);
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        if(currentUser) addLogEntry(currentUser.id, "a mis à jour le projet", updatedProject.name);
        addNotification({type: ToastNotificationType.INFO, title: 'Projet Mis à Jour', message: `Le projet "${updatedProject.name}" a été mis à jour.`});
        if (oldProject && oldProject.status !== updatedProject.status) {
              const clientUser = users.find(u => u.email === clients.find(c => c.id === updatedProject.clientId)?.contactEmail);
              const userIdsToNotify = [...updatedProject.assignedEmployeeIds];
              if (clientUser) userIdsToNotify.push(clientUser.id);
              
              addPanelNotifications({
                  userIds: userIdsToNotify,
                  projectId: updatedProject.id,
                  type: 'project-status',
                  title: 'Statut du Projet Mis à Jour',
                  description: `Le statut de "${updatedProject.name}" est : ${updatedProject.status}.`
              });
          }
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
    
    const handleAddTask = (taskData: Omit<Task, 'id'>) => {
        const newTask: Task = { ...taskData, id: `task-${Date.now()}` };
        setTasks(prev => [...prev, newTask]);
        if(currentUser) {
            const projectName = projects.find(p => p.id === newTask.projectId)?.name;
            addLogEntry(currentUser.id, "a créé la tâche", `${newTask.title} dans ${projectName}`);
        }
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Tâche Ajoutée', message: `La tâche "${newTask.title}" a été créée.`});
        addPanelNotifications({
            userIds: [newTask.employeeId],
            projectId: newTask.projectId,
            type: 'new-task',
            title: 'Nouvelle Tâche Assignée',
            description: `On vous a assigné la tâche : "${newTask.title}".`
        });
    };
    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        addNotification({type: ToastNotificationType.INFO, title: 'Tâche mise à jour', message: `Le statut de la tâche "${updatedTask.title}" est maintenant "${updatedTask.status}".`});
    };
     const handleDeleteTask = (id: string) => {
        const taskToDelete = tasks.find(t => t.id === id);
        setTasks(prev => prev.filter(t => t.id !== id));
        if(currentUser && taskToDelete) {
            const projectName = projects.find(p => p.id === taskToDelete.projectId)?.name;
            addLogEntry(currentUser.id, "a supprimé la tâche", `${taskToDelete.title} de ${projectName}`);
        }
        addNotification({type: ToastNotificationType.ERROR, title: 'Tâche Supprimée', message: `La tâche "${taskToDelete?.title}" a été supprimée.`});
    };

    const handleAddFeedback = (feedbackData: Omit<Feedback, 'id' | 'timestamp'>) => {
        const newFeedback: Feedback = { ...feedbackData, id: `fb-${Date.now()}`, timestamp: new Date() };
        setFeedback(prev => [newFeedback, ...prev]);
        const client = clients.find(c => c.id === feedbackData.clientId);
        const project = projects.find(p => p.id === newFeedback.projectId)
        if(currentUser) addLogEntry(currentUser.id, "a soumis un feedback pour", project?.name);
        addNotification({type: ToastNotificationType.SUCCESS, title: 'Feedback Envoyé', message: `Merci pour vos commentaires !`});
        
        const adminIds = users.filter(u => u.role === UserRole.ADMIN).map(u => u.id);
        addPanelNotifications({
           userIds: adminIds,
           projectId: newFeedback.projectId,
           type: 'new-feedback',
           title: 'Nouveau Feedback Reçu',
           description: `Feedback de ${client?.companyName} pour ${project?.name}.`
       });
    };

    const handleAddInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
        const newInvoice: Invoice = { ...invoiceData, id: `inv-${String(Date.now()).slice(-4)}` };
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
        const project = projects.find(p => p.id === newFile.projectId);
        addLogEntry(currentUser.id, "a téléversé le fichier", `${newFile.name} dans ${project?.name}`);
        addNotification({ type: ToastNotificationType.SUCCESS, title: 'Fichier Téléversé', message: `Le fichier "${newFile.name}" a été ajouté.` });
        
        if (!project) return;
        const client = clients.find(c => c.id === project.clientId);
        const clientUser = client ? users.find(u => u.email === client.contactEmail) : null;
        let userIdsToNotify = [...project.assignedEmployeeIds];
        if(clientUser) userIdsToNotify.push(clientUser.id);
        userIdsToNotify = userIdsToNotify.filter(id => id !== currentUser.id);
        
        addPanelNotifications({
           userIds: userIdsToNotify,
           projectId: newFile.projectId,
           type: 'new-file',
           title: 'Nouveau Fichier Ajouté',
           description: `${currentUser.name} a ajouté "${newFile.name}" à ${project.name}.`
       });
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
        const project = projects.find(p=>p.id === projectId);
        addLogEntry(currentUser.id, "a envoyé un message dans", project?.name || 'un projet');

        if (!project) return;
        const client = clients.find(c => c.id === project.clientId);
        const clientUser = client ? users.find(u => u.email === client.contactEmail) : null;
        let userIdsToNotify = [...project.assignedEmployeeIds];
        if(clientUser) userIdsToNotify.push(clientUser.id);
        userIdsToNotify = userIdsToNotify.filter(id => id !== currentUser.id);

        addPanelNotifications({
            userIds: userIdsToNotify,
            projectId: projectId,
            type: 'new-message',
            title: `Nouveau message de ${currentUser.name}`,
            description: `"${text.substring(0, 50)}..."`
        });
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
    
    const handleToggleNotificationsPanel = () => {
        setIsNotificationsPanelOpen(prev => !prev);
    };

    const handleMarkAllNotificationsAsRead = () => {
        if (!currentUser) return;
        setPanelNotifications(prev => prev.map(n => (n.userId === currentUser.id ? { ...n, read: true } : n)));
        addNotification({ type: ToastNotificationType.INFO, title: 'Notifications lues', message: 'Toutes les notifications ont été marquées comme lues.' });
    };

    const handleNotificationClick = (notification: PanelNotification) => {
        setPanelNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        const project = projects.find(p => p.id === notification.projectId);
        if (project) {
            handleViewProjectDetails(project);
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
            'team': 'Équipe & Clients',
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

    const getViewBackgroundColorClass = (): string => {
        let currentViewTarget: View | 'details' | 'chat' | 'client-overview' = activeView;
        if (detailedProject) currentViewTarget = 'details';
        if (chatProject) currentViewTarget = 'chat';
        if (detailedClient) currentViewTarget = 'client-overview';

        const viewColorMap: Partial<Record<View | 'details' | 'chat' | 'client-overview', string>> = {
            'dashboard': 'bg-view-dashboard',
            'client-dashboard': 'bg-view-dashboard',
            
            'projects': 'bg-view-projects',
            'my-projects': 'bg-view-projects',
            'client-projects': 'bg-view-projects',
            'details': 'bg-view-projects',

            'team': 'bg-view-team',
            'client-overview': 'bg-view-team',

            'messages': 'bg-view-messages',
            'support': 'bg-view-messages',
            'chat': 'bg-view-messages',

            'reports': 'bg-view-reports',
            'my-performance': 'bg-view-reports',

            'billing': 'bg-view-billing',
            'client-billing': 'bg-view-billing',

            'ai-insights': 'bg-view-ai-insights',

            'files': 'bg-view-files',
            'project-files': 'bg-view-files',
            'deliverables': 'bg-view-deliverables',

            'settings': 'bg-view-settings',
            'activity-log': 'bg-view-activity-log',

            'my-tasks': 'bg-view-my-tasks',
            'calendar': 'bg-view-calendar',
            'time-tracking': 'bg-view-time-tracking',
            
            'feedback': 'bg-view-feedback',
        };

        return viewColorMap[currentViewTarget] || 'bg-view-default';
    }


    const renderMainContent = () => {
        if (!currentUser) return null;

        // Detailed views take priority
        if (detailedProject) {
            const client = clients.find(c => c.id === detailedProject.clientId);
            const team = users.filter(u => detailedProject.assignedEmployeeIds.includes(u.id));
            if (!client) return <div>Erreur: Client introuvable</div>;
            return <ProjectDetails 
                project={detailedProject} 
                client={client} 
                team={team} 
                tasks={tasks.filter(t => t.projectId === detailedProject.id)}
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
                onUpdateTask={handleUpdateTask}
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
                    case 'dashboard': return <AdminDashboard currentUser={currentUser} users={users} projects={projects} activityLog={activityLog} invoices={invoices} onUpdateInvoice={handleUpdateInvoice} onViewProjectDetails={handleViewProjectDetails} tasks={tasks} />;
                    case 'projects': return <ProjectManagementView projects={projects} users={users} clients={clients} currentUser={currentUser} timeLogs={timeLogs} onAdd={handleAddProject} onUpdate={handleUpdateProject} onDelete={handleDeleteProject} onViewDetails={handleViewProjectDetails} onManualRefresh={handleManualRefresh} tasks={tasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask}/>;
                    case 'team': return <TeamView
                        users={users}
                        clients={clients}
                        currentUser={currentUser}
                        onAddUser={handleAddUser}
                        onUpdateUser={handleUpdateUser}
                        onDeleteUser={handleDeleteUser}
                        onAddClient={handleAddClient}
                        onUpdateClient={handleUpdateClient}
                        onDeleteClient={handleDeleteClient}
                        onViewClientProjects={handleViewClientProjects}
                        tasks={tasks}
                        projects={projects}/>;
                    case 'messages': return <InboxView currentUser={currentUser} projects={projects} clients={clients} users={users} chatMessages={chatMessages} onSendMessage={handleSendMessage} onConversationSelect={handleMarkConversationAsRead}/>;
                    case 'reports': return <ReportsView projects={projects} timeLogs={timeLogs} users={users} clients={clients} />;
                    case 'billing': return <BillingView invoices={invoices} clients={clients} currentUser={currentUser} onAddInvoice={handleAddInvoice} projects={projects} onUpdateInvoice={handleUpdateInvoice} />;
                    case 'ai-insights': return <AiInsightsView 
                                                projects={projects}
                                                users={users}
                                                clients={clients}
                                                invoices={invoices}
                                                tasks={tasks}
                                                timeLogs={timeLogs}
                                            />;
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
                    case 'client-billing': return <ClientBillingView currentUser={currentUser} invoices={invoices} clients={clients} projects={projects} />;
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
                    files={files}
                    panelNotifications={panelNotifications.filter(n => n.userId === currentUser.id)}
                />
                <div className="flex-1 flex flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 overflow-hidden h-full">
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
                    <main className={`flex-1 rounded-2xl md:rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-[var(--border-color)] overflow-y-auto main-content-wrapper ${getViewBackgroundColorClass()}`}>
                        <div key={currentViewKey} className="animate-fadeInUp">
                           {renderMainContent()}
                        </div>
                    </main>
                </div>
            </div>
            {isMobileNavOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
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