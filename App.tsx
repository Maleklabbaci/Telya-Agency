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
import { supabase, isSupabaseConfigured } from './supabaseClient';

const ViewPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-6 md:p-8 flex items-center justify-center h-full">
        <div className="text-center">
            <h2 className="font-display text-4xl tracking-wide text-white">{title}</h2>
            <p className="text-slate-400 mt-2">Le contenu de cette page est en cours de construction.</p>
        </div>
    </div>
);

const SupabaseConfigNotice: React.FC = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 aurora-bg text-center">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-red-500/50 p-8 max-w-2xl">
          <h1 className="font-display text-3xl text-red-400 mb-4">Configuration Supabase Requise</h1>
          <p className="text-slate-300 mb-6">
              L'application ne peut pas démarrer car les informations de connexion à Supabase ne sont pas valides.
              Veuillez mettre à jour votre URL de projet et votre clé "anon" dans le fichier suivant :
          </p>
          <pre className="bg-slate-950 p-4 rounded-lg text-left text-sm text-slate-400 overflow-x-auto">
              <code>
                  <span className="text-gray-500">// supabaseClient.ts</span><br/><br/>
                  const supabaseUrl = '<span className="text-yellow-400">VOTRE_URL_SUPABASE</span>';<br/>
                  const supabaseAnonKey = '<span className="text-yellow-400">VOTRE_CLE_ANON_SUPABASE</span>';
              </code>
          </pre>
          <p className="text-slate-400 mt-6 text-sm">
              Vous trouverez ces informations dans les paramètres de votre projet Supabase sous "API".
          </p>
      </div>
  </div>
);


