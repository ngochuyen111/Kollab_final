import { supabase } from '../lib/supabase';
import type { AppUser } from '../types/database';

const STORAGE_KEY = 'kollab_current_user';
const safeUserColumns = 'id, full_name, email, role, avatar_url, status, created_at';

export const authService = {
  async login(email: string, password: string): Promise<AppUser> {
    const { data, error } = await supabase.from('users').select(`${safeUserColumns}, password_hash`)
      .eq('email', email.trim().toLowerCase()).eq('password_hash', password).eq('status', 'ACTIVE').single();
    if (error || !data) throw new Error('Email hoặc mật khẩu không đúng.');
    const { password_hash: passwordHash, ...user } = data as AppUser & { password_hash: string };
    void passwordHash;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },
  logout(): void { localStorage.removeItem(STORAGE_KEY); },
  getCurrentUser(): AppUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AppUser; } catch { localStorage.removeItem(STORAGE_KEY); return null; }
  },
};
