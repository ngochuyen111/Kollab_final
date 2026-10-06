import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, RefreshCw, X } from 'lucide-react';
import { notificationService, NotificationSetupError, type AppNotification } from '../services/notificationService';
import { getErrorMessage } from '../constants/domain';
export function NotificationBell({ userId, onNavigate }: { userId: number; onNavigate: (view: string) => void }) {
  const [open, setOpen] = useState(false); const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const setupBlocked = useRef(false);
  const inFlight = useRef(false);
  const load = useCallback(async (force = false) => {
    if (inFlight.current || setupBlocked.current && !force) return;
    inFlight.current = true;
    try { setLoading(true); const data = await notificationService.list(userId); setupBlocked.current = false; setItems(data.items); setUnread(data.unread); setError(''); }
    catch (e) { if (e instanceof NotificationSetupError) { setupBlocked.current = true; setItems([]); setUnread(0); } setError(getErrorMessage(e)); }
    finally { inFlight.current = false; setLoading(false); }
  }, [userId]);
  useEffect(() => { let active = true; const poll = () => { if (active && !document.hidden) void load(); }; poll(); const timer = setInterval(poll, 20000); window.addEventListener('focus', poll); window.addEventListener('kollab:refresh', poll); return () => { active = false; clearInterval(timer); window.removeEventListener('focus', poll); window.removeEventListener('kollab:refresh', poll); }; }, [load]);
  useEffect(() => { const dismiss = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; document.addEventListener('mousedown', dismiss); document.addEventListener('keydown', escape); return () => { document.removeEventListener('mousedown', dismiss); document.removeEventListener('keydown', escape); }; }, []);
  const read = async (item?: AppNotification) => {
    try { await notificationService.read(userId, item?.id); await load(); if (item) { setOpen(false); onNavigate(item.target_view); } }
    catch (e) { setError(getErrorMessage(e)); }
  };
  return <div ref={ref} className="relative"><button aria-label="Thông báo" aria-expanded={open} className="btn-ghost p-2 relative" onClick={() => { setOpen(v => !v); void load(); }}><Bell className="w-5 h-5" />{unread > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[10px] min-w-4 px-1">{unread > 99 ? '99+' : unread}</span>}</button>{open && <div className="fixed sm:absolute top-16 sm:top-12 left-3 right-3 sm:left-auto sm:right-0 sm:w-96 card-base shadow-panel z-[70] overflow-hidden"><div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-bold">Thông báo <span className="text-xs text-slate-400">({unread} chưa đọc)</span></h3><button aria-label="Đóng thông báo" onClick={() => setOpen(false)}><X className="w-4 h-4" /></button></div><div className="flex justify-between px-4 py-2 text-xs"><button className="text-teal-600 flex gap-1 items-center" onClick={() => void read()} disabled={loading || !unread}><CheckCheck className="w-3 h-3" />Đọc tất cả</button><button onClick={() => void load(true)} className="text-slate-500 flex gap-1 items-center"><RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />Làm mới</button></div>{error && <p role="alert" className="text-sm text-red-500 p-4">{error}</p>}<div className="max-h-96 overflow-y-auto">{items.map(item => <button key={item.id} onClick={() => void read(item)} className={`w-full text-left p-4 border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 ${!item.read_at ? 'bg-teal-50/60 dark:bg-teal-950/20' : ''}`}><p className="font-semibold text-sm">{item.title}{!item.read_at && <span className="ml-2 inline-block rounded-full w-1.5 h-1.5 bg-teal-500" />}</p><p className="text-xs text-slate-500 mt-1">{item.body}</p><p className="text-[10px] text-slate-400 mt-2">{new Date(item.created_at).toLocaleString('vi-VN')}</p></button>)}{!items.length && !error && <p className="py-10 text-center text-sm text-slate-400">{loading ? 'Đang tải…' : 'Chưa có thông báo mới.'}</p>}</div></div>}</div>;
}
