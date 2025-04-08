import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, UserInsert } from '../types/supabase';

type AuthContextType = {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{
    error: Error | null;
    data: { user: SupabaseUser | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use refs to track initialization state and prevent duplicate calls
  const isInitialized = useRef(false);
  const profileFetchInProgress = useRef(false);

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      // Prevent duplicate calls
      if (profileFetchInProgress.current) return null;
      profileFetchInProgress.current = true;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      profileFetchInProgress.current = false;
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      profileFetchInProgress.current = false;
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Create a new user profile
  const createProfile = async (userData: UserInsert) => {
    try {
      // First check if profile already exists to avoid duplicate creation attempts
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.id)
        .single();
        
      if (existingProfile) {
        return existingProfile as User;
      }
      
      // Create new profile if it doesn't exist
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Add a small delay to ensure the database has time to create the user record
          // This is especially important after signup
          setTimeout(async () => {
            const userProfile = await fetchProfile(session.user.id);
            
            // If profile doesn't exist, create it
            if (!userProfile) {
              const newProfile = await createProfile({
                id: session.user.id,
                email: session.user.email!,
                currency: 'TND',
              });
              setProfile(newProfile);
            } else {
              setProfile(userProfile);
            }
            setLoading(false);
          }, 1000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Add a small delay to ensure the database has time to create the user record
        // This is especially important after signup
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
          setTimeout(async () => {
            const userProfile = await fetchProfile(session.user!.id);
            
            // If profile doesn't exist, create it
            if (!userProfile) {
              const newProfile = await createProfile({
                id: session.user!.id,
                email: session.user!.email!,
                currency: 'TND',
              });
              setProfile(newProfile);
            } else {
              setProfile(userProfile);
            }
            setLoading(false);
          }, 1000);
        } else {
          const userProfile = await fetchProfile(session.user.id);
          
          // If profile doesn't exist, create it
          if (!userProfile) {
            const newProfile = await createProfile({
              id: session.user.id,
              email: session.user.email!,
              currency: 'TND',
            });
            setProfile(newProfile);
          } else {
            setProfile(userProfile);
          }
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { data: data.session, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
          },
        },
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (checkError) {
        // If profile doesn't exist, create it
        if (checkError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              id: user.id,
              email: user.email!,
              ...updates
            }])
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setProfile(newProfile as User);
          return { data: newProfile as User, error: null };
        }
        throw checkError;
      }

      // Update existing profile
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as User);
      return { data: data as User, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error as Error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};