import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const authService = {
  async signIn(email, password) {
    if (!supabase) throw new Error('Supabase não configurado corretamente');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signUp(email, password, options = {}) {
    if (!supabase) throw new Error('Supabase não configurado corretamente');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options.userMetadata || {},
        emailRedirectTo: options.emailRedirectTo || window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },
  async signOut() {
    if (supabase) await supabase.auth.signOut();
  },
  async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
  async getUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  onAuthStateChange(callback) {
    if (!supabase) return () => {};
    return supabase.auth.onAuthStateChange(callback);
  }
};
