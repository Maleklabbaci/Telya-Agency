/**
 * Ce fichier centralise le mappage entre les noms de propriétés de notre application (camelCase)
 * et les noms de colonnes de la base de données Supabase (snake_case).
 * 
 * SI VOUS RENCONTREZ UNE ERREUR "Could not find the '...' column", C'EST ICI QUE VOUS DEVEZ LA CORRIGER.
 * Modifiez simplement la chaîne de caractères correspondante au nom exact de la colonne dans votre table Supabase.
 */

// Table: clients
// Mappe la propriété `assignedEmployeeIds` dans le type `Client`.
export const CLIENTS_EMPLOYEES_COLUMN = 'assigned_employee_ids';

// Table: users
// Mappe la propriété `assignedClientIds` dans le type `User`.
export const USERS_CLIENTS_COLUMN = 'assigned_client_ids';
