'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('¡Bienvenido de nuevo!');
      return { success: true, data };
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
      return { success: false, error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      full_name: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      postal_code: string;
    }
  ) => {
    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // Crear perfil
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        ...userData,
      });

      if (profileError) throw profileError;

      toast.success('¡Cuenta creada exitosamente! Por favor verifica tu email.');
      return { success: true, data: authData };
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse');
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Sesión cerrada');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Error al cerrar sesión');
      return { success: false, error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { success: false, error: 'No autenticado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Actualizar estado local
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Perfil actualizado');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar perfil');
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      toast.success('Revisa tu email para restablecer tu contraseña');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar email');
      return { success: false, error };
    }
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin ?? false,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
  };
}

