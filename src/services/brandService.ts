import { supabase } from '../lib/supabase';
import { insertWithSafeId } from './safeInsert';
import type { Brand, CreateInput, UpdateInput } from '../types/database';

export interface BrandWithUser extends Brand {
  users: { id: number; full_name: string; email: string; avatar_url: string | null } | null;
}
const selectUser = '*, users(id, full_name, email, avatar_url)';

export interface BrandAccountInput { full_name: string; email: string; password: string; brand_name: string; industry: string; description: string; website_url: string; logo_url: string }

export const brandService = {
  async createAccount(adminId: number, input: BrandAccountInput): Promise<number> {
    const { data, error } = await supabase.rpc('create_brand_account', {
      p_admin_id: adminId, p_full_name: input.full_name.trim(), p_email: input.email.trim().toLowerCase(),
      p_password: input.password, p_brand_name: input.brand_name.trim(), p_industry: input.industry || null,
      p_description: input.description || null, p_website: input.website_url || null, p_logo: input.logo_url || null,
    });
    if (error) {
      if (error.code === '23505') throw new Error('Email đã được sử dụng.');
      if (error.code === 'PGRST202') throw new Error('Hãy chạy supabase/enhancements.sql để bật tính năng tạo Brand.');
      throw error;
    }
    return Number(data);
  },
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
    return insertWithSafeId<Brand>('brands', input);
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
