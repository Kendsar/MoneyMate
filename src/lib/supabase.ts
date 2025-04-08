import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Enhanced validation of environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase Configuration Error:', {
      url: supabaseUrl ? 'Present' : 'Missing',
      key: supabaseAnonKey ? 'Present' : 'Missing'
    });
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }

  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Enable PKCE flow for enhanced security
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js/2.x'
        }
      }
    });

    // Verify the client was created successfully
    if (!supabaseInstance) {
      throw new Error('Failed to initialize Supabase client');
    }

    return supabaseInstance;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    throw new Error('Failed to initialize Supabase client. Please check your configuration.');
  }
};

export const supabase = getSupabaseClient();

// Add a health check function to verify connection
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('health_check').select('count').single();
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to perform Supabase health check:', error);
    return false;
  }
};