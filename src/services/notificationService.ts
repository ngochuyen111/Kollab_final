import { supabase } from '../lib/supabase';
export class NotificationSetupError extends Error {
  constructor() {
    super('Chưa tìm thấy bảng/cột thông báo. Chạy supabase/enhancements.sql, cấu hình quyền truy cập theo README_UPGRADE.md, rồi bấm Làm mới.');
    this.name = 'NotificationSetupError';
  }
}
export interface AppNotification { id: string; user_id: number; title: string; body: string; target_view: string; created_at: string; read_at: string | null }
export const notificationService = {
  async list(userId: number): Promise<{ items: AppNotification[]; unread: number }> {
    const list = await supabase.from('notifications').select('id,user_id,title,body,target_view,created_at,read_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (list.error) {
      if (['PGRST205', 'PGRST204', '42P01', '42703'].includes(list.error.code)) throw new NotificationSetupError();
      throw list.error;
    }
    // Do not make another request when the relation is missing.
    const count = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('read_at', null);
    if (count.error) throw count.error;
    return { items: (list.data ?? []) as AppNotification[], unread: count.count ?? 0 };
  },
  async read(userId: number, id?: string): Promise<void> {
    let query = supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
    if (id) query = query.eq('id', id);
    const { error } = await query; if (error) throw error;
  },
};