const AppContent: React.FC = () => {
    const { addNotification } = useNotification();
    
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [panelNotifications, setPanelNotifications] = useState<PanelNotification[]>([]);
    
    const [activeTimer, setActiveTimer] = usePersistentState<ActiveTimer | null>('telya-active-timer', null);
    const [currentUser, setCurrentUser] = usePersistentState<User | null>('telya-currentUser', null);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
    
    const [detailedProject, setDetailedProject] = useState<Project | null>(null);
    const [detailedClient, setDetailedClient] = useState<Client | null>(null);
    const [chatProject, setChatProject] = useState<Project | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [previousView, setPreviousView] = useState<View>('dashboard');
    
    useEffect(() => {
        async function fetchData() {
            if (!supabase) return;
            setIsLoading(true);
            try {
                const [
                    usersRes, projectsRes, clientsRes, activityLogRes, timeLogsRes,
                    chatMessagesRes, invoicesRes, filesRes, tasksRes, feedbackRes, panelNotificationsRes
                ] = await Promise.all([
                    supabase.from('users').select('*'),
                    supabase.from('projects').select('*'),
                    supabase.from('clients').select('*'),
                    supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }),
                    supabase.from('time_logs').select('*'),
                    supabase.from('chat_messages').select('*').order('timestamp', { ascending: true }),
                    supabase.from('invoices').select('*'),
                    supabase.from('project_files').select('*'),
                    supabase.from('tasks').select('*'),
                    supabase.from('feedback').select('*'),
                    supabase.from('panel_notifications').select('*').order('timestamp', { ascending: false }),
                ]);

                if (usersRes.data) setUsers(usersRes.data);
                if (projectsRes.data) setProjects(projectsRes.data);
                if (clientsRes.data) setClients(clientsRes.data);
                if (activityLogRes.data) setActivityLog(activityLogRes.data as any);
                if (timeLogsRes.data) setTimeLogs(timeLogsRes.data);
                if (chatMessagesRes.data) setChatMessages(chatMessagesRes.data as any);
                if (invoicesRes.data) setInvoices(invoicesRes.data);
                if (filesRes.data) setFiles(filesRes.data as any);
                if (tasksRes.data) setTasks(tasksRes.data);
                if (feedbackRes.data) setFeedback(feedbackRes.data as any);
                if (panelNotificationsRes.data) setPanelNotifications(panelNotificationsRes.data as any);

            } catch (error) {
                console.error("Error fetching data:", error);
                addNotification({type: ToastNotificationType.ERROR, title: 'Erreur de chargement', message: 'Impossible de récupérer les données depuis la base de données.'});
            } finally {
                setIsLoading(false);
            }
        }
        if (isSupabaseConfigured) {
          fetchData();
        } else {
            setIsLoading(false);
        }
    }, []);

    // Real-time chat subscription
    useEffect(() => {
        if (!supabase) return;
        const channel = supabase.channel('chat-messages-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
                setChatMessages(prev => [...prev, payload.new as any]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

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
            document.body.style.overflow = '';
        };
    }, [isMobileNavOpen]);
    
    const addLogEntry = async (userId: string, action: string, details?: string) => {
        if (!supabase) return;
        const newLog = { user_id: userId, action, details, timestamp: new Date().toISOString() };
        const { data, error } = await supabase.from('activity_logs').insert(newLog).select();
        if (data) {
           setActivityLog(prev => [data[0] as any, ...prev]);
        }
    };
    
    const addPanelNotifications = (notificationData: Omit<PanelNotification, 'id' | 'timestamp' | 'read' | 'userId'> & { userIds: string[] }) => {
        // This remains client-side for now as it's complex to manage server-side
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
    const handleAddProject = async (projectData: Omit<Project, 'id'>) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('projects').insert(projectData).select();
        if (data) {
            setProjects(prev => [...prev, data[0]]);
            if(currentUser) addLogEntry(currentUser.id, "a créé le projet", data[0].name);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Projet Ajouté', message: `Le projet "${data[0].name}" a été créé.`});
        }
    };
    const handleUpdateProject = async (updatedProject: Project) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('projects').update(updatedProject).eq('id', updatedProject.id).select();
        if (data) {
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? data[0] : p));
            if(currentUser) addLogEntry(currentUser.id, "a mis à jour le projet", updatedProject.name);
            addNotification({type: ToastNotificationType.INFO, title: 'Projet Mis à Jour', message: `Le projet "${updatedProject.name}" a été mis à jour.`});
        }
    };
    const handleDeleteProject = async (id: string) => {
        if (!supabase) return;
        const projectToDelete = projects.find(p => p.id === id);
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            setProjects(prev => prev.filter(p => p.id !== id));
            if(currentUser && projectToDelete) addLogEntry(currentUser.id, "a supprimé le projet", projectToDelete.name);
            addNotification({type: ToastNotificationType.ERROR, title: 'Projet Supprimé', message: `Le projet "${projectToDelete?.name}" a été supprimé.`});
        }
    };

    const handleAddUser = async (userData: Omit<User, 'id' | 'avatar' | 'activityStatus'>) => {
        if (!supabase) return;
        const newUser = {
            ...userData,
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
            activityStatus: 'offline' as 'offline',
        };
        const { data, error } = await supabase.from('users').insert(newUser).select();
        if (data) {
            setUsers(prev => [...prev, data[0]]);
            if(currentUser) addLogEntry(currentUser.id, `a ajouté un ${userData.role === UserRole.ADMIN ? 'administrateur' : 'employé'}`, data[0].name);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Utilisateur ajouté', message: `L'utilisateur ${data[0].name} a été ajouté.`});
        } else {
            console.error("Error adding user:", error);
            addNotification({type: ToastNotificationType.ERROR, title: 'Erreur', message: 'Impossible d\'ajouter l\'utilisateur.'});
        }
    };

    const handleUpdateUser = async (updatedUser: User) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id).select();
        if (data) {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? data[0] : u));
            if(currentUser && currentUser.id === updatedUser.id) setCurrentUser(data[0]);
            addLogEntry(currentUser!.id, "a mis à jour son profil", updatedUser.name);
            addNotification({type: ToastNotificationType.INFO, title: 'Profil Mis à Jour', message: 'Votre profil a été mis à jour.'});
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!supabase) return;
        const userToDelete = users.find(u => u.id === id);
        if (!userToDelete) return;

        if (userToDelete.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
            addNotification({type: ToastNotificationType.ERROR, title: 'Action impossible', message: 'Vous ne pouvez pas supprimer le dernier administrateur.'});
            return;
        }

        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) {
            setUsers(prev => prev.filter(u => u.id !== id));
            if(currentUser) addLogEntry(currentUser.id, `a supprimé l'utilisateur`, userToDelete.name);
            addNotification({type: ToastNotificationType.ERROR, title: 'Utilisateur Supprimé', message: `L'utilisateur "${userToDelete.name}" a été supprimé.`});
        } else {
            console.error("Error deleting user:", error);
            addNotification({type: ToastNotificationType.ERROR, title: 'Erreur', message: 'Impossible de supprimer l\'utilisateur.'});
        }
    };

    const handleAddClient = async (clientData: Omit<Client, 'id' | 'logo'>) => {
        if (!supabase) return;
        const newClientData = { ...clientData, logo: `https://logo.clearbit.com/${clientData.companyName.toLowerCase().replace(/\s/g, '')}.com` };
        const { data, error } = await supabase.from('clients').insert(newClientData).select();
        if (data) {
            setClients(prev => [...prev, data[0]]);
            if(currentUser) addLogEntry(currentUser.id, "a ajouté le client", data[0].companyName);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Client Ajouté', message: `Le client ${data[0].companyName} a été ajouté.`});
        }
    };
    const handleUpdateClient = async (updatedClient: Client) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('clients').update(updatedClient).eq('id', updatedClient.id).select();
         if (data) {
            setClients(prev => prev.map(c => c.id === updatedClient.id ? data[0] : c));
            if(currentUser) addLogEntry(currentUser.id, "a mis à jour le client", updatedClient.companyName);
            addNotification({type: ToastNotificationType.INFO, title: 'Client Mis à Jour', message: `Les informations pour ${updatedClient.companyName} ont été mises à jour.`});
        }
    };
    const handleDeleteClient = async (id: string) => {
        if (!supabase) return;
        const clientToDelete = clients.find(c => c.id === id);
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (!error) {
            setClients(prev => prev.filter(c => c.id !== id));
            if(currentUser && clientToDelete) addLogEntry(currentUser.id, "a supprimé le client", clientToDelete.companyName);
            addNotification({type: ToastNotificationType.ERROR, title: 'Client Supprimé', message: `${clientToDelete?.companyName} a été supprimé.`});
        }
    };
    
    const handleAddTask = async (taskData: Omit<Task, 'id'>) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('tasks').insert(taskData).select();
        if (data) {
            setTasks(prev => [...prev, data[0]]);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Tâche Ajoutée', message: `La tâche "${data[0].title}" a été créée.`});
        }
    };
    const handleUpdateTask = async (updatedTask: Task) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('tasks').update(updatedTask).eq('id', updatedTask.id).select();
        if (data) {
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? data[0] : t));
            addNotification({type: ToastNotificationType.INFO, title: 'Tâche mise à jour', message: `Le statut de la tâche "${updatedTask.title}" a été mis à jour.`});
        }
    };
     const handleDeleteTask = async (id: string) => {
        if (!supabase) return;
        const taskToDelete = tasks.find(t => t.id === id);
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if(!error) {
            setTasks(prev => prev.filter(t => t.id !== id));
            addNotification({type: ToastNotificationType.ERROR, title: 'Tâche Supprimée', message: `La tâche "${taskToDelete?.title}" a été supprimée.`});
        }
    };

    const handleAddFeedback = async (feedbackData: Omit<Feedback, 'id' | 'timestamp'>) => {
        if (!supabase) return;
        const newFeedbackData = {...feedbackData, timestamp: new Date().toISOString()};
        const { data, error } = await supabase.from('feedback').insert(newFeedbackData).select();
        if (data) {
            setFeedback(prev => [data[0] as any, ...prev]);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Feedback Envoyé', message: `Merci pour vos commentaires !`});
        }
    };

    const handleAddInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('invoices').insert(invoiceData).select();
        if(data) {
            setInvoices(prev => [data[0], ...prev]);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Facture Créée', message: `La facture "${data[0].id.toUpperCase()}" a été créée.`});
        }
    };
    
    const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
        if (!supabase) return;
        const { data, error } = await supabase.from('invoices').update(updatedInvoice).eq('id', updatedInvoice.id).select();
        if (data) {
            setInvoices(prev => prev.map(i => i.id === updatedInvoice.id ? data[0] : i));
            addNotification({type: ToastNotificationType.INFO, title: 'Facture Mise à Jour', message: `La facture "${updatedInvoice.id.toUpperCase()}" a été mise à jour.`});
        }
    };
    
    const handleAddFile = (fileData: Omit<ProjectFile, 'id' | 'uploadedBy' | 'lastModified'>) => {
        // File uploads should be handled with Supabase Storage, which is more complex than this mock.
        console.log("Adding file (simulation):", fileData);
        addNotification({type: ToastNotificationType.INFO, title: 'Simulation', message: "L'upload de fichiers nécessite Supabase Storage."});
    };

    const handleSendMessage = async (projectId: string, text: string) => {
        if (!currentUser || !supabase) return;
        const newMessage = {
            project_id: projectId,
            sender_id: currentUser.id,
            text,
            timestamp: new Date().toISOString(),
            readBy: [currentUser.id]
        };
        const { error } = await supabase.from('chat_messages').insert(newMessage);
        if (error) {
            addNotification({type: ToastNotificationType.ERROR, title: 'Erreur', message: "Le message n'a pas pu être envoyé."});
        }
        // No setState needed, real-time subscription will handle it.
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

    const handleStopTimerAndLog = async (logData: Omit<TimeLog, 'id' | 'employeeId'>) => {
        if (!currentUser || !activeTimer || !supabase) return;
        const newLogData = { ...logData, employee_id: currentUser.id };
        const { data, error } = await supabase.from('time_logs').insert(newLogData).select();

        if (data) {
            setTimeLogs(prev => [data[0], ...prev]);
            setActiveTimer(null);
            addLogEntry(currentUser.id, `a enregistré ${logData.hours.toFixed(1)}h sur`, projects.find(p=>p.id === logData.projectId)?.name || 'un projet');
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Temps Enregistré', message: `${logData.hours.toFixed(1)} heures ont été enregistrées.`});
        }
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
        setActiveTimer(null);
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
            setActiveView(previousView);
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
        if (isLoading) {
             return <div className="flex items-center justify-center h-full text-slate-400">Chargement des données...</div>;
        }
        if (!currentUser) return null;

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

    if (!isSupabaseConfigured) {
        return <SupabaseConfigNotice />;
    }

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