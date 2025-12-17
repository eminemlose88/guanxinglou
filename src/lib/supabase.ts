import { createClient } from '@supabase/supabase-js';

// Access environment variables directly since we can't use process.env in Vite client-side code securely without exposure,
// BUT for this "Secret Key" based architecture, we treat the Supabase client as a public gateway 
// and handle logic authorization via our custom keys in the DB.
// Note: In a strict production environment, database mutations should go through an API route (server-side).
// For this demo, we will use the Anon Key.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
