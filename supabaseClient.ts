import { createClient } from '@supabase/supabase-js'

// Fix: Explicitly type as string to avoid literal type inference causing comparison errors.
const supabaseUrl: string = 'https://ejxtfubbssrvoyabybzj.supabase.co';
// Fix: Explicitly type as string to avoid literal type inference causing comparison errors.
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqeHRmdWJic3Nydm95YWJ5YnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzk4NjMsImV4cCI6MjA3Nzg1NTg2M30.UmuZgFXTsX3jaUfWLkF9FjGSEXQ3dZx6KUEsowfzkM0';

export const isSupabaseConfigured = supabaseUrl && supabaseUrl !== 'VOTRE_URL_SUPABASE' && supabaseAnonKey && supabaseAnonKey !== 'VOTRE_CLE_ANON_SUPABASE';

if (!isSupabaseConfigured) {
    console.warn(
      `--------------------------------------------------\n` +
      `ATTENTION: Les informations de Supabase ne sont pas configurées.\n` +
      `Veuillez mettre à jour les valeurs directement dans le fichier supabaseClient.ts.\n` +
      `L'application affichera un écran de configuration jusqu'à ce que cela soit fait.\n` +
      `--------------------------------------------------`
    );
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;