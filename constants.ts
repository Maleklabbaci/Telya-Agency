import { User, Client, UserRole, Project, ProjectStatus, ChatMessage, TimeLog, ActivityLog, Invoice, ProjectFile, Task, Feedback, PanelNotification } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin Telya',
    email: 'admin@telya.com',
    avatar: `https://i.pravatar.cc/150?u=user-admin-1`,
    role: UserRole.ADMIN,
    position: 'CEO',
    activityStatus: 'online',
  },
  {
    id: 'user-emp-1',
    name: 'Alice Johnson',
    email: 'employee@telya.com',
    avatar: `https://i.pravatar.cc/150?u=user-emp-1`,
    role: UserRole.EMPLOYEE,
    position: 'Project Manager',
    assignedClientIds: ['client-1', 'client-3'],
    activityStatus: 'online',
  },
  {
    id: 'user-emp-2',
    name: 'Bob Williams',
    email: 'bob.w@agency.com',
    avatar: `https://i.pravatar.cc/150?u=user-emp-2`,
    role: UserRole.EMPLOYEE,
    position: 'Lead Developer',
    assignedClientIds: ['client-1', 'client-2'],
    activityStatus: 'paused',
  },
  {
    id: 'user-emp-3',
    name: 'Charlie Brown',
    email: 'charlie.b@agency.com',
    avatar: `https://i.pravatar.cc/150?u=user-emp-3`,
    role: UserRole.EMPLOYEE,
    position: 'Marketing Specialist',
    assignedClientIds: ['client-2', 'client-4'],
    activityStatus: 'offline',
  },
  {
    id: 'user-client-1',
    name: 'David Miller',
    email: 'client@telya.com',
    avatar: `https://i.pravatar.cc/150?u=user-client-1`,
    role: UserRole.CLIENT,
    activityStatus: 'online',
  },
  {
    id: 'user-client-2',
    name: 'Emily Davis (Client)',
    email: 'emily@quantumcorp.com',
    avatar: `https://i.pravatar.cc/150?u=user-client-2`,
    role: UserRole.CLIENT,
     activityStatus: 'offline',
  },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    companyName: 'Innovatech Solutions',
    contactName: 'David Miller',
    contactEmail: 'client@telya.com',
    status: 'Active',
    logo: `https://logo.clearbit.com/innovatech.com`,
    assignedEmployeeIds: ['user-emp-1', 'user-emp-2'],
  },
  {
    id: 'client-2',
    companyName: 'Quantum Corp',
    contactName: 'Emily Davis',
    contactEmail: 'emily@quantumcorp.com',
    status: 'Active',
    logo: `https://logo.clearbit.com/quantum.com`,
    assignedEmployeeIds: ['user-emp-2', 'user-emp-3'],
  },
  {
    id: 'client-3',
    companyName: 'Stellar Goods',
    contactName: 'Frank White',
    contactEmail: 'frank@stellargoods.com',
    status: 'Onboarding',
    logo: `https://logo.clearbit.com/stellar.io`,
    assignedEmployeeIds: ['user-emp-1'],
  },
  {
    id: 'client-4',
    companyName: 'NextGen Dynamics',
    contactName: 'Grace Lee',
    contactEmail: 'grace@nextgen.com',
    status: 'Inactive',
    logo: `https://logo.clearbit.com/nextgen.com`,
    assignedEmployeeIds: ['user-emp-3'],
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Refonte du site Innovatech',
    clientId: 'client-1',
    assignedEmployeeIds: ['user-emp-1', 'user-emp-2'],
    status: ProjectStatus.IN_PROGRESS,
    description: "Refonte complète du site web principal de l'entreprise avec un nouveau CMS.",
    dueDate: '2024-08-25',
  },
  {
    id: 'proj-2',
    name: 'Campagne SEO Quantum Corp',
    clientId: 'client-2',
    assignedEmployeeIds: ['user-emp-3'],
    status: ProjectStatus.COMPLETED,
    description: 'Une stratégie SEO de 6 mois pour améliorer le classement dans les recherches organiques.',
  },
  {
    id: 'proj-3',
    name: 'Lancement de Stellar Goods sur les réseaux sociaux',
    clientId: 'client-3',
    assignedEmployeeIds: ['user-emp-1', 'user-emp-3'],
    status: ProjectStatus.NOT_STARTED,
    description: 'Lancement et gestion de la présence sur les médias sociaux sur trois plateformes.',
    dueDate: '2024-09-10',
  },
  {
    id: 'proj-4',
    name: "Développement de l'application mobile Quantum",
    clientId: 'client-2',
    assignedEmployeeIds: ['user-emp-2'],
    status: ProjectStatus.ON_HOLD,
    description: 'Développer une nouvelle application mobile destinée aux clients.',
    dueDate: '2024-10-01',
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: 'msg-1',
        projectId: 'proj-1',
        senderId: 'user-emp-1',
        text: "Bonjour l'équipe ! Démarrage du projet de refonte. Les fichiers Figma sont maintenant disponibles dans le lecteur partagé.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        readBy: ['user-emp-1'],
    },
    {
        id: 'msg-2',
        projectId: 'proj-1',
        senderId: 'user-client-1',
        text: "Merci, Alice ! Mon équipe et moi allons les examiner cet après-midi et fournir des commentaires d'ici la fin de la journée.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
        readBy: ['user-client-1'],
    },
    {
        id: 'msg-3',
        projectId: 'proj-1',
        senderId: 'user-emp-2',
        text: "Parfait. Je vais commencer à mettre en place l'environnement de développement.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
        readBy: ['user-emp-2'],
    },
    {
        id: 'msg-4',
        projectId: 'proj-2',
        senderId: 'user-emp-3',
        text: "Le rapport SEO final pour la campagne Quantum Corp a été téléchargé. Excellent travail à tous pour avoir atteint nos objectifs !",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        readBy: ['user-emp-3', 'user-client-2'],
    },
     {
        id: 'msg-5',
        projectId: 'proj-2',
        senderId: 'user-client-2',
        text: "Résultats incroyables, Charlie ! Nous sommes ravis du résultat. Veuillez nous envoyer la facture dès que vous en aurez l'occasion.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.9),
        readBy: ['user-client-2', 'user-emp-3'],
    }
];

