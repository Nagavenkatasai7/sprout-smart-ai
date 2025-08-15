import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { isValidEmail, validatePassword, rateLimiter } from '@/lib/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, fullName?: string) => {
    // Rate limiting check
    if (!rateLimiter.isAllowed(`signup-${email}`, 3, 300000)) { // 3 attempts per 5 minutes
      return { error: { message: 'Too many signup attempts. Please try again later.' } };
    }

    // Input validation
    if (!isValidEmail(email)) {
      return { error: { message: 'Please enter a valid email address.' } };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { error: { message: passwordValidation.message } };
    }

    if (!username || username.trim().length < 2) {
      return { error: { message: 'Username must be at least 2 characters long.' } };
    }

    // Sanitize username input
    const sanitizedUsername = username.trim().replace(/[<>"/\\]/g, '').substring(0, 50);
    const sanitizedFullName = fullName?.trim().replace(/[<>"/\\]/g, '').substring(0, 100) || '';

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: sanitizedUsername,
          full_name: sanitizedFullName,
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    if (!rateLimiter.isAllowed(`signin-${email}`, 5, 900000)) { // 5 attempts per 15 minutes
      return { error: { message: 'Too many login attempts. Please try again later.' } };
    }

    // Input validation
    if (!isValidEmail(email)) {
      return { error: { message: 'Please enter a valid email address.' } };
    }

    if (!password || password.length < 1) {
      return { error: { message: 'Password is required.' } };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};