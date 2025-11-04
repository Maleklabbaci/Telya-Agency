

export enum UserRole {
  ADMIN = 'Admin',
  EMPLOYEE = 'Employee',
  CLIENT = 'Client'
}

export type View = 
  // Admin
  | 'dashboard' | 'projects' | 'team' | 'messages' | 'reports' | 'billing' | 'ai-insights' | 'files' | 'settings' | 'activity-log'
  // Employee
  | 'my-projects' | 'my-tasks' | 'calendar' | 'time-tracking' | 'project-files' | 'my-performance' | 'profile'
  // Client
  | 'client-dashboard' | 'client-projects' | 'support' | 'deliverables' | 'client-billing' | 'feedback' | 'client-profile'
  // Common
  | 'login';


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
  dueDate?: string; // YYYY-MM-DD for calendar view
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
  activityStatus?: 'online' | 'offline' | 'paused';
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
    type: 'project-status' | 'new-message' | 'new-task' | 'new-file' | 'new-feedback';
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

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details?: string;
}

export interface Invoice {
    id: string;
    clientId: string;
    projectId?: string;
    amount: number;
    issueDate: string; // YYYY-MM-DD
    dueDate: string; // YYYY-MM-DD
    status: 'Paid' | 'Sent' | 'Draft' | 'Overdue';
}

export interface ProjectFile {
    id: string;
    projectId: string;
    name: string;
    type: 'PDF' | 'Image' | 'Document' | 'Spreadsheet' | 'Other';
    size: string; // e.g., "1.2 MB"
    uploadedBy: string; // userId
    lastModified: Date;
    isDeliverable?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  employeeId: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Completed';
}

export interface Feedback {
  id: string;
  clientId: string;
  projectId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: Date;
}