export const MOCK_TIME_LOGS: TimeLog[] = [
  {
    id: 'tl-1',
    projectId: 'proj-1',
    employeeId: 'user-emp-1',
    date: '2024-07-15',
    hours: 4,
    description: 'Configuration initiale du projet et wireframing.',
  },
  {
    id: 'tl-2',
    projectId: 'proj-1',
    employeeId: 'user-emp-2',
    date: '2024-07-15',
    hours: 6,
    description: "Configuration de l'environnement de développement.",
  },
  {
    id: 'tl-3',
    projectId: 'proj-1',
    employeeId: 'user-emp-1',
    date: '2024-07-16',
    hours: 5,
    description: 'Revue du design Figma et planification des composants.',
  },
];

export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
  {
    id: 'al-1',
    userId: 'user-emp-1',
    action: 'a mis à jour le statut du projet',
    details: 'Refonte du site Innovatech',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'al-2',
    userId: 'user-admin-1',
    action: 'a ajouté un nouvel employé',
    details: 'Charlie Brown',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'al-3',
    userId: 'user-client-2',
    action: 'a envoyé un nouveau message dans',
    details: 'Campagne SEO Quantum Corp',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
  },
  {
    id: 'al-4',
    userId: 'user-emp-2',
    action: 'a enregistré 6.0h sur',
    details: 'Refonte du site Innovatech',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 'al-5',
    userId: 'user-emp-3',
    action: 'a terminé le projet',
    details: 'Campagne SEO Quantum Corp',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'inv-001',
        clientId: 'client-2',
        projectId: 'proj-2',
        amount: 5000,
        issueDate: '2024-07-10',
        dueDate: '2024-08-09',
        status: 'Paid',
    },
    {
        id: 'inv-002',
        clientId: 'client-1',
        projectId: 'proj-1',
        amount: 8500,
        issueDate: '2024-07-15',
        dueDate: '2024-08-14',
        status: 'Sent',
    },
    {
        id: 'inv-003',
        clientId: 'client-4',
        amount: 2500,
        issueDate: '2024-06-01',
        dueDate: '2024-07-01',
        status: 'Overdue',
    },
    {
        id: 'inv-004',
        clientId: 'client-3',
        projectId: 'proj-3',
        amount: 3200,
        issueDate: '2024-07-20',
        dueDate: '2024-08-19',
        status: 'Draft',
    }
];

