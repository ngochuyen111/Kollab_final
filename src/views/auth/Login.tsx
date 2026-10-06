import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Eye, EyeOff, Mail, LockKeyhole, Sparkles, Users, BarChart3, Briefcase, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../constants/domain';
import type { AppUser } from '../../types/database';
export function Login({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try { setLoading(true); setError(''); onLogin(await authService.login(email, password)); }
    catch (caught) { setError(getErrorMessage(caught)); } finally { setLoading(false); }
  };
  return <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
    <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-[#073f3a] text-white">
      <div className="absolute w-[480px] h-[480px] rounded-full bg-teal-400/10 -right-56 -top-32" /><div className="absolute w-[450px] h-[450px] rounded-full border border-teal-200/10 -left-48 bottom-0" />
      <div className="relative flex items-center gap-3"><div className="bg-white rounded-2xl p-2"><Logo className="w-8 h-10" /></div><span className="font-display text-xl font-extrabold tracking-wide">KOLLAB</span></div>
      <div className="relative max-w-lg py-12"><span className="inline-flex gap-2 items-center rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-medium text-teal-100"><Sparkles className="w-4 h-4" />Kết nối sáng tạo. Tạo nên kết quả.</span><h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight mt-6">Mỗi cộng tác,<br />một bước tiến <span className="text-teal-300">cho thương hiệu.</span></h1><p className="text-teal-100/70 text-base leading-relaxed mt-6">Cùng Brand và Creator quản lý chiến dịch, xây dựng nội dung và theo dõi hiệu quả trên một nền tảng.</p>
        <div className="mt-10 rounded-2xl bg-white/[0.06] border border-white/15 p-5 backdrop-blur-md"><div className="flex justify-between items-center mb-5"><p className="text-sm font-semibold">Từ ý tưởng đến kết quả</p><BarChart3 className="w-5 h-5 text-teal-300" /></div><div className="space-y-3">{['Brand xây dựng chiến dịch', 'Creator sáng tạo & xuất bản', 'Xác minh hiệu suất & thanh toán'].map((text, i) => <div key={text} className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-teal-300/15 text-teal-200 flex items-center justify-center text-xs font-bold">{i === 2 ? <Check className="w-4 h-4" /> : `0${i + 1}`}</span><span className="text-sm text-teal-50/90">{text}</span></div>)}</div></div>
      </div><p className="relative text-xs text-teal-100/50">Influencer marketing · Một workspace cho cả đội ngũ</p>
    </section>
    <section className="flex items-center justify-center px-6 py-12 sm:px-12"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="flex items-center gap-3 lg:hidden mb-12"><Logo /><span className="font-display text-xl font-bold">KOLLAB</span></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 mb-3">Chào mừng trở lại</p><h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Đăng nhập workspace</h2><p className="text-slate-500 mt-3 text-sm">Tiếp tục chiến dịch và các cộng tác của bạn.</p>
      <form onSubmit={submit} className="space-y-5 mt-9"><div><label htmlFor="login-email" className="input-label">Email</label><div className="relative"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" /><input id="login-email" className="input-base pl-11 py-3" placeholder="ban@thuonghieu.com" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></div></div><div><label htmlFor="login-password" className="input-label">Mật khẩu</label><div className="relative"><LockKeyhole className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" /><input id="login-password" className="input-base pl-11 pr-12 py-3" placeholder="Nhập mật khẩu của bạn" type={visible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /><button aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} type="button" className="absolute right-4 top-3.5 text-slate-400" onClick={() => setVisible(v => !v)}>{visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>{error && <p role="alert" className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">{error}</p>}<button disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60" type="submit">{loading ? 'Đang đăng nhập…' : 'Đăng nhập'}<ArrowRight className="w-4 h-4" /></button></form>
      <p className="text-xs text-slate-400 text-center mt-6">Cần tài khoản? Liên hệ Admin hoặc Brand quản lý của bạn.</p><div className="border-t border-slate-100 dark:border-slate-800 mt-10 pt-6 flex justify-center gap-6 text-xs text-slate-400"><span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />Brand</span><span className="flex items-center gap-1"><Users className="w-3 h-3" />Creator</span><span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Admin</span></div>
    </motion.div></section>
  </div>;
}
