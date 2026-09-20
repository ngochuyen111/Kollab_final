import { supabase } from '../lib/supabase';
import type { AppUser, KolWithUser } from '../types/database';

export const profileService = {
  async getUserProfile(userId: number): Promise<AppUser> {
    const { data, error } = await supabase.from('users').select('id, full_name, email, role, avatar_url, status, created_at').eq('id', userId).single();
    if (error) throw error;
    return data as AppUser;
  },
  async getKOLProfileByUser(userId: number): Promise<KolWithUser> {
    const { data, error } = await supabase.from('kol_profiles').select('*, users(id, full_name, email, avatar_url, role)').eq('user_id', userId).single();
    if (error) throw error;
    return data as KolWithUser;
  },
};
