





import React, { useState, useEffect, useCallback } from 'react';
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
import InvoiceForm from './components/forms/InvoiceForm';
import ProjectForm from './components/forms/ProjectForm';
import TaskForm from './components/forms/TaskForm';
import ConfirmationModal from './components/ConfirmationModal';
import UserForm from './components/forms/EmployeeForm';
import ClientForm from './components/forms/ClientForm';
import InvoiceDetailsModal from './components/InvoiceDetailsModal';
import EmployeeTasksModal from './components/EmployeeTasksModal';
import TimeLogForm from './components/forms/TimeLogForm';
import FileUploadModal from './components/forms/FileUploadModal';
import EmployeeFileUploadModal from './components/forms/EmployeeFileUploadModal';

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
    
    const [isLoading, setIsLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

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

    // --- Modal States ---
    const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
    const [teamItemToEdit, setTeamItemToEdit] = useState<User | Client | null>(null);
    const [teamFormType, setTeamFormType] = useState<'employee' | 'client' | 'admin' | null>(null);
    const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
    const [teamItemToDelete, setTeamItemToDelete] = useState<User | Client | null>(null);
    const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
    const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
    const [isInvoiceDetailsModalOpen, setIsInvoiceDetailsModalOpen] = useState(false);
    const [employeeForTasks, setEmployeeForTasks] = useState<User | null>(null);
    const [isEmployeeTasksModalOpen, setIsEmployeeTasksModalOpen] = useState(false);
    const [isTimeLogFormOpen, setIsTimeLogFormOpen] = useState(false);
    const [hoursForTimeLog, setHoursForTimeLog] = useState<number | undefined>(undefined);
    const [isProjectFileUploadOpen, setIsProjectFileUploadOpen] = useState(false);
    const [isEmployeeFileUploadOpen, setIsEmployeeFileUploadOpen] = useState(false);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
    
    const loadMockData = useCallback(() => {
        setUsers(MOCK_USERS);
        setProjects(MOCK_PROJECTS);
        setClients(MOCK_CLIENTS);
        setActivityLog(MOCK_ACTIVITY_LOG);
        setTimeLogs(MOCK_TIME_LOGS);
        setChatMessages(MOCK_CHAT_MESSAGES as any);
        setInvoices(MOCK_INVOICES);
        setFiles(MOCK_FILES as any);
        setTasks(MOCK_TASKS);
        setFeedback(MOCK_FEEDBACK as any);
        setPanelNotifications(MOCK_PANEL_NOTIFICATIONS);
    }, []);

    useEffect(() => {
        async function initializeApp() {
            setIsLoading(true);

            if (!isSupabaseConfigured || !supabase) {
                console.log("Supabase non configuré. Passage en mode démo.");
                loadMockData();
                setIsDemoMode(true);
                setIsLoading(false);
                addNotification({ type: ToastNotificationType.INFO, title: "Mode Démo", message: "Supabase n'est pas configuré. L'application s'exécute avec des données de démonstration." });
                return;
            }

            try {
                const { data: usersData, error } = await supabase.from('users').select('*');

                if (error) throw error;

                if (usersData && usersData.length > 0) {
                    console.log("Données Supabase chargées avec succès.");
                    const [projectsRes, clientsRes, activityLogRes, timeLogsRes, chatMessagesRes, invoicesRes, filesRes, tasksRes, feedbackRes, panelNotificationsRes, projectEmployeesRes, clientEmployeesRes] = await Promise.all([
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
                        supabase.from('project_employees').select('project_id, user_id'),
                        supabase.from('client_employees').select('client_id, user_id'),
                    ]);
                    
                    if (usersData && clientEmployeesRes.data) {
                        setUsers(usersData.map((u: any) => ({
                            ...u,
                            assignedClientIds: clientEmployeesRes.data
                                .filter((ce: any) => ce.user_id === u.id)
                                .map((ce: any) => ce.client_id),
                        })));
                    } else if (usersData) {
                        setUsers(usersData);
                    }

                    if (projectsRes.data && projectEmployeesRes.data) {
                        setProjects(projectsRes.data.map((p: any) => ({
                            ...p,
                            clientId: p.client_id,
                            dueDate: p.due_date,
                            assignedEmployeeIds: projectEmployeesRes.data
                                .filter((pe: any) => pe.project_id === p.id)
                                .map((pe: any) => pe.user_id),
                        })));
                    }
                    if (clientsRes.data && clientEmployeesRes.data) {
                        setClients((clientsRes.data as any[]).map((c: any) => ({
                            ...c,
                            companyName: c.company_name,
                            contactName: c.contact_name,
                            contactEmail: c.contact_email,
                            assignedEmployeeIds: clientEmployeesRes.data
                                .filter((ce: any) => ce.client_id === c.id)
                                .map((ce: any) => ce.user_id),
                        })));
                    }
                    if (activityLogRes.data) {
                        setActivityLog(activityLogRes.data.map((l: any) => ({
                            ...l,
                            userId: l.user_id,
                            timestamp: new Date(l.timestamp),
                        })));
                    }
                    if (timeLogsRes.data) {
                        setTimeLogs(timeLogsRes.data.map((l: any) => ({
                            ...l,
                            projectId: l.project_id,
                            employeeId: l.employee_id,
                        })));
                    }
                    if (chatMessagesRes.data) {
                        setChatMessages(chatMessagesRes.data.map((m: any) => ({
                            ...m,
                            projectId: m.project_id,
                            senderId: m.sender_id,
                            timestamp: new Date(m.timestamp),
                            readBy: [],
                        })));
                    }
                    if (invoicesRes.data) {
                        setInvoices(invoicesRes.data.map((i: any) => ({
                            ...i,
                            clientId: i.client_id,
                            projectId: i.project_id,
                            issueDate: i.issue_date,
                            dueDate: i.due_date,
                        })));
                    }
                    if (filesRes.data) {
                        setFiles(filesRes.data.map((f: any) => ({
                            ...f,
                            projectId: f.project_id,
                            uploadedBy: f.uploaded_by,
                            lastModified: new Date(f.last_modified),
                        })));
                    }
                    if (tasksRes.data) {
                        setTasks(tasksRes.data.map((t: any) => ({
                            ...t,
                            projectId: t.project_id,
                            employeeId: t.employee_id,
                        })));
                    }
                    if (feedbackRes.data) {
                        setFeedback(feedbackRes.data.map((f: any) => ({
                            ...f,
                            clientId: f.client_id,
                            projectId: f.project_id,
                            timestamp: new Date(f.timestamp),
                        })));
                    }
                    if (panelNotificationsRes.data) {
                        setPanelNotifications(panelNotificationsRes.data.map((n: any) => ({
                            ...n,
                            userId: n.user_id,
                            projectId: n.project_id,
                            timestamp: new Date(n.timestamp),
                        })));
                    }
                    setIsDemoMode(false);
                } else {
                    console.log("Base de données vide. Passage en mode démo.");
                    loadMockData();
                    setIsDemoMode(true);
                    addNotification({ type: ToastNotificationType.INFO, title: "Mode Démo", message: "Votre base de données est vide. L'application utilise des données de démonstration." });
                }

            } catch (error: any) {
                console.error("Erreur d'initialisation de l'application:", error.message);
                loadMockData();
                setIsDemoMode(true);
                addNotification({ type: ToastNotificationType.ERROR, title: "Erreur de Connexion", message: "Impossible de se connecter à la base de données. L'application est en mode démo." });
            } finally {
                setIsLoading(false);
            }
        }

        initializeApp();
    }, [addNotification, loadMockData]);

    // --- Data Handlers ---

    const handleAddProject = async (projectData: Omit<Project, 'id'>) => {
        const newId = crypto.randomUUID();
        const optimisticProject = { ...projectData, id: newId };
        const previousState = projects;
        setProjects(prev => [...prev, optimisticProject]);

        if (isDemoMode) {
            addNotification({ type: ToastNotificationType.SUCCESS, title: "Projet Ajouté (Démo)", message: `Le projet "${optimisticProject.name}" a été ajouté.` });
            return;
        }
        if (!supabase) return;

        try {
            const { assignedEmployeeIds, ...coreProjectData } = projectData;
            const insertData = { 
                id: optimisticProject.id, 
                name: coreProjectData.name, 
                client_id: coreProjectData.clientId, 
                status: coreProjectData.status, 
                description: coreProjectData.description, 
                due_date: coreProjectData.dueDate, 
            };
            const { data, error } = await supabase.from('projects').insert(insertData).select().single();
            if (error) throw error;
            
            if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
                const projectEmployeeRows = assignedEmployeeIds.map(userId => ({
                    project_id: data.id,
                    user_id: userId
                }));
                const { error: joinError } = await supabase.from('project_employees').insert(projectEmployeeRows);
                if (joinError) throw joinError;
            }

            const confirmedData = { ...optimisticProject, ...data, clientId: data.client_id, dueDate: data.due_date };
            setProjects(prev => prev.map(item => item.id === newId ? confirmedData : item));
            if (currentUser) addLogEntry(currentUser.id, 'a ajouté le projet', data.name);
            addNotification({ type: ToastNotificationType.SUCCESS, title: 'Projet Ajouté', message: `Le projet "${data.name}" a été ajouté.` });
        } catch (error: any) {
            setProjects(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de l'ajout`, message: `Impossible d'ajouter le projet: ${error.message}` });
        }
    };

    const handleUpdateProject = async (updatedProject: Project) => {
        const previousState = projects;
        setProjects(prev => prev.map(item => item.id === updatedProject.id ? updatedProject : item));

        if (isDemoMode) {
            addNotification({ type: ToastNotificationType.INFO, title: "Projet Mis à Jour (Démo)", message: `Le projet "${updatedProject.name}" a été mis à jour.` });
            return;
        }
        if (!supabase) return;

        try {
            const { assignedEmployeeIds, ...coreProjectData } = updatedProject;
            const updateData = { 
                name: coreProjectData.name, 
                client_id: coreProjectData.clientId, 
                status: coreProjectData.status, 
                description: coreProjectData.description, 
                due_date: coreProjectData.dueDate,
            };
            const { error: projectUpdateError } = await supabase.from('projects').update(updateData).eq('id', updatedProject.id);
            if (projectUpdateError) throw projectUpdateError;

            const { error: deleteError } = await supabase.from('project_employees').delete().eq('project_id', updatedProject.id);
            if (deleteError) throw deleteError;

            if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
                const projectEmployeeRows = assignedEmployeeIds.map(userId => ({
                    project_id: updatedProject.id,
                    user_id: userId
                }));
                const { error: insertError } = await supabase.from('project_employees').insert(projectEmployeeRows);
                if (insertError) throw insertError;
            }
            
            if (currentUser) addLogEntry(currentUser.id, 'a mis à jour le projet', updatedProject.name);
            addNotification({ type: ToastNotificationType.INFO, title: "Projet Mis à Jour", message: `Le projet "${updatedProject.name}" a été mis à jour.` });
        } catch (error: any) {
            setProjects(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de la mise à jour`, message: `Impossible de mettre à jour le projet: ${error.message}` });
        }
    };
    
    const handleDeleteProject = async (id: string) => {
        const previousState = projects;
        setProjects(prev => prev.filter(item => item.id !== id));
        if (isDemoMode) return;
        if (!supabase) return;
        try {
            const { error: joinError } = await supabase.from('project_employees').delete().eq('project_id', id);
            if (joinError) throw joinError;
            
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
        } catch (error: any) {
            setProjects(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de la suppression`, message: `Impossible de supprimer le projet: ${error.message}` });
        }
    };
    
    const handleAddClient = async (clientData: Omit<Client, 'id' | 'logo'>) => {
        const newId = crypto.randomUUID();
        const newClient: Client = { ...clientData, id: newId, logo: `https://logo.clearbit.com/${clientData.companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, '')}.com` };
        const previousClients = clients;
        setClients(prev => [...prev, newClient]);

        if (isDemoMode) {
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Client ajouté (Démo)', message: `Le client ${newClient.companyName} a été ajouté.`});
            return;
        }
        if (!supabase) return;

        try {
            const { assignedEmployeeIds, ...coreClientData } = newClient;
            const insertData = { 
                id: coreClientData.id, 
                company_name: coreClientData.companyName, 
                contact_name: coreClientData.contactName, 
                contact_email: coreClientData.contactEmail, 
                status: coreClientData.status,
            };
            const { data, error } = await supabase.from('clients').insert(insertData).select().single();
            if (error) throw error;
            
            if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
                const clientEmployeeRows = assignedEmployeeIds.map(userId => ({
                    client_id: data.id,
                    user_id: userId
                }));
                const { error: joinError } = await supabase.from('client_employees').insert(clientEmployeeRows);
                if (joinError) throw joinError;
            }

            const confirmedClientData = { id: data.id, companyName: data.company_name, contactName: data.contact_name, contactEmail: data.contact_email, status: data.status, assignedEmployeeIds };
            setClients(prev => prev.map(c => c.id === newId ? confirmedClientData : c));
            if (currentUser) addLogEntry(currentUser.id, `a ajouté un client`, newClient.companyName);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Client ajouté', message: `Le client ${newClient.companyName} a été ajouté.`});
        } catch (error: any) {
            setClients(previousClients);
            addNotification({type: ToastNotificationType.ERROR, title: `Échec de l'ajout`, message: `Impossible d'ajouter le client: ${error.message}`});
        }
    };

    const handleUpdateClient = async (updatedClient: Client) => {
        const previousClients = clients;
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));

        if (isDemoMode) {
            addNotification({type: ToastNotificationType.INFO, title: 'Client Mis à Jour (Démo)', message: `Le client ${updatedClient.companyName} a été mis à jour.`});
            return;
        }
        if (!supabase) return;

        try {
            const { assignedEmployeeIds, ...coreClientData } = updatedClient;
            const updateData = { 
                company_name: coreClientData.companyName, 
                contact_name: coreClientData.contactName, 
                contact_email: coreClientData.contactEmail, 
                status: coreClientData.status,
            };
            const { error: clientUpdateError } = await supabase.from('clients').update(updateData).eq('id', updatedClient.id);
            if (clientUpdateError) throw clientUpdateError;

            const { error: deleteError } = await supabase.from('client_employees').delete().eq('client_id', updatedClient.id);
            if (deleteError) throw deleteError;

            if (assignedEmployeeIds && assignedEmployeeIds.length > 0) {
                const clientEmployeeRows = assignedEmployeeIds.map(userId => ({
                    client_id: updatedClient.id,
                    user_id: userId
                }));
                const { error: insertError } = await supabase.from('client_employees').insert(clientEmployeeRows);
                if (insertError) throw insertError;
            }

            if(currentUser) addLogEntry(currentUser.id, "a mis à jour le client", updatedClient.companyName);
            addNotification({type: ToastNotificationType.INFO, title: 'Client Mis à Jour', message: `Le client ${updatedClient.companyName} a été mis à jour.`});
        } catch(error: any) {
            setClients(previousClients);
            addNotification({type: ToastNotificationType.ERROR, title: 'Échec de la mise à jour', message: `Impossible de mettre à jour le client: ${error.message}`});
        }
    };

    const handleAddUser = async (userData: Omit<User, 'id' | 'avatar' | 'activityStatus'>) => {
        const newUserId = crypto.randomUUID();
        const newUser: User = { ...userData, id: newUserId, avatar: `https://i.pravatar.cc/150?u=${newUserId}`, activityStatus: 'offline' };
        const previousUsers = users;
        setUsers(prev => [...prev, newUser]);

        if (isDemoMode) {
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Utilisateur ajouté (Démo)', message: `L'utilisateur ${newUser.name} a été ajouté.`});
            return;
        }
        if (!supabase) return;
        
        try {
            const { assignedClientIds, ...coreUserData } = newUser;
            const insertData = { 
                id: coreUserData.id,
                name: coreUserData.name, 
                email: coreUserData.email, 
                avatar: coreUserData.avatar, 
                role: coreUserData.role, 
                position: coreUserData.position, 
            };
            const { data, error } = await supabase.from('users').insert(insertData).select().single();
            if (error) throw error;
    
            if (assignedClientIds && assignedClientIds.length > 0) {
                const clientEmployeeRows = assignedClientIds.map(clientId => ({
                    user_id: data.id,
                    client_id: clientId
                }));
                const { error: joinError } = await supabase.from('client_employees').insert(clientEmployeeRows);
                if (joinError) throw joinError;
            }
    
            const confirmedData = { ...newUser, ...data, assignedClientIds: assignedClientIds || [] };
            setUsers(prev => prev.map(u => u.id === newUserId ? confirmedData : u));
            if (currentUser) addLogEntry(currentUser.id, `a ajouté un ${userData.role === UserRole.ADMIN ? 'administrateur' : 'employé'}`, data.name);
            addNotification({type: ToastNotificationType.SUCCESS, title: 'Utilisateur ajouté', message: `L'utilisateur ${data.name} a été ajouté.`});
        } catch (error: any) {
            setUsers(previousUsers);
            addNotification({type: ToastNotificationType.ERROR, title: `Échec de l'ajout`, message: `Impossible d'ajouter l'utilisateur: ${error.message}`});
        }
    };
    
    const handleUpdateUser = async (updatedUser: User) => {
        const previousUsers = users;
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);

        if (isDemoMode) {
             addNotification({type: ToastNotificationType.INFO, title: 'Profil Mis à Jour (Démo)', message: 'Votre profil a été mis à jour.'});
            return;
        }
        if (!supabase) return;
        
        try {
            const { assignedClientIds, ...coreUserData } = updatedUser;
            const updateData = { 
                name: coreUserData.name, 
                email: coreUserData.email, 
                avatar: coreUserData.avatar, 
                role: coreUserData.role, 
                position: coreUserData.position, 
            };
            const { error: userUpdateError } = await supabase.from('users').update(updateData).eq('id', updatedUser.id);
            if (userUpdateError) throw userUpdateError;

            const { error: deleteError } = await supabase.from('client_employees').delete().eq('user_id', updatedUser.id);
            if (deleteError) throw deleteError;

            if (assignedClientIds && assignedClientIds.length > 0) {
                const clientEmployeeRows = assignedClientIds.map(clientId => ({
                    user_id: updatedUser.id,
                    client_id: clientId
                }));
                const { error: insertError } = await supabase.from('client_employees').insert(clientEmployeeRows);
                if (insertError) throw insertError;
            }

            if(currentUser) addLogEntry(currentUser.id, "a mis à jour le profil", updatedUser.name);
            addNotification({type: ToastNotificationType.INFO, title: 'Profil Mis à Jour', message: 'Votre profil a été mis à jour.'});
        } catch(error: any) {
            setUsers(previousUsers);
            if (currentUser?.id === updatedUser.id) setCurrentUser(previousUsers.find(u => u.id === currentUser.id) || null);
            addNotification({type: ToastNotificationType.ERROR, title: 'Échec de la mise à jour', message: `Impossible de mettre à jour l'utilisateur: ${error.message}`});
        }
    };

    const handleDeleteUser = async (id: string) => {
        const userToDelete = users.find(u => u.id === id);
        if (!userToDelete) return;

        if (userToDelete.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
            addNotification({type: ToastNotificationType.ERROR, title: 'Action impossible', message: 'Vous ne pouvez pas supprimer le dernier administrateur.'});
            return;
        }
        
        const previousUsers = users;
        const previousProjects = projects;
        const previousClients = clients;
        setUsers(prev => prev.filter(u => u.id !== id));
        setProjects(prev => prev.map(p => ({ ...p, assignedEmployeeIds: p.assignedEmployeeIds.filter(empId => empId !== id) })));
        setClients(prev => prev.map(c => ({ ...c, assignedEmployeeIds: c.assignedEmployeeIds.filter(empId => empId !== id) })));

        if (isDemoMode) {
            addNotification({type: ToastNotificationType.ERROR, title: 'Utilisateur Supprimé (Démo)', message: `L'utilisateur "${userToDelete.name}" a été supprimé.`});
            return;
        }
        if (!supabase) return;
        
        try {
            const { error: projectAssignmentsError } = await supabase.from('project_employees').delete().eq('user_id', id);
            if (projectAssignmentsError) throw projectAssignmentsError;

            const { error: clientAssignmentsError } = await supabase.from('client_employees').delete().eq('user_id', id);
            if (clientAssignmentsError) throw clientAssignmentsError;

            const { error } = await supabase.from('users').delete().eq('id', id);
            if (error) throw error;
            if(currentUser) addLogEntry(currentUser.id, `a supprimé l'utilisateur`, userToDelete.name);
            addNotification({type: ToastNotificationType.ERROR, title: 'Utilisateur Supprimé', message: `L'utilisateur "${userToDelete.name}" a été supprimé.`});
        } catch(error: any) {
            setUsers(previousUsers);
            setProjects(previousProjects);
            setClients(previousClients);
            addNotification({type: ToastNotificationType.ERROR, title: 'Échec de la suppression', message: `Impossible de supprimer l'utilisateur: ${error.message}`});
        }
    };

    const handleDeleteClient = async (id: string) => {
        const clientToDelete = clients.find(c => c.id === id);
        if (!clientToDelete) return;
        const previousClients = clients;
        const previousProjects = projects;
        const previousTasks = tasks;
        const previousInvoices = invoices;
        setClients(prev => prev.filter(c => c.id !== id));
        const projectIdsToDelete = previousProjects.filter(p => p.clientId === id).map(p => p.id);
        setProjects(prev => prev.filter(p => p.clientId !== id));
        setTasks(prev => prev.filter(t => !projectIdsToDelete.includes(t.projectId)));
        setInvoices(prev => prev.filter(i => i.clientId !== id));

        if (isDemoMode) {
            addNotification({ type: ToastNotificationType.ERROR, title: 'Client Supprimé (Démo)', message: `Le client "${clientToDelete.companyName}" et toutes ses données ont été supprimés.` });
            return;
        }
        if (!supabase) return;

        try {
            if (projectIdsToDelete.length > 0) {
                await supabase.from('tasks').delete().in('projectId', projectIdsToDelete);
                await supabase.from('projects').delete().in('id', projectIdsToDelete);
            }
            await supabase.from('invoices').delete().eq('clientId', id);
            const { error: clientEmployeeError } = await supabase.from('client_employees').delete().eq('client_id', id);
            if (clientEmployeeError) throw clientEmployeeError;
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            addNotification({ type: ToastNotificationType.ERROR, title: 'Client Supprimé', message: `Le client "${clientToDelete.companyName}" a été supprimé.` });
        } catch (error: any) {
            setClients(previousClients);
            setProjects(previousProjects);
            setTasks(previousTasks);
            setInvoices(previousInvoices);
            addNotification({ type: ToastNotificationType.ERROR, title: 'Échec de la suppression', message: `Impossible de supprimer le client: ${error.message}` });
        }
    };

    const handleAddTask = async (taskData: Omit<Task, 'id'>) => {
        const newId = crypto.randomUUID();
        const optimisticTask = { ...taskData, id: newId };
        const previousState = tasks;
        setTasks(prev => [...prev, optimisticTask]);
    
        if (isDemoMode) {
            addNotification({ type: ToastNotificationType.SUCCESS, title: "Tâche Ajoutée (Démo)", message: `La tâche "${optimisticTask.title}" a été ajoutée.` });
            return;
        }
        if (!supabase) return;
    
        try {
            const insertData = { id: optimisticTask.id, project_id: optimisticTask.projectId, employee_id: optimisticTask.employeeId, title: optimisticTask.title, status: optimisticTask.status };
            const { data, error } = await supabase.from('tasks').insert(insertData).select().single();
            if (error) throw error;
            const confirmedData = { ...optimisticTask, id: data.id, projectId: data.project_id, employeeId: data.employee_id, title: data.title, status: data.status };
            setTasks(prev => prev.map(item => item.id === newId ? confirmedData : item));
            if (currentUser) addLogEntry(currentUser.id, 'a ajouté une tâche', data.title);
            addNotification({ type: ToastNotificationType.SUCCESS, title: 'Tâche Ajoutée', message: `La tâche "${data.title}" a été ajoutée.` });
        } catch (error: any) {
            setTasks(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de l'ajout`, message: `Impossible d'ajouter la tâche: ${error.message}` });
        }
    };
    
    const handleUpdateTask = async (updatedTask: Task) => {
        const previousState = tasks;
        setTasks(prev => prev.map(item => item.id === updatedTask.id ? updatedTask : item));
        if (isDemoMode) return;
        if (!supabase) return;
        try {
            const updateData = { project_id: updatedTask.projectId, employee_id: updatedTask.employeeId, title: updatedTask.title, status: updatedTask.status };
            const { error } = await supabase.from('tasks').update(updateData).eq('id', updatedTask.id);
            if (error) throw error;
            if (currentUser) addLogEntry(currentUser.id, 'a mis à jour la tâche', updatedTask.title);
        } catch (error: any) {
            setTasks(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de la mise à jour`, message: `Impossible de mettre à jour la tâche: ${error.message}` });
        }
    };
    
    const handleDeleteTask = async (id: string) => {
        const previousState = tasks;
        setTasks(prev => prev.filter(item => item.id !== id));
        if (isDemoMode) return;
        if (!supabase) return;
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
        } catch (error: any) {
            setTasks(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de la suppression`, message: `Impossible de supprimer la tâche: ${error.message}` });
        }
    };

    const handleAddInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
        const newId = crypto.randomUUID();
        const optimisticInvoice = { ...invoiceData, id: newId };
        const previousState = invoices;
        setInvoices(prev => [...prev, optimisticInvoice]);

        if (isDemoMode) {
            addNotification({ type: ToastNotificationType.SUCCESS, title: "Facture Ajoutée (Démo)", message: `La facture "${optimisticInvoice.id.toUpperCase()}" a été ajoutée.` });
            return;
        }
        if (!supabase) return;

        try {
            const insertData = { id: optimisticInvoice.id, client_id: optimisticInvoice.clientId, project_id: optimisticInvoice.projectId, amount: optimisticInvoice.amount, issue_date: optimisticInvoice.issueDate, due_date: optimisticInvoice.dueDate, status: optimisticInvoice.status };
            const { data, error } = await supabase.from('invoices').insert(insertData).select().single();
            if (error) throw error;
            const confirmedData = { ...optimisticInvoice, ...data, clientId: data.client_id, projectId: data.project_id, issueDate: data.issue_date, dueDate: data.due_date };
            setInvoices(prev => prev.map(item => item.id === newId ? confirmedData : item));
            if (currentUser) addLogEntry(currentUser.id, 'a ajouté la facture', data.id.toUpperCase());
            addNotification({ type: ToastNotificationType.SUCCESS, title: 'Facture Ajoutée', message: `La facture "${data.id.toUpperCase()}" a été ajoutée.` });
        } catch (error: any) {
            setInvoices(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de l'ajout`, message: `Impossible d'ajouter la facture: ${error.message}` });
        }
    };

    const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
        const previousState = invoices;
        setInvoices(prev => prev.map(item => item.id === updatedInvoice.id ? updatedInvoice : item));
        if (isDemoMode) return;
        if (!supabase) return;
        try {
            const updateData = { client_id: updatedInvoice.clientId, project_id: updatedInvoice.projectId, amount: updatedInvoice.amount, issue_date: updatedInvoice.issueDate, due_date: updatedInvoice.dueDate, status: updatedInvoice.status };
            const { error } = await supabase.from('invoices').update(updateData).eq('id', updatedInvoice.id);
            if (error) throw error;
            if (currentUser) addLogEntry(currentUser.id, 'a mis à jour la facture', updatedInvoice.id.toUpperCase());
        } catch (error: any) {
            setInvoices(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de la mise à jour`, message: `Impossible de mettre à jour la facture: ${error.message}` });
        }
    };
    
    const handleAddFeedback = async (feedbackData: Omit<Feedback, 'id' | 'timestamp'>) => {
        const newId = crypto.randomUUID();
        const optimisticFeedback = { ...feedbackData, id: newId, timestamp: new Date() };
        const previousState = feedback;
        setFeedback(prev => [...prev, optimisticFeedback]);

        if (isDemoMode) {
            addNotification({ type: ToastNotificationType.SUCCESS, title: "Feedback envoyé (Démo)", message: "Merci pour vos commentaires !" });
            return;
        }
        if (!supabase) return;
        
        try {
            const insertData = { ...optimisticFeedback, timestamp: optimisticFeedback.timestamp.toISOString(), client_id: optimisticFeedback.clientId, project_id: optimisticFeedback.projectId };
            const { data, error } = await supabase.from('feedback').insert(insertData).select().single();
            if (error) throw error;
            const confirmedData = { ...optimisticFeedback, ...data, timestamp: new Date(data.timestamp), clientId: data.client_id, projectId: data.project_id };
            setFeedback(prev => prev.map(item => item.id === newId ? confirmedData : item));
            addNotification({ type: ToastNotificationType.SUCCESS, title: "Feedback envoyé", message: "Merci pour vos commentaires !" });
        } catch (error: any) {
            setFeedback(previousState);
            addNotification({ type: ToastNotificationType.ERROR, title: `Échec de l'envoi`, message: `Impossible d'envoyer le feedback: ${error.message}` });
        }
    };

    const handleSendMessage = async (projectId: string, text: string) => {
        if (!currentUser) return;
        const newId = crypto.randomUUID();
        const newMessage: ChatMessage = { id: newId, projectId, senderId: currentUser.id, text, timestamp: new Date(), readBy: [currentUser.id] };
        setChatMessages(prev => [...prev, newMessage]);

        if (isDemoMode || !supabase) return;
        
        const insertData = { id: newMessage.id, project_id: newMessage.projectId, sender_id: newMessage.senderId, text: newMessage.text, timestamp: newMessage.timestamp.toISOString() };
        const { data, error } = await supabase.from('chat_messages').insert(insertData).select().single();

        if (error) {
            addNotification({type: ToastNotificationType.ERROR, title: 'Erreur', message: "Le message n'a pas pu être envoyé."});
            setChatMessages(prev => prev.filter(m => m.id !== newId));
        } else if (data) {
            const confirmedMessage: ChatMessage = { id: data.id, projectId: data.project_id, senderId: data.sender_id, text: data.text, timestamp: new Date(data.timestamp), readBy: newMessage.readBy };
            setChatMessages(prev => prev.map(m => m.id === newId ? confirmedMessage : m));
        }
    };

    const addLogEntry = async (userId: string, action: string, details?: string) => {
        const newLog: ActivityLog = { id: `temp-${Date.now()}`, userId, action, details, timestamp: new Date() };
        setActivityLog(prev => [newLog, ...prev]);
        if (isDemoMode || !supabase) return;
        const { id, ...insertData } = newLog;
        await supabase.from('activity_logs').insert({ user_id: insertData.userId, action: insertData.action, details: insertData.details, timestamp: insertData.timestamp.toISOString() });
    };

    const handleAddFile = (fileData: Omit<ProjectFile, 'id' | 'uploadedBy' | 'lastModified'>) => {
        if (!currentUser) return;

        const newFile: ProjectFile = {
            ...fileData,
            id: crypto.randomUUID(),
            uploadedBy: currentUser.id,
            lastModified: new Date(),
        };

        setFiles(prev => [...prev, newFile]);

        const projectName = projects.find(p => p.id === newFile.projectId)?.name || 'un projet';
        addNotification({
            type: ToastNotificationType.SUCCESS,
            title: "Fichier ajouté",
            message: `Le fichier "${newFile.name}" a été ajouté au projet ${projectName}.`
        });

        addLogEntry(currentUser.id, "a ajouté le fichier", newFile.name);
    };

    const handleLogin = (user: User) => setCurrentUser(user);
    const handleLogout = () => { setCurrentUser(null); setActiveTimer(null); };

    useEffect(() => {
        document.documentElement.classList.add('dark');
        if (currentUser && !detailedProject && !detailedClient && !chatProject) {
            const defaultView: View = currentUser.role === UserRole.CLIENT ? 'client-dashboard' 
                : currentUser.role === UserRole.ADMIN ? 'dashboard'
                : 'my-projects';
            setActiveView(defaultView);
        }
    }, [currentUser, detailedProject, detailedClient, chatProject]);

    const handleViewProjectDetails = (project: Project) => { setPreviousView(activeView); setDetailedProject(project); };
    const handleViewClientProjects = (client: Client) => { setPreviousView(activeView); setDetailedClient(client); };
    const handleViewChat = (project: Project) => { setPreviousView(activeView); setChatProject(project); };
    const handleBack = () => { setDetailedProject(null); setDetailedClient(null); setChatProject(null); setActiveView(previousView); };
    useEffect(() => { if (activeView === 'profile' || activeView === 'client-profile') { setIsProfileModalOpen(true); setActiveView(previousView); } }, [activeView, previousView]);
    
    // --- Modal Handlers ---
    const handleOpenProjectForm = (project: Project | null) => { setProjectToEdit(project); setIsProjectFormOpen(true); };
    const handleOpenDeleteProjectModal = (project: Project) => { setProjectToDelete(project); setIsDeleteProjectModalOpen(true); };
    const handleOpenTaskForm = (task: Task | null) => { setTaskToEdit(task); setIsTaskFormOpen(true); };
    const handleOpenDeleteTaskModal = (task: Task) => { setTaskToDelete(task); setIsDeleteTaskModalOpen(true); };
    const handleOpenTeamForm = (item: User | Client | null, type: 'employee' | 'client' | 'admin') => { setTeamItemToEdit(item); setTeamFormType(type); setIsTeamFormOpen(true); };
    const handleOpenDeleteTeamModal = (item: User | Client) => { setTeamItemToDelete(item); setIsDeleteTeamModalOpen(true); };
    const handleOpenInvoiceDetails = (invoice: Invoice) => { setInvoiceToView(invoice); setIsInvoiceDetailsModalOpen(true); };
    const handleOpenEmployeeTasks = (employee: User) => { setEmployeeForTasks(employee); setIsEmployeeTasksModalOpen(true); };
    const handleOpenTimeLogForm = (hours?: number) => { setHoursForTimeLog(hours); setIsTimeLogFormOpen(true); };


    if (isLoading) {
        return <div className="min-h-screen w-full flex items-center justify-center aurora-bg text-slate-300">Chargement de l'application...</div>;
    }

    if (!currentUser) {
        return <LoginScreen users={users} clients={clients} onLogin={handleLogin} />;
    }
    
    const getPageTitle = (view: View): string => {
        if(detailedProject) return "Détails du Projet";
        if(detailedClient) return "Projets du Client";
        if(chatProject) return "Discussion de Projet";
        const viewTitles: Record<View, string> = {
            'dashboard': 'Tableau de bord', 'projects': 'Projets & Tâches', 'team': 'Équipe & Clients', 'messages': 'Messages', 'reports': 'Rapports & Performance',
            'billing': 'Facturation', 'ai-insights': 'Insights IA', 'files': 'Fichiers', 'settings': 'Paramètres', 'activity-log': "Journal d'activité",
            'my-projects': 'Mes Projets', 'my-tasks': 'Mes Tâches', 'calendar': 'Planning', 'time-tracking': 'Suivi du Temps', 'project-files': 'Fichiers de Projet',
            'my-performance': 'Ma Performance', 'profile': 'Profil', 'client-dashboard': 'Tableau de bord Client', 'client-projects': 'Mes Projets',
            'support': 'Support & Messages', 'deliverables': 'Livrables', 'client-billing': 'Facturation', 'feedback': 'Feedback', 'client-profile': 'Mon Profil', 'login': 'Connexion',
        };
        return viewTitles[view] || "Telya";
    };

    const currentViewKey = detailedProject?.id || detailedClient?.id || chatProject?.id || activeView;
    const getViewBackgroundColorClass = (): string => {
        let currentViewTarget: View | 'details' | 'chat' | 'client-overview' = activeView;
        if (detailedProject) currentViewTarget = 'details';
        if (chatProject) currentViewTarget = 'chat';
        if (detailedClient) currentViewTarget = 'client-overview';
        const viewColorMap: Partial<Record<string, string>> = {
            'dashboard': 'bg-view-dashboard', 'client-dashboard': 'bg-view-dashboard', 'projects': 'bg-view-projects', 'my-projects': 'bg-view-projects',
            'client-projects': 'bg-view-projects', 'details': 'bg-view-projects', 'team': 'bg-view-team', 'client-overview': 'bg-view-team',
            'messages': 'bg-view-messages', 'support': 'bg-view-messages', 'chat': 'bg-view-messages', 'reports': 'bg-view-reports',
            'my-performance': 'bg-view-reports', 'billing': 'bg-view-billing', 'client-billing': 'bg-view-billing', 'ai-insights': 'bg-view-ai-insights',
            'files': 'bg-view-files', 'project-files': 'bg-view-files', 'deliverables': 'bg-view-deliverables', 'settings': 'bg-view-settings',
            'activity-log': 'bg-view-activity-log', 'my-tasks': 'bg-view-my-tasks', 'calendar': 'bg-view-calendar', 'time-tracking': 'bg-view-time-tracking', 'feedback': 'bg-view-feedback',
        };
        return viewColorMap[currentViewTarget] || 'bg-view-default';
    }

    const renderMainContent = () => {
        if (!currentUser) return null;

        if (detailedProject) {
            const client = clients.find(c => c.id === detailedProject.clientId);
            if (!client) return <div>Erreur: Client introuvable</div>;
            return <ProjectDetails 
                project={detailedProject} client={client} team={users.filter(u => detailedProject.assignedEmployeeIds.includes(u.id))}
                tasks={tasks.filter(t => t.projectId === detailedProject.id)} timeLogs={timeLogs} files={files.filter(f => f.projectId === detailedProject.id)}
                currentUser={currentUser} users={users} onBack={handleBack} onViewChat={handleViewChat} activeTimer={activeTimer}
                onStartTimer={(pid) => setActiveTimer({ projectId: pid, employeeId: currentUser.id, startTime: Date.now() })}
                onStopTimerAndLog={console.log} onUpdateTask={handleUpdateTask}
                onOpenTimeLogForm={handleOpenTimeLogForm} onOpenFileUploadModal={() => setIsProjectFileUploadOpen(true)}
            />;
        }
        if (detailedClient) {
            return <ClientProjectsOverview client={detailedClient} projects={projects} users={users} onBack={handleBack} />;
        }
        if(chatProject) {
            return <ProjectChatView 
                project={chatProject} messages={chatMessages.filter(m => m.projectId === chatProject.id)} currentUser={currentUser}
                users={users} client={clients.find(c => c.id === chatProject.clientId)} onSendMessage={(text) => handleSendMessage(chatProject.id, text)} onBack={handleBack}
            />
        }

        switch (currentUser.role) {
            case UserRole.ADMIN:
                switch (activeView) {
                    case 'dashboard': return <AdminDashboard currentUser={currentUser} users={users} projects={projects} activityLog={activityLog} invoices={invoices} onUpdateInvoice={handleUpdateInvoice} onViewProjectDetails={handleViewProjectDetails} tasks={tasks} clients={clients} onOpenInvoiceDetails={handleOpenInvoiceDetails} />;
                    case 'projects': return <ProjectManagementView projects={projects} users={users} clients={clients} currentUser={currentUser} timeLogs={timeLogs} tasks={tasks} onAdd={handleAddProject} onUpdate={handleUpdateProject} onDelete={handleDeleteProject} onViewDetails={handleViewProjectDetails} onManualRefresh={() => {}} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} onOpenAddProject={() => handleOpenProjectForm(null)} onOpenEditProject={handleOpenProjectForm} onOpenDeleteProject={handleOpenDeleteProjectModal} onOpenAddTask={() => handleOpenTaskForm(null)} onOpenEditTask={handleOpenTaskForm} onOpenDeleteTask={handleOpenDeleteTaskModal} />;
                    case 'team': return <TeamView users={users} clients={clients} currentUser={currentUser} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} onViewClientProjects={handleViewClientProjects} tasks={tasks} projects={projects} onOpenFormModal={handleOpenTeamForm} onOpenDeleteModal={handleOpenDeleteTeamModal} onOpenEmployeeTasks={handleOpenEmployeeTasks} />;
                    case 'messages': return <InboxView currentUser={currentUser} projects={projects} clients={clients} users={users} chatMessages={chatMessages} onSendMessage={handleSendMessage} onConversationSelect={() => {}}/>;
                    case 'reports': return <ReportsView projects={projects} timeLogs={timeLogs} users={users} clients={clients} />;
                    case 'billing': return <BillingView invoices={invoices} clients={clients} currentUser={currentUser} onAddInvoice={handleAddInvoice} projects={projects} onUpdateInvoice={handleUpdateInvoice} onOpenNewInvoice={() => setIsInvoiceFormOpen(true)} onOpenInvoiceDetails={handleOpenInvoiceDetails} />;
                    case 'ai-insights': return <AiInsightsView projects={projects} users={users} clients={clients} invoices={invoices} tasks={tasks} timeLogs={timeLogs} />;
                    case 'files': return <FilesView files={files} projects={projects} users={users} />;
                    case 'settings': return <SettingsView onLogout={handleLogout} onOpenDeleteConfirm={() => setIsDeleteAccountModalOpen(true)} />;
                    case 'activity-log': return <ActivityLogView activityLog={activityLog} users={users} />;
                    default: return <ViewPlaceholder title={getPageTitle(activeView)} />;
                }
            case UserRole.EMPLOYEE:
                 switch (activeView) {
                    case 'my-projects': return <EmployeeProjectView currentUser={currentUser} projects={projects} clients={clients} users={users} timeLogs={timeLogs} onViewDetails={handleViewProjectDetails} />;
                    case 'my-tasks': return <EmployeeTasksView currentUser={currentUser} tasks={tasks} projects={projects} onUpdateTask={handleUpdateTask} />;
                    case 'calendar': return <EmployeeCalendarView currentUser={currentUser} projects={projects} />;
                    case 'messages': return <InboxView currentUser={currentUser} projects={projects} clients={clients} users={users} chatMessages={chatMessages} onSendMessage={handleSendMessage} onConversationSelect={() => {}}/>;
                    case 'time-tracking': return <EmployeeTimeTrackingView currentUser={currentUser} timeLogs={timeLogs} projects={projects} />;
                    case 'project-files': return <EmployeeFilesView currentUser={currentUser} files={files} projects={projects} onOpenUploadModal={() => setIsEmployeeFileUploadOpen(true)} />;
                    case 'my-performance': return <EmployeePerformanceView currentUser={currentUser} timeLogs={timeLogs} projects={projects} tasks={tasks} />;
                    default: return <ViewPlaceholder title={getPageTitle(activeView)} />;
                }
            case UserRole.CLIENT:
                const clientProfile = clients.find(c=>c.contactEmail === currentUser.email);
                switch (activeView) {
                    case 'client-dashboard': return <Dashboard currentUser={currentUser} />;
                    case 'client-projects': return <ClientProjectView currentUser={currentUser} projects={projects} clients={clients} users={users} onViewChat={handleViewChat} />;
                    case 'support': return <InboxView currentUser={currentUser} projects={projects.filter(p => clientProfile && p.clientId === clientProfile.id)} clients={clients} users={users} chatMessages={chatMessages} onSendMessage={handleSendMessage} onConversationSelect={()=>{}}/>;
                    case 'deliverables': return <ClientDeliverablesView currentUser={currentUser} files={files} projects={projects} clients={clients} />;
                    case 'client-billing': return <ClientBillingView currentUser={currentUser} invoices={invoices} clients={clients} projects={projects} onOpenInvoiceDetails={handleOpenInvoiceDetails} />;
                    case 'feedback': return <ClientFeedbackView currentUser={currentUser} feedback={feedback} projects={projects} clients={clients} onAddFeedback={handleAddFeedback} />;
                    default: return <ViewPlaceholder title={getPageTitle(activeView)} />;
                }
            default:
                return <Dashboard currentUser={currentUser} />;
        }
    };

    return (
        <div className="relative min-h-screen aurora-bg">
            <div className="flex h-screen w-full relative z-10">
                <Sidebar currentUser={currentUser} activeView={activeView} setActiveView={setActiveView} isOpenOnMobile={isMobileNavOpen} onCloseMobile={() => setIsMobileNavOpen(false)} onLogout={handleLogout} projects={projects} clients={clients} chatMessages={chatMessages} invoices={invoices} tasks={tasks} files={files} panelNotifications={panelNotifications.filter(n => n.userId === currentUser.id)} />
                <div className="flex-1 flex flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 overflow-hidden h-full">
                    <Header title={getPageTitle(activeView)} onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} currentUser={currentUser} onToggleNotificationsPanel={() => setIsNotificationsPanelOpen(p => !p)} isNotificationsPanelOpen={isNotificationsPanelOpen} notifications={panelNotifications.filter(n => n.userId === currentUser.id || currentUser.role === UserRole.ADMIN)} onMarkAllAsRead={() => {}} onNotificationClick={() => {}} />
                    <main className={`flex-1 rounded-2xl md:rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-[var(--border-color)] overflow-y-auto main-content-wrapper ${getViewBackgroundColorClass()}`}>
                        <div key={currentViewKey} className="animate-fadeInUp">{renderMainContent()}</div>
                    </main>
                </div>
            </div>
            {isMobileNavOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileNavOpen(false)}></div>}
            
            {/* --- All Modals Rendered at Top Level --- */}
            <ProfileSettingsModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentUser={currentUser} onSave={(data) => { handleUpdateUser({ ...currentUser, ...data }); setIsProfileModalOpen(false); }} />
            
            <InvoiceForm isOpen={isInvoiceFormOpen} onClose={() => setIsInvoiceFormOpen(false)} onSave={(data) => { handleAddInvoice(data); setIsInvoiceFormOpen(false); }} clients={clients} projects={projects} />

            <ProjectForm isOpen={isProjectFormOpen} onClose={() => { setIsProjectFormOpen(false); setProjectToEdit(null); }} onSave={(data) => { if (projectToEdit) { handleUpdateProject({ ...projectToEdit, ...data }); } else { handleAddProject(data); } setIsProjectFormOpen(false); }} project={projectToEdit} clients={clients} employees={users.filter(u => u.role === UserRole.EMPLOYEE)} />
            
            <ConfirmationModal isOpen={isDeleteProjectModalOpen} onClose={() => setIsDeleteProjectModalOpen(false)} onConfirm={() => { if(projectToDelete) handleDeleteProject(projectToDelete.id); setIsDeleteProjectModalOpen(false); }} title="Supprimer le projet" message={`Êtes-vous sûr de vouloir supprimer ${projectToDelete?.name}? Cette action est irréversible.`} />

            <TaskForm isOpen={isTaskFormOpen} onClose={() => { setIsTaskFormOpen(false); setTaskToEdit(null); }} onSave={(data) => { if (taskToEdit) { handleUpdateTask({ ...taskToEdit, ...data }); } else { handleAddTask(data); } setIsTaskFormOpen(false); }} task={taskToEdit} projects={projects} employees={users.filter(u => u.role === UserRole.EMPLOYEE)} />

            <ConfirmationModal isOpen={isDeleteTaskModalOpen} onClose={() => setIsDeleteTaskModalOpen(false)} onConfirm={() => { if(taskToDelete) handleDeleteTask(taskToDelete.id); setIsDeleteTaskModalOpen(false); }} title="Supprimer la tâche" message={`Êtes-vous sûr de vouloir supprimer la tâche "${taskToDelete?.title}"?`} />

            {teamFormType === 'client' ? <ClientForm isOpen={isTeamFormOpen} onClose={() => setIsTeamFormOpen(false)} onSave={(data) => { if (teamItemToEdit) { handleUpdateClient({ ...(teamItemToEdit as Client), ...data }); } else { handleAddClient(data as any); } setIsTeamFormOpen(false); }} client={teamItemToEdit as Client | null} employees={users.filter(u => u.role === UserRole.EMPLOYEE)} /> : <UserForm isOpen={isTeamFormOpen} onClose={() => setIsTeamFormOpen(false)} onSave={(data) => { if (teamItemToEdit) { handleUpdateUser({ ...(teamItemToEdit as User), ...data }); } else { handleAddUser({ ...data, role: teamFormType as UserRole }); } setIsTeamFormOpen(false); }} user={teamItemToEdit as User | null} clients={clients} role={teamFormType as UserRole} />}

            <ConfirmationModal isOpen={isDeleteTeamModalOpen} onClose={() => setIsDeleteTeamModalOpen(false)} onConfirm={() => { if(teamItemToDelete) { 'companyName' in teamItemToDelete ? handleDeleteClient(teamItemToDelete.id) : handleDeleteUser(teamItemToDelete.id); } setIsDeleteTeamModalOpen(false); }} title={`Supprimer`} message={`Êtes-vous sûr de vouloir supprimer ${teamItemToDelete?.name || (teamItemToDelete as Client)?.companyName}? Cette action est irréversible.`} />
            
            <InvoiceDetailsModal isOpen={isInvoiceDetailsModalOpen} onClose={() => setIsInvoiceDetailsModalOpen(false)} invoice={invoiceToView} client={clients.find(c => c.id === invoiceToView?.clientId) || null} projectName={invoiceToView?.projectId ? projects.find(p => p.id === invoiceToView.projectId)?.name : undefined} />
        
            <EmployeeTasksModal isOpen={isEmployeeTasksModalOpen} onClose={() => setIsEmployeeTasksModalOpen(false)} employee={employeeForTasks} tasks={tasks} projects={projects} />
       
            <TimeLogForm isOpen={isTimeLogFormOpen} onClose={() => setIsTimeLogFormOpen(false)} onSave={console.log} initialHours={hoursForTimeLog} />

            <FileUploadModal isOpen={isProjectFileUploadOpen} onClose={() => setIsProjectFileUploadOpen(false)} onUpload={(fileData) => { if (detailedProject) { handleAddFile({ ...fileData, projectId: detailedProject.id }); } }} />
            
            <EmployeeFileUploadModal isOpen={isEmployeeFileUploadOpen} onClose={() => setIsEmployeeFileUploadOpen(false)} onUpload={handleAddFile} projects={projects.filter(p => currentUser && p.assignedEmployeeIds.includes(currentUser.id))} />
            
            <ConfirmationModal isOpen={isDeleteAccountModalOpen} onClose={() => setIsDeleteAccountModalOpen(false)} onConfirm={handleLogout} title="Supprimer le compte" message="Ceci est une démo. Cliquer sur Supprimer vous déconnectera." />

        </div>
    );
};

export const App: React.FC = () => (
    <NotificationProvider>
        <AppContent />
    </NotificationProvider>
);