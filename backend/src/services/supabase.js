import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper functions for common operations
export const supabaseService = {
  supabase,
  // Get user data
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Generic get all with user filter
  async getAll(table, userId) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Generic get by id
  async getById(table, id, userId) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Generic create
  async create(table, data, userId) {
    const { data: result, error } = await supabase
      .from(table)
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  // Generic update
  async update(table, id, data, userId) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  // Generic delete
  async delete(table, id, userId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
  }
};



