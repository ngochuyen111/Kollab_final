import { supabase } from '../lib/supabase';
import type { CreateInput, KolProfile, KolWithUser, UpdateInput } from '../types/database';

const selectUser = '*, users(id, full_name, email, avatar_url, role)';

export const kolService = {
  async getAll(): Promise<KolWithUser[]> {
    const { data, error } = await supabase.from('kol_profiles').select(selectUser).order('followers', { ascending: false });
    if (error) throw error;
    return (data ?? []) as KolWithUser[];
  },
  getAllKOLs() { return this.getAll(); },
  async getById(id: number): Promise<KolWithUser> {
    const { data, error } = await supabase.from('kol_profiles').select(selectUser).eq('id', id).single();
    if (error) throw error;
    return data as KolWithUser;
  },
  getProfile(id: number) { return this.getById(id); },
  async getByUserId(userId: number): Promise<KolWithUser> {
    const { data, error } = await supabase.from('kol_profiles').select(selectUser).eq('user_id', userId).single();
    if (error) throw error;
    return data as KolWithUser;
  },
  async create(input: CreateInput<KolProfile>): Promise<KolProfile> {
    const { data, error } = await supabase.from('kol_profiles').insert(input).select().single();
    if (error) throw error;
    return data as KolProfile;
  },
  async update(id: number, input: UpdateInput<KolProfile>): Promise<KolProfile> {
    const { data, error } = await supabase.from('kol_profiles').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as KolProfile;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('kol_profiles').delete().eq('id', id);
    if (error) throw error;
  },
};
