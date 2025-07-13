import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env and EAS config.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string, userType: 'customer' | 'vendor') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string>;
  signInWithGoogle: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await fetchUserProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') throw new Error('User profile not found.');
        throw error;
      }

      setUser(data);
    } catch (error) {
      await supabase.auth.signOut();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email.');
      } else {
        throw new Error(error.message);
      }
    }

    if (!data.user) throw new Error('Sign in failed - no user returned.');

    // 🧠 Fetch user profile from your `users` table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    setUser(profile);
    return profile; // ✅ Return full user
  } catch (error) {
    throw error;
  }
};


  const signUp = async (email: string, password: string, name: string, userType: 'customer' | 'vendor') => {
    try {
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      if (!name.trim()) throw new Error('Name is required.');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('No user returned.');

      await new Promise(res => setTimeout(res, 2000));

      const { data: profileData, error: profileError } = await supabase
        .rpc('create_user_profile', {
          user_id: authData.user.id,
          user_email: email.trim().toLowerCase(),
          user_name: name.trim(),
          user_type: userType,
        });

      if (profileError) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email.trim().toLowerCase(),
            name: name.trim(),
            user_type: userType,
          })
          .select()
          .single();

        if (fallbackError) {
          await supabase.auth.signOut();
          throw new Error('Failed to create user profile.');
        }

        setUser(fallbackData);
        setLoading(false);
        return;
      }

      const { data: completeProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (fetchError) throw new Error('Profile created but fetch failed.');
      setUser(completeProfile);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setUser(data);
  };

  
 const uploadAvatar = async (uri: string): Promise<string> => {
  if (!user) throw new Error('No user logged in');

  try {
    //console.log('🔄 Starting avatar upload for URI:', uri);
    
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatar-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const file = {
      uri,
      name: fileName,
      type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    };

    const formData = new FormData();
    formData.append('file', file as any);

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, formData, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Optionally update user profile
    await supabase.from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    return publicUrl;
  } catch (err) {
    console.error('❌ Avatar upload error:', err);
    throw err;
  }
};

  const signInWithGoogle = async () => {
  try {
    setLoading(true);

    const redirectUrl = makeRedirectUri(); // ✅ Expo Go proxy URL

    console.log('🔗 Redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;

    if (Platform.OS !== 'web') {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

          if (sessionError) throw sessionError;

          if (sessionData.user) {
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', sessionData.user.id)
              .single();

            if (fetchError && fetchError.code === 'PGRST116') {
              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                  id: sessionData.user.id,
                  email: sessionData.user.email || '',
                  name:
                    sessionData.user.user_metadata?.full_name ||
                    sessionData.user.email?.split('@')[0] ||
                    'User',
                  avatar_url: sessionData.user.user_metadata?.avatar_url,
                  user_type: 'customer',
                })
                .select()
                .single();

              if (createError) throw createError;
              setUser(newUser);
              return newUser;
            } else if (existingUser) {
              setUser(existingUser);
              return existingUser;
            }
          }
        }
      }
    } else {
      console.log('🌐 Opening OAuth URL for web:', data.url);
    }

    throw new Error('Google sign-in failed');
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        uploadAvatar,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
