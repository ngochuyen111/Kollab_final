import { supabase } from '../lib/supabase';
import type { AppUser, UserRole } from '../types/database';
import { insertWithSafeId } from './safeInsert';

export interface CreateUserInput {
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar_url: string | null;
  status: string;
}

export const userService = {
  async getAll(): Promise<AppUser[]> {
    const { data, error } = await supabase.from('users').select('id, full_name, email, role, avatar_url, status, created_at').order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []) as AppUser[];
  },
  async getById(id: number): Promise<AppUser> {
    const { data, error } = await supabase.from('users').select('id, full_name, email, role, avatar_url, status, created_at').eq('id', id).single();
    if (error) throw error;
    return data as AppUser;
  },
  async create(input: CreateUserInput): Promise<AppUser> {
    return insertWithSafeId<AppUser>('users', { ...input, email: input.email.trim().toLowerCase() });
  },
  async update(id: number, input: Partial<CreateUserInput>): Promise<AppUser> {
    const { data, error } = await supabase.from('users').update(input).eq('id', id).select('id, full_name, email, role, avatar_url, status, created_at').single();
    if (error) throw error;
    return data as AppUser;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },
};
