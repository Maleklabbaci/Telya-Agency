

export enum UserRole {
  ADMIN = 'Admin',
  EMPLOYEE = 'Employee',
  CLIENT = 'Client'
}

export enum ProjectStatus {
  NOT_STARTED = 'Non commencé',
  IN_PROGRESS = 'En cours',
  COMPLETED = 'Terminé',
  ON_HOLD = 'En attente',
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  assignedEmployeeIds: string[];
  status: ProjectStatus;
  description: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  status: 'Active' | 'Inactive' | 'Onboarding';
  logo: string;
  assignedEmployeeIds: string[];
}

export interface User {
  id:string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  position?: string; // For employees
  assignedClientIds?: string[]; // For employees
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  readBy: string[];
}

export enum ToastNotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

export interface ToastNotification {
  id: string;
  type: ToastNotificationType;
  title: string;
  message: string;
}

export interface PanelNotification {
    id: string;
    userId: string; // The user who should see this notification
    projectId: string;
    type: 'project-status' | 'new-message';
    title: string;
    description: string;
    timestamp: Date;
    read: boolean;
}

export interface TimeLog {
  id: string;
  projectId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  description: string;
}

export interface ActiveTimer {
  projectId: string;
  employeeId: string;
  startTime: number; // Date.now() timestamp
}