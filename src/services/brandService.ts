import { supabase } from '../lib/supabase';
import type { Brand, CreateInput, UpdateInput } from '../types/database';

export interface BrandWithUser extends Brand {
  users: { id: number; full_name: string; email: string; avatar_url: string | null } | null;
}
const selectUser = '*, users(id, full_name, email, avatar_url)';

export const brandService = {
  async getAll(): Promise<BrandWithUser[]> {
    const { data, error } = await supabase.from('brands').select(selectUser).order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []) as BrandWithUser[];
  },
  async getById(id: number): Promise<BrandWithUser> {
    const { data, error } = await supabase.from('brands').select(selectUser).eq('id', id).single();
    if (error) throw error;
    return data as BrandWithUser;
  },
  async getByUserId(userId: number): Promise<Brand> {
    const { data, error } = await supabase.from('brands').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data as Brand;
  },
  async create(input: CreateInput<Brand>): Promise<Brand> {
    const { data, error } = await supabase.from('brands').insert(input).select().single();
    if (error) throw error;
    return data as Brand;
  },
  async update(id: number, input: UpdateInput<Brand>): Promise<Brand> {
    const { data, error } = await supabase.from('brands').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Brand;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) throw error;
  },
};
