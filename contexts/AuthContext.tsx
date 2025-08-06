import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, nickname: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchUserProfile(user.id);
      setProfile(profileData);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // テスト環境での動作確認用
      if (process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co') {
        console.log('テスト環境: ログイン機能はSupabase接続後に利用可能です');
        return { error: 'テスト環境: Supabaseの設定が必要です' };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'ネットワークエラーが発生しました' };
    }
  };

  const signUp = async (email: string, password: string, nickname: string) => {
    try {
      console.log('SignUp started with:', { email, nickname });
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

      // テスト環境での動作確認用
      if (process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co') {
        console.log('テスト環境: 新規登録機能はSupabase接続後に利用可能です');
        return { error: 'テスト環境: Supabaseの設定が必要です' };
      }

      console.log('Calling supabase.auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('SignUp response:', { data, error });

      if (error) {
        console.error('Auth signUp error:', error);
        return { error: error.message };
      }

      // Create user profile
      if (data.user) {
        console.log('Creating user profile for:', data.user.id);
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email,
              nickname,
              role: 'user',
              total_points: 0,
            },
          ]);

        console.log('Profile creation result:', { profileError });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: 'ユーザープロフィールの作成に失敗しました: ' + profileError.message };
        }
      }

      console.log('SignUp completed successfully');
      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'ネットワークエラーが発生しました: ' + (error as Error).message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};