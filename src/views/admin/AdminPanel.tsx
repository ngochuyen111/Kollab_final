import { emptyFilters } from '../../constants/filters';
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Activity, Briefcase, CreditCard, Package, Users, Plus, Eye } from 'lucide-react';
import { Button, KPIWidget, Modal, SectionHeader, tableStyles } from '../../components/SharedUI';
import { ImageUpload } from '../../components/ImageUpload';
import { FilterBar } from '../../components/FilterBar';
import { CampaignOutcome } from '../brand/CampaignOutcome';
import { brandService, type BrandWithUser } from '../../services/brandService';
import { campaignService } from '../../services/campaignService';
import { kolService } from '../../services/kolService';
import { taskService } from '../../services/taskService';
import { paymentService, type PaymentWithRelations } from '../../services/paymentService';
import { productService } from '../../services/productService';
import { campaignStatusLabels, formatCurrency, formatDate, getErrorMessage, paymentStatusLabels, statusBadgeClass } from '../../constants/domain';
import type { AppUser, CampaignWithRelations, KolWithUser, Product, TaskWithRelations } from '../../types/database';
interface Props { initialView?: string; user: AppUser }
export function AdminDashboard({ initialView = 'dashboard', user }: Props) {
  const [brands, setBrands] = useState<BrandWithUser[]>([]); const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([]);
  const [creators, setCreators] = useState<KolWithUser[]>([]); const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]); const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [filters, setFilters] = useState({ ...emptyFilters }); const [createOpen, setCreateOpen] = useState(false);
  const [outcome, setOutcome] = useState<CampaignWithRelations | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(''); const [b, c, k, p, pay, taskRows] = await Promise.all([brandService.getAll(), campaignService.getAll(), kolService.getAll(), productService.getAll(), paymentService.getAll(), taskService.getAll()]); setBrands(b); setCampaigns(c); setCreators(k); setProducts(p); setPayments(pay); setTasks(taskRows); }
    catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); window.addEventListener('kollab:refresh', load); return () => window.removeEventListener('kollab:refresh', load); }, [load]);
  const paid = useMemo(() => payments.reduce((sum, p) => sum + Number(p.paid_amount), 0), [payments]);
  const match = (text: string, status?: string) => text.toLocaleLowerCase('vi').includes(filters.query.trim().toLocaleLowerCase('vi')) && (!filters.status || status === filters.status);
  const filteredBrands = brands.filter(b => match(`${b.brand_name} ${b.users?.full_name} ${b.users?.email} ${b.industry}`, b.status));
  const filteredCampaigns = campaigns.filter(c => match(`${c.campaign_name} ${c.brands?.brand_name} ${c.products?.product_name}`, c.status));
  const filteredCreators = creators.filter(k => match(`${k.users?.full_name} ${k.users?.email} ${k.platform} ${k.content_category}`, k.users?.role));
  const filteredPayments = payments.filter(p => match(`${p.kol_profiles?.users?.full_name} ${p.brands?.brand_name} ${p.campaign_tasks?.campaigns?.campaign_name}`, p.status));
  const statuses = initialView === 'campaigns' ? campaignStatusLabels : initialView === 'payments' ? paymentStatusLabels : initialView === 'creators' ? { KOL: 'KOL', KOC: 'KOC' } : { ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động' };
  if (loading) return <div className="skeleton h-96" />;
  if (error) return <div className="badge-danger p-4">{error}<button onClick={() => void load()} className="ml-3 underline">Tải lại</button></div>;
  return <div className="space-y-5">
    {initialView !== 'dashboard' && <FilterBar value={filters} onChange={setFilters} statuses={Object.entries(statuses).map(([value, label]) => ({ value, label }))} />}
    {initialView === 'brands' && <EntityTable title="Quản lý Brand" action={<Button role="admin" onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>Tạo tài khoản Brand</Button>} headers={['Brand', 'Người phụ trách', 'Email đăng nhập', 'Ngành', 'Trạng thái']} rows={filteredBrands.map(b => [b.brand_name, b.users?.full_name ?? '—', b.users?.email ?? '—', b.industry ?? '—', b.status])} />}
    {initialView === 'campaigns' && <EntityTable title="Chiến dịch toàn hệ thống" headers={['Chiến dịch', 'Brand', 'Sản phẩm', 'Kết thúc', 'Trạng thái', 'Outcome']} rows={filteredCampaigns.map(c => [c.campaign_name, c.brands?.brand_name ?? '—', c.products?.product_name ?? '—', formatDate(c.end_date), <span className={statusBadgeClass(c.status)}>{campaignStatusLabels[c.status]}</span>, <Button size="xs" variant="secondary" onClick={() => setOutcome(c)} icon={<Eye className="w-3 h-3" />}>Kết quả</Button>])} />}
    {initialView === 'creators' && <EntityTable title="KOL/KOC" headers={['Họ tên', 'Email', 'Vai trò', 'Nền tảng', 'Followers', 'Chuyên mục']} rows={filteredCreators.map(k => [k.users?.full_name ?? '—', k.users?.email ?? '—', k.users?.role ?? '—', k.platform ?? '—', k.followers.toLocaleString(), k.content_category ?? '—'])} />}
    {initialView === 'payments' && <EntityTable title="Thanh toán toàn hệ thống" headers={['KOL/KOC', 'Brand / Chiến dịch', 'Số tiền', 'Đã trả', 'Trạng thái']} rows={filteredPayments.map(p => [p.kol_profiles?.users?.full_name ?? '—', `${p.brands?.brand_name} / ${p.campaign_tasks?.campaigns?.campaign_name}`, formatCurrency(p.amount), formatCurrency(p.paid_amount), paymentStatusLabels[p.status]])} />}
    {initialView === 'dashboard' && <><SectionHeader title="Tổng quan hệ thống" subtitle="Giám sát thương hiệu, creator và kết quả chiến dịch" action={<Button role="admin" onClick={() => setCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>Tạo Brand</Button>} /><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"><KPIWidget role="admin" label="Brands" value={String(brands.length)} icon={<Briefcase className="w-4 h-4" />} /><KPIWidget role="admin" label="Sản phẩm" value={String(products.length)} icon={<Package className="w-4 h-4" />} /><KPIWidget role="admin" label="Chiến dịch" value={String(campaigns.length)} icon={<Activity className="w-4 h-4" />} /><KPIWidget role="admin" label="KOL/KOC" value={String(creators.length)} icon={<Users className="w-4 h-4" />} /><KPIWidget role="admin" label="Đã thanh toán" value={formatCurrency(paid)} icon={<CreditCard className="w-4 h-4" />} /></div><EntityTable title="Chiến dịch gần đây" headers={['Chiến dịch', 'Brand', 'Sản phẩm', 'Trạng thái']} rows={campaigns.slice(0, 8).map(c => [c.campaign_name, c.brands?.brand_name ?? '—', c.products?.product_name ?? '—', c.status])} /></>}
    <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Tạo tài khoản Brand">{createOpen && <BrandAccountForm adminId={user.id} reload={load} close={() => setCreateOpen(false)} />}</Modal>
    <Modal isOpen={!!outcome} onClose={() => setOutcome(null)} title="Kết quả chiến dịch" width="max-w-6xl">{outcome && <CampaignOutcome campaign={outcome} tasks={tasks} />}</Modal>
  </div>;
}
function BrandAccountForm({ adminId, reload, close }: { adminId: number; reload: () => Promise<void>; close: () => void }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', brand_name: '', industry: '', description: '', website_url: '', logo_url: '' });
  const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false); const [error, setError] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); try { setSaving(true); setError(''); await brandService.createAccount(adminId, form); await reload(); close(); } catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); } };
  return <form onSubmit={submit} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4">{([
    ['full_name', 'Người phụ trách *', 'text'], ['brand_name', 'Tên Brand *', 'text'], ['email', 'Email đăng nhập *', 'email'], ['password', 'Mật khẩu *', 'password'], ['industry', 'Ngành', 'text'], ['website_url', 'Website', 'url'],
  ] as const).map(([key, label, type]) => <div key={key}><label className="input-label">{label}</label><input required={['full_name','brand_name','email','password'].includes(key)} minLength={key === 'password' ? 6 : undefined} autoComplete={key === 'password' ? 'new-password' : undefined} type={type} className="input-base" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></div>)}</div><div><label className="input-label">Mô tả Brand</label><textarea className="input-base" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div><ImageUpload label="Logo / Avatar Brand" folder="brand-logos" value={form.logo_url} onChange={url => setForm(f => ({ ...f, logo_url: url }))} onBusyChange={setUploading} />{error && <p role="alert" className="text-red-500 text-sm">{error}</p>}<p className="text-xs text-slate-400">Tài khoản được tạo với role BRAND và hồ sơ thương hiệu tương ứng.</p><div className="flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={close} disabled={saving || uploading}>Hủy</button><button type="submit" className="btn-primary disabled:opacity-50" disabled={saving || uploading}>{saving ? 'Đang tạo…' : 'Tạo Brand'}</button></div></form>;
}
function EntityTable({ title, headers, rows, action }: { title: string; headers: string[]; rows: ReactNode[][]; action?: ReactNode }) {
  return <div><SectionHeader title={title} subtitle={`${rows.length} bản ghi`} action={action} /><div className={`${tableStyles.wrapper} bg-white dark:bg-slate-800`}><table className="w-full"><thead className={tableStyles.thead}><tr>{headers.map(h => <th className={tableStyles.th} key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr className={tableStyles.tr} key={index}>{row.map((cell, cellIndex) => <td className={tableStyles.td} key={cellIndex}>{typeof cell === 'string' && /^[A-Z_]+$/.test(cell) ? <span className={statusBadgeClass(cell)}>{cell}</span> : cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <div className="py-12 text-center text-sm text-slate-400">Chưa có dữ liệu phù hợp.</div>}</div></div>;
}