export const MOCK_FILES: ProjectFile[] = [
    {
        id: 'file-1',
        projectId: 'proj-1',
        name: 'Brief_Innovatech_V2.pdf',
        type: 'PDF',
        size: '2.5 MB',
        uploadedBy: 'user-client-1',
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
        id: 'file-2',
        projectId: 'proj-1',
        name: 'Maquettes_Desktop_Finales.png',
        type: 'Image',
        size: '5.1 MB',
        uploadedBy: 'user-emp-1',
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isDeliverable: true,
    },
    {
        id: 'file-3',
        projectId: 'proj-2',
        name: 'Rapport_SEO_Quantum.docx',
        type: 'Document',
        size: '850 KB',
        uploadedBy: 'user-emp-3',
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72),
        isDeliverable: true,
    },
    {
        id: 'file-4',
        projectId: 'proj-4',
        name: 'Specs_Techniques_App.pdf',
        type: 'PDF',
        size: '1.8 MB',
        uploadedBy: 'user-emp-2',
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12),
    }
];

export const MOCK_TASKS: Task[] = [
    { id: 'task-1', projectId: 'proj-1', employeeId: 'user-emp-1', title: 'Finaliser les wireframes de la page d\'accueil', status: 'In Progress'},
    { id: 'task-2', projectId: 'proj-1', employeeId: 'user-emp-2', title: 'Mettre en place la base de données', status: 'Completed'},
    { id: 'task-3', projectId: 'proj-1', employeeId: 'user-emp-2', title: 'Développer le composant de connexion', status: 'To Do'},
    { id: 'task-4', projectId: 'proj-3', employeeId: 'user-emp-3', title: 'Planifier le calendrier de contenu pour Instagram', status: 'To Do'},
    { id: 'task-5', projectId: 'proj-4', employeeId: 'user-emp-2', title: 'Rechercher des bibliothèques de graphiques natives', status: 'In Progress'},
    { id: 'task-6', projectId: 'proj-3', employeeId: 'user-emp-1', title: 'Valider la stratégie de lancement avec le client', status: 'Completed'},
];

export const MOCK_FEEDBACK: Feedback[] = [
    {
        id: 'fb-1',
        clientId: 'client-2',
        projectId: 'proj-2',
        rating: 5,
        comment: "Excellent travail sur la campagne SEO ! Les résultats ont dépassé nos attentes. L'équipe a été très professionnelle et communicative.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    }
];

export const MOCK_PANEL_NOTIFICATIONS: PanelNotification[] = [
    {
        id: 'notif-1',
        userId: 'user-admin-1',
        projectId: 'proj-1',
        type: 'new-message',
        title: "Nouveau message d'Alice",
        description: "Les fichiers Figma sont maintenant disponibles...",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
    },
    {
        id: 'notif-2',
        userId: 'user-admin-1',
        projectId: 'proj-2',
        type: 'project-status',
        title: 'Projet Terminé',
        description: 'La campagne SEO de Quantum Corp est terminée.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: false,
    },
    {
        id: 'notif-3',
        userId: 'user-admin-1',
        projectId: 'proj-4',
        type: 'project-status',
        title: 'Projet en Attente',
        description: "L'app mobile Quantum est maintenant en attente.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        read: true,
    },
];
