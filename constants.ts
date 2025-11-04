import { User, Client, UserRole, Project, ProjectStatus, ChatMessage, TimeLog } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin',
    email: 'admin@agency.com',
    avatar: `https://i.pravatar.cc/150?u=user-admin-1`,
    role: UserRole.ADMIN,
    position: 'CEO',
  },
  {
    id: 'user-emp-1',
    name: 'Alice Johnson',
    email: 'alice.j@agency.com',
    avatar: `https://i.pravatar.cc/150?u=user-emp-1`,
    role: UserRole.EMPLOYEE,
    position: 'Project Manager',
    assignedClientIds: ['client-1', 'client-3'],
  },
  {
    id: 'user-emp-2',
    name: 'Bob Williams',
    email: 'bob.w@agency.com',
    avatar: `https://i.pravatar.cc/150?u=user-emp-2`,
    role: UserRole.EMPLOYEE,
    position: 'Lead Developer',
    assignedClientIds: ['client-1', 'client-2'],
  },
  {
    id: 'user-emp-3',
    name: 'Charlie Brown',
    email: 'charlie.b@agency.com',
    avatar: `https://i.pravatar.cc/150?u=user-emp-3`,
    role: UserRole.EMPLOYEE,
    position: 'Marketing Specialist',
    assignedClientIds: ['client-2', 'client-4'],
  },
  {
    id: 'user-client-1',
    name: 'David Miller (Client)',
    email: 'david@innovatech.com',
    avatar: `https://i.pravatar.cc/150?u=user-client-1`,
    role: UserRole.CLIENT,
  },
  {
    id: 'user-client-2',
    name: 'Emily Davis (Client)',
    email: 'emily@quantumcorp.com',
    avatar: `https://i.pravatar.cc/150?u=user-client-2`,
    role: UserRole.CLIENT,
  },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    companyName: 'Innovatech Solutions',
    contactName: 'David Miller',
    contactEmail: 'david@innovatech.com',
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
  },
  {
    id: 'proj-4',
    name: "Développement de l'application mobile Quantum",
    clientId: 'client-2',
    assignedEmployeeIds: ['user-emp-2'],
    status: ProjectStatus.ON_HOLD,
    description: 'Développer une nouvelle application mobile destinée aux clients.',
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