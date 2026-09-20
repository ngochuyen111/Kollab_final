import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Check, Edit3, Package, Plus, Trash2, Users, Wallet, X } from 'lucide-react';
import { Avatar, Badge, Button, KPIWidget, Modal, SectionHeader, cardStyles, tableStyles } from '../../components/SharedUI';
import { brandService } from '../../services/brandService';
import { campaignService } from '../../services/campaignService';
import { draftService, type DraftWithTask } from '../../services/draftService';
import { kolService } from '../../services/kolService';
import { metricService, type MetricWithTask } from '../../services/metricService';
import { paymentService, type PaymentWithRelations } from '../../services/paymentService';
import { productService } from '../../services/productService';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import {
  campaignStatusLabels, formatCurrency, formatDate, getErrorMessage, metricStatusLabels,
  paymentStatusLabels, statusBadgeClass, taskStatusLabels,
} from '../../constants/domain';
import type {
  AppUser, Brand, CampaignStatus, CampaignWithRelations, KolWithUser, PaymentStatus,
  Product, TaskWithRelations,
} from '../../types/database';

type BrandView = 'overview' | 'products' | 'campaigns' | 'kol' | 'tasks' | 'content' | 'performance' | 'payment';
interface Props { initialView?: string; user: AppUser }

const inputClass = 'input-base';
const labelClass = 'input-label';

function Empty({ text }: { text: string }) {
  return <div className="py-12 text-center text-sm text-slate-400">{text}</div>;
}

function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  return <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300"><span>{message}</span><button onClick={retry} className="font-semibold underline">Tải lại</button></div>;
}

export function BrandDashboard({ initialView = 'overview', user }: Props) {
  const view = (['overview', 'products', 'campaigns', 'kol', 'tasks', 'content', 'performance', 'payment'].includes(initialView) ? initialView : 'overview') as BrandView;
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignWithRelations[]>([]);
  const [kols, setKols] = useState<KolWithUser[]>([]);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [drafts, setDrafts] = useState<DraftWithTask[]>([]);
  const [metrics, setMetrics] = useState<MetricWithTask[]>([]);
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const currentBrand = await brandService.getByUserId(user.id);
      setBrand(currentBrand);
      const [productRows, campaignRows, kolRows, taskRows, draftRows, metricRows, paymentRows] = await Promise.all([
        productService.getProductsByBrand(currentBrand.id), campaignService.getBrandCampaigns(currentBrand.id),
        kolService.getAll(), taskService.getAll(), draftService.getAll(), metricService.getByBrand(currentBrand.id),
        paymentService.getPaymentsByBrand(currentBrand.id),
      ]);
      const campaignIds = new Set(campaignRows.map(item => item.id));
      setProducts(productRows); setCampaigns(campaignRows); setKols(kolRows);
      setTasks(taskRows.filter(item => campaignIds.has(item.campaign_id)));
      setDrafts(draftRows.filter(item => item.campaign_tasks?.campaigns?.brand_id === currentBrand.id));
      setMetrics(metricRows); setPayments(paymentRows);
    } catch (caught) {
      setError(`Không thể tải dữ liệu: ${getErrorMessage(caught)}`);
    } finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="space-y-4"><div className="skeleton h-9 w-60" /><div className="grid grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28" />)}</div><div className="skeleton h-80" /></div>;
  if (!brand) return <ErrorBanner message={error || 'Tài khoản này chưa được liên kết với hồ sơ Brand.'} retry={() => void load()} />;

  const common = { brand, products, campaigns, kols, tasks, drafts, metrics, payments, reload: load };
  return <>{error && <ErrorBanner message={error} retry={() => void load()} />}{view === 'overview' && <Overview {...common} />}{view === 'products' && <Products {...common} />}{view === 'campaigns' && <Campaigns {...common} />}{view === 'kol' && <Creators {...common} />}{view === 'tasks' && <Tasks {...common} />}{view === 'content' && <DraftReview {...common} reviewerId={user.id} />}{view === 'performance' && <Metrics {...common} reviewerId={user.id} />}{view === 'payment' && <Payments {...common} />}</>;
}

interface DataProps {
  brand: Brand; products: Product[]; campaigns: CampaignWithRelations[]; kols: KolWithUser[];
  tasks: TaskWithRelations[]; drafts: DraftWithTask[]; metrics: MetricWithTask[];
  payments: PaymentWithRelations[]; reload: () => Promise<void>;
}

function Overview({ brand, campaigns, products, tasks, drafts, metrics, payments }: DataProps) {
  const pendingDrafts = drafts.filter(item => item.status === 'SUBMITTED').length;
  const pendingMetrics = metrics.filter(item => item.status === 'SUBMITTED').length;
  const pendingPayments = payments.filter(item => item.status !== 'PAID').reduce((sum, item) => sum + (item.amount - item.paid_amount), 0);
  return <div className="space-y-6">
    <SectionHeader title={`Xin chào, ${brand.brand_name}`} subtitle="Dữ liệu được đồng bộ trực tiếp từ Supabase" />
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KPIWidget label="Chiến dịch" value={String(campaigns.length)} icon={<Activity className="w-4 h-4" />} />
      <KPIWidget label="Sản phẩm" value={String(products.length)} icon={<Package className="w-4 h-4" />} />
      <KPIWidget label="Nhiệm vụ" value={String(tasks.length)} icon={<Users className="w-4 h-4" />} />
      <KPIWidget label="Chờ thanh toán" value={formatCurrency(pendingPayments)} icon={<Wallet className="w-4 h-4" />} />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className={`${cardStyles.container} p-5`}><h3 className="font-bold text-slate-900 dark:text-white mb-4">Việc cần xử lý</h3><div className="space-y-3">
        {[['Bản nháp chờ duyệt', pendingDrafts], ['Metrics chờ xác minh', pendingMetrics], ['Thanh toán chưa hoàn tất', payments.filter(p => p.status !== 'PAID').length]].map(([label, count]) => <div key={String(label)} className="flex justify-between rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3"><span className="text-sm text-slate-600 dark:text-slate-300">{label}</span><span className="font-bold text-teal-600">{count}</span></div>)}
      </div></div>
      <div className={`${cardStyles.container} p-5`}><h3 className="font-bold text-slate-900 dark:text-white mb-4">Chiến dịch gần đây</h3>{campaigns.slice(0, 5).map(c => <div key={c.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"><div><p className="text-sm font-semibold text-slate-900 dark:text-white">{c.campaign_name}</p><p className="text-xs text-slate-400">{c.products?.product_name ?? 'Không có sản phẩm'}</p></div><span className={statusBadgeClass(c.status)}>{campaignStatusLabels[c.status]}</span></div>)}{campaigns.length === 0 && <Empty text="Chưa có chiến dịch" />}</div>
    </div>
  </div>;
}

function Products({ brand, products, reload }: DataProps) {
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const remove = async (id: number) => { if (!window.confirm('Xóa sản phẩm này?')) return; try { await productService.delete(id); await reload(); } catch (e) { window.alert(getErrorMessage(e)); } };
  return <div><SectionHeader title="Quản lý sản phẩm" subtitle={`${products.length} sản phẩm từ Supabase`} action={<Button onClick={() => setEditing(null)} icon={<Plus className="w-4 h-4" />}>Thêm sản phẩm</Button>} />
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{products.map(product => <div key={product.id} className={`${cardStyles.container} p-4`}><div className="flex gap-4"><div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">{product.image_url ? <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" /> : <Package className="w-7 h-7 text-slate-400" />}</div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><h3 className="font-bold text-slate-900 dark:text-white truncate">{product.product_name}</h3><span className={statusBadgeClass(product.status)}>{product.status}</span></div><p className="text-sm text-teal-600 font-semibold mt-1">{formatCurrency(product.price)}</p><p className="text-xs text-slate-400 line-clamp-2 mt-1">{product.description || 'Chưa có mô tả'}</p></div></div><div className="flex justify-end gap-2 mt-4"><Button size="sm" variant="secondary" onClick={() => setEditing(product)} icon={<Edit3 className="w-3.5 h-3.5" />}>Sửa</Button><Button size="sm" variant="danger" onClick={() => void remove(product.id)} icon={<Trash2 className="w-3.5 h-3.5" />}>Xóa</Button></div></div>)}{products.length === 0 && <div className="md:col-span-2 xl:col-span-3"><Empty text="Chưa có sản phẩm. Hãy tạo sản phẩm đầu tiên." /></div>}</div>
    <Modal isOpen={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}><ProductForm brandId={brand.id} product={editing ?? null} close={() => setEditing(undefined)} reload={reload} /></Modal>
  </div>;
}

function ProductForm({ brandId, product, close, reload }: { brandId: number; product: Product | null; close: () => void; reload: () => Promise<void> }) {
  const [form, setForm] = useState({ product_name: product?.product_name ?? '', description: product?.description ?? '', image_url: product?.image_url ?? '', product_link: product?.product_link ?? '', price: String(product?.price ?? ''), status: product?.status ?? 'ACTIVE' });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); try { setSaving(true); setError(''); const input = { brand_id: brandId, product_name: form.product_name.trim(), description: form.description || null, image_url: form.image_url || null, product_link: form.product_link || null, price: form.price ? Number(form.price) : null, status: form.status }; if (product) await productService.update(product.id, input); else await productService.create(input); await reload(); close(); } catch (caught) { setError(getErrorMessage(caught)); } finally { setSaving(false); } };
  return <form onSubmit={submit} className="space-y-4"><div><label className={labelClass}>Tên sản phẩm *</label><input className={inputClass} required value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} /></div><div><label className={labelClass}>Mô tả</label><textarea className={inputClass} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Giá</label><input className={inputClass} type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div><div><label className={labelClass}>Trạng thái</label><select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>ACTIVE</option><option>INACTIVE</option></select></div></div><div><label className={labelClass}>URL hình ảnh</label><input className={inputClass} type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} /></div><div><label className={labelClass}>Link sản phẩm</label><input className={inputClass} type="url" value={form.product_link} onChange={e => setForm({ ...form, product_link: e.target.value })} /></div>{error && <p className="text-sm text-red-500">{error}</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Hủy</Button><button className="btn-primary" disabled={saving} type="submit">{saving ? 'Đang lưu...' : 'Lưu sản phẩm'}</button></div></form>;
}

function Campaigns({ brand, products, campaigns, reload }: DataProps) {
  const [editing, setEditing] = useState<CampaignWithRelations | null | undefined>(undefined);
  const setStatus = async (id: number, status: CampaignStatus) => { try { await campaignService.updateCampaignStatus(id, status); await reload(); } catch (e) { window.alert(getErrorMessage(e)); } };
  const remove = async (id: number) => { if (!window.confirm('Xóa chiến dịch này?')) return; try { await campaignService.delete(id); await reload(); } catch (e) { window.alert(getErrorMessage(e)); } };
  return <div><SectionHeader title="Quản lý chiến dịch" subtitle="Tạo, chỉnh sửa và điều khiển trạng thái chiến dịch" action={<Button onClick={() => setEditing(null)} icon={<Plus className="w-4 h-4" />}>Tạo chiến dịch</Button>} />
    <div className={`${tableStyles.wrapper} bg-white dark:bg-slate-800`}><table className="w-full"><thead className={tableStyles.thead}><tr>{['Chiến dịch', 'Sản phẩm', 'Thời gian', 'Ngân sách', 'Trạng thái', 'Thao tác'].map(h => <th key={h} className={tableStyles.th}>{h}</th>)}</tr></thead><tbody>{campaigns.map(c => <tr key={c.id} className={`${tableStyles.tr} ${tableStyles.trHover}`}><td className={tableStyles.td}><p className="font-semibold text-slate-900 dark:text-white">{c.campaign_name}</p><p className="text-xs text-slate-400 line-clamp-1">{c.objective}</p></td><td className={tableStyles.td}>{c.products?.product_name ?? '—'}</td><td className={tableStyles.td}>{formatDate(c.start_date)} – {formatDate(c.end_date)}</td><td className={tableStyles.td}>{formatCurrency(c.budget)}</td><td className={tableStyles.td}><select className="input-base py-1.5" value={c.status} onChange={e => void setStatus(c.id, e.target.value as CampaignStatus)}>{Object.keys(campaignStatusLabels).map(s => <option key={s} value={s}>{campaignStatusLabels[s as CampaignStatus]}</option>)}</select></td><td className={tableStyles.td}><div className="flex gap-2"><button className="btn-ghost p-2" onClick={() => setEditing(c)}><Edit3 className="w-4 h-4" /></button><button className="btn-ghost p-2 text-red-500" onClick={() => void remove(c.id)}><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>{campaigns.length === 0 && <Empty text="Chưa có chiến dịch" />}</div>
    <Modal isOpen={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Cập nhật chiến dịch' : 'Tạo chiến dịch'} width="max-w-3xl"><CampaignForm brandId={brand.id} products={products} campaign={editing ?? null} close={() => setEditing(undefined)} reload={reload} /></Modal>
  </div>;
}

function CampaignForm({ brandId, products, campaign, close, reload }: { brandId: number; products: Product[]; campaign: CampaignWithRelations | null; close: () => void; reload: () => Promise<void> }) {
  const [form, setForm] = useState({ product_id: String(campaign?.product_id ?? ''), campaign_name: campaign?.campaign_name ?? '', objective: campaign?.objective ?? '', campaign_brief: campaign?.campaign_brief ?? '', start_date: campaign?.start_date?.slice(0, 10) ?? '', end_date: campaign?.end_date?.slice(0, 10) ?? '', target_views: String(campaign?.target_views ?? 0), target_engagement_rate: String(campaign?.target_engagement_rate ?? 0), target_conversion: String(campaign?.target_conversion ?? 0), payment_rule: campaign?.payment_rule ?? '', budget: String(campaign?.budget ?? 0), status: campaign?.status ?? 'DRAFT' as CampaignStatus });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); if (form.start_date > form.end_date) { setError('Ngày kết thúc phải sau ngày bắt đầu.'); return; } try { setSaving(true); setError(''); const input = { brand_id: brandId, product_id: Number(form.product_id), campaign_name: form.campaign_name.trim(), objective: form.objective || null, campaign_brief: form.campaign_brief || null, start_date: form.start_date, end_date: form.end_date, target_views: Number(form.target_views), target_engagement_rate: Number(form.target_engagement_rate), target_conversion: Number(form.target_conversion), payment_rule: form.payment_rule || null, status: form.status, budget: Number(form.budget) }; if (campaign) await campaignService.update(campaign.id, input); else await campaignService.create(input); await reload(); close(); } catch (caught) { setError(getErrorMessage(caught)); } finally { setSaving(false); } };
  const set = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  return <form onSubmit={submit} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div><label className={labelClass}>Sản phẩm *</label><select required className={inputClass} value={form.product_id} onChange={e => set('product_id', e.target.value)}><option value="">Chọn sản phẩm</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select></div><div><label className={labelClass}>Tên chiến dịch *</label><input required className={inputClass} value={form.campaign_name} onChange={e => set('campaign_name', e.target.value)} /></div></div><div><label className={labelClass}>Mục tiêu</label><input className={inputClass} value={form.objective} onChange={e => set('objective', e.target.value)} /></div><div className="grid sm:grid-cols-2 gap-4"><div><label className={labelClass}>Ngày bắt đầu *</label><input required type="date" className={inputClass} value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div><div><label className={labelClass}>Ngày kết thúc *</label><input required type="date" className={inputClass} value={form.end_date} onChange={e => set('end_date', e.target.value)} /></div></div><div className="grid sm:grid-cols-4 gap-3">{[['target_views', 'Target views'], ['target_engagement_rate', 'Target ER (%)'], ['target_conversion', 'Conversion'], ['budget', 'Ngân sách']].map(([key, label]) => <div key={key}><label className={labelClass}>{label}</label><input type="number" min="0" className={inputClass} value={form[key as keyof typeof form]} onChange={e => set(key as keyof typeof form, e.target.value)} /></div>)}</div><div><label className={labelClass}>Campaign brief</label><textarea rows={3} className={inputClass} value={form.campaign_brief} onChange={e => set('campaign_brief', e.target.value)} /></div><div><label className={labelClass}>Quy tắc thanh toán</label><textarea rows={2} className={inputClass} value={form.payment_rule} onChange={e => set('payment_rule', e.target.value)} /></div>{error && <p className="text-sm text-red-500">{error}</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Hủy</Button><button className="btn-primary" disabled={saving} type="submit">{saving ? 'Đang lưu...' : 'Lưu chiến dịch'}</button></div></form>;
}

function Creators({ brand, kols, reload }: DataProps) {
  const [open, setOpen] = useState(false);
  return <div><SectionHeader title="KOL/KOC" subtitle={`${kols.length} creator đang có trên hệ thống`} action={<Button onClick={() => setOpen(true)} icon={<Plus className="w-4 h-4" />}>Tạo tài khoản KOL/KOC</Button>} /><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{kols.map(kol => <div key={kol.id} className={`${cardStyles.container} p-5 flex gap-4`}><Avatar initials={(kol.users?.full_name ?? 'KO').slice(0, 2).toUpperCase()} image={kol.users?.avatar_url ?? undefined} role="kol" size="lg" /><div className="min-w-0"><h3 className="font-bold text-slate-900 dark:text-white truncate">{kol.users?.full_name ?? 'Chưa có tên'}</h3><p className="text-sm text-slate-500">{kol.platform ?? '—'} • {kol.followers.toLocaleString()} followers</p><div className="flex gap-2 mt-2"><Badge label={kol.users?.role ?? 'KOL'} /><Badge label={kol.content_category ?? 'Chưa phân loại'} /></div>{kol.social_link && <a href={kol.social_link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 mt-2 block truncate">{kol.social_link}</a>}</div></div>)}{kols.length === 0 && <div className="md:col-span-2 xl:col-span-3"><Empty text="Chưa có KOL/KOC" /></div>}</div><Modal isOpen={open} onClose={() => setOpen(false)} title="Tạo tài khoản KOL/KOC"><CreatorAccountForm brandId={brand.id} close={() => setOpen(false)} reload={reload} /></Modal></div>;
}

function CreatorAccountForm({ brandId, close, reload }: { brandId: number; close: () => void; reload: () => Promise<void> }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'KOL' as 'KOL' | 'KOC', avatar_url: '', bio: '', platform: 'TikTok', social_link: '', followers: '0', content_category: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    let createdUserId: number | null = null;
    try {
      setSaving(true); setError('');
      const createdUser = await userService.create({
        full_name: form.full_name.trim(), email: form.email, password_hash: form.password,
        role: form.role, avatar_url: form.avatar_url || null, status: 'ACTIVE',
      });
      createdUserId = createdUser.id;
      await kolService.create({
        user_id: createdUser.id, created_by_brand_id: brandId, bio: form.bio || null,
        platform: form.platform || null, social_link: form.social_link || null,
        followers: Number(form.followers), content_category: form.content_category || null,
        qr_payment_url: null, bank_name: null, bank_account: null, bank_owner: null, status: 'ACTIVE',
      });
      await reload(); close();
    } catch (caught) {
      if (createdUserId !== null) await userService.delete(createdUserId).catch(() => undefined);
      const message = getErrorMessage(caught);
      setError(message.includes('users_email') || message.includes('duplicate key') ? 'Email này đã được sử dụng.' : message);
    } finally { setSaving(false); }
  };
  return <form onSubmit={submit} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><div><label className={labelClass}>Họ tên *</label><input required className={inputClass} value={form.full_name} onChange={e => set('full_name', e.target.value)} /></div><div><label className={labelClass}>Vai trò *</label><select className={inputClass} value={form.role} onChange={e => set('role', e.target.value)}><option value="KOL">KOL</option><option value="KOC">KOC</option></select></div><div><label className={labelClass}>Email đăng nhập *</label><input required type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} /></div><div><label className={labelClass}>Mật khẩu *</label><input required minLength={6} type="password" className={inputClass} value={form.password} onChange={e => set('password', e.target.value)} /></div><div><label className={labelClass}>Nền tảng</label><input className={inputClass} value={form.platform} onChange={e => set('platform', e.target.value)} /></div><div><label className={labelClass}>Followers</label><input min="0" type="number" className={inputClass} value={form.followers} onChange={e => set('followers', e.target.value)} /></div><div><label className={labelClass}>Chuyên mục nội dung</label><input className={inputClass} value={form.content_category} onChange={e => set('content_category', e.target.value)} /></div><div><label className={labelClass}>Link mạng xã hội</label><input type="url" className={inputClass} value={form.social_link} onChange={e => set('social_link', e.target.value)} /></div></div><div><label className={labelClass}>URL avatar</label><input type="url" className={inputClass} value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} /></div><div><label className={labelClass}>Giới thiệu</label><textarea rows={3} className={inputClass} value={form.bio} onChange={e => set('bio', e.target.value)} /></div>{error && <p className="text-sm text-red-500">{error}</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Hủy</Button><button disabled={saving} type="submit" className="btn-primary">{saving ? 'Đang tạo...' : 'Tạo tài khoản'}</button></div></form>;
}

function Tasks({ campaigns, kols, tasks, reload }: DataProps) {
  const [open, setOpen] = useState(false);
  return <div><SectionHeader title="Phân công nhiệm vụ" subtitle="Giao campaign cho KOL/KOC" action={<Button onClick={() => setOpen(true)} icon={<Plus className="w-4 h-4" />}>Giao nhiệm vụ</Button>} /><div className={`${tableStyles.wrapper} bg-white dark:bg-slate-800`}><table className="w-full"><thead className={tableStyles.thead}><tr>{['KOL/KOC', 'Chiến dịch', 'Loại nội dung', 'Deadline', 'Thù lao', 'Trạng thái'].map(h => <th key={h} className={tableStyles.th}>{h}</th>)}</tr></thead><tbody>{tasks.map(task => <tr key={task.id} className={`${tableStyles.tr} ${tableStyles.trHover}`}><td className={tableStyles.td}>{task.kol_profiles?.users?.full_name ?? '—'}</td><td className={tableStyles.td}>{task.campaigns?.campaign_name ?? '—'}</td><td className={tableStyles.td}>{task.content_type}</td><td className={tableStyles.td}>{formatDate(task.draft_deadline)}</td><td className={tableStyles.td}>{formatCurrency(task.payment_amount)}</td><td className={tableStyles.td}><span className={statusBadgeClass(task.status)}>{taskStatusLabels[task.status]}</span></td></tr>)}</tbody></table>{tasks.length === 0 && <Empty text="Chưa có nhiệm vụ" />}</div><Modal isOpen={open} onClose={() => setOpen(false)} title="Giao nhiệm vụ cho KOL/KOC"><TaskForm campaigns={campaigns} kols={kols} close={() => setOpen(false)} reload={reload} /></Modal></div>;
}

function TaskForm({ campaigns, kols, close, reload }: { campaigns: CampaignWithRelations[]; kols: KolWithUser[]; close: () => void; reload: () => Promise<void> }) {
  const [form, setForm] = useState({ campaign_id: '', kol_profile_id: '', content_type: 'TikTok Video', content_requirement: '', draft_deadline: '', publish_deadline: '', payment_amount: '' }); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const submit = async (e: FormEvent) => { e.preventDefault(); try { setSaving(true); await taskService.createTask({ campaign_id: Number(form.campaign_id), kol_profile_id: Number(form.kol_profile_id), content_type: form.content_type, content_requirement: form.content_requirement || null, draft_deadline: form.draft_deadline || null, publish_deadline: form.publish_deadline || null, payment_amount: Number(form.payment_amount), status: 'ASSIGNED' }); await reload(); close(); } catch (caught) { setError(getErrorMessage(caught)); } finally { setSaving(false); } };
  return <form onSubmit={submit} className="space-y-4"><div><label className={labelClass}>Chiến dịch *</label><select required className={inputClass} value={form.campaign_id} onChange={e => setForm({ ...form, campaign_id: e.target.value })}><option value="">Chọn chiến dịch</option>{campaigns.filter(c => ['ACTIVE', 'DRAFT'].includes(c.status)).map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}</select></div><div><label className={labelClass}>KOL/KOC *</label><select required className={inputClass} value={form.kol_profile_id} onChange={e => setForm({ ...form, kol_profile_id: e.target.value })}><option value="">Chọn creator</option>{kols.map(k => <option key={k.id} value={k.id}>{k.users?.full_name} — {k.platform}</option>)}</select></div><div><label className={labelClass}>Loại nội dung *</label><input required className={inputClass} value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value })} /></div><div><label className={labelClass}>Yêu cầu nội dung</label><textarea rows={3} className={inputClass} value={form.content_requirement} onChange={e => setForm({ ...form, content_requirement: e.target.value })} /></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Hạn draft</label><input type="date" className={inputClass} value={form.draft_deadline} onChange={e => setForm({ ...form, draft_deadline: e.target.value })} /></div><div><label className={labelClass}>Hạn đăng</label><input type="date" className={inputClass} value={form.publish_deadline} onChange={e => setForm({ ...form, publish_deadline: e.target.value })} /></div></div><div><label className={labelClass}>Thù lao *</label><input required min="0" type="number" className={inputClass} value={form.payment_amount} onChange={e => setForm({ ...form, payment_amount: e.target.value })} /></div>{error && <p className="text-sm text-red-500">{error}</p>}<div className="flex justify-end gap-2"><Button variant="secondary" onClick={close}>Hủy</Button><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Đang tạo...' : 'Giao nhiệm vụ'}</button></div></form>;
}

function DraftReview({ drafts, reload, reviewerId }: DataProps & { reviewerId: number }) {
  const [busy, setBusy] = useState<number | null>(null);
  const review = async (draft: DraftWithTask, approved: boolean) => { const feedback = approved ? 'Nội dung đã được duyệt.' : window.prompt('Nhập phản hồi yêu cầu chỉnh sửa:', draft.feedback ?? '') ?? ''; if (!approved && !feedback.trim()) return; try { setBusy(draft.id); await draftService.reviewDraft(draft.id, approved ? 'APPROVED' : 'REJECTED', feedback, reviewerId); await reload(); } catch (e) { window.alert(getErrorMessage(e)); } finally { setBusy(null); } };
  return <div><SectionHeader title="Phê duyệt nội dung" subtitle="Review draft KOL/KOC gửi lên" /><div className="space-y-4">{drafts.map(draft => <div key={draft.id} className={`${cardStyles.container} p-5`}><div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div className="space-y-2"><div className="flex items-center gap-2"><h3 className="font-bold text-slate-900 dark:text-white">{draft.campaign_tasks?.kol_profiles?.users?.full_name ?? 'KOL/KOC'}</h3><span className={statusBadgeClass(draft.status)}>{draft.status}</span></div><p className="text-sm font-semibold text-teal-600">{draft.campaign_tasks?.campaigns?.campaign_name ?? '—'}</p><p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{draft.caption || 'Không có caption'}</p><div className="flex gap-4 text-sm">{draft.draft_link && <a className="text-blue-500 underline" href={draft.draft_link} target="_blank" rel="noreferrer">Mở link draft</a>}{draft.draft_file_url && <a className="text-blue-500 underline" href={draft.draft_file_url} target="_blank" rel="noreferrer">Mở file draft</a>}</div>{draft.feedback && <p className="text-xs text-slate-500">Phản hồi: {draft.feedback}</p>}</div>{draft.status === 'SUBMITTED' && <div className="flex gap-2 shrink-0"><Button disabled={busy === draft.id} variant="danger" onClick={() => void review(draft, false)} icon={<X className="w-4 h-4" />}>Yêu cầu sửa</Button><Button disabled={busy === draft.id} onClick={() => void review(draft, true)} icon={<Check className="w-4 h-4" />}>Duyệt</Button></div>}</div></div>)}{drafts.length === 0 && <Empty text="Chưa có draft nào" />}</div></div>;
}

function Metrics({ metrics, reload, reviewerId }: DataProps & { reviewerId: number }) {
  const [busy, setBusy] = useState<number | null>(null);
  const review = async (metric: MetricWithTask, approved: boolean) => { const feedback = approved ? 'Metrics đã được xác minh.' : window.prompt('Lý do từ chối metrics:', metric.feedback ?? '') ?? ''; if (!approved && !feedback.trim()) return; try { setBusy(metric.id); await metricService.review(metric.id, approved ? 'APPROVED' : 'REJECTED', feedback, reviewerId); await reload(); } catch (e) { window.alert(getErrorMessage(e)); } finally { setBusy(null); } };
  return <div><SectionHeader title="Theo dõi hiệu suất" subtitle="Xác minh số liệu thực tế từ bài đăng" /><div className={`${tableStyles.wrapper} bg-white dark:bg-slate-800`}><table className="w-full"><thead className={tableStyles.thead}><tr>{['KOL / Chiến dịch', 'Kỳ báo cáo', 'Views', 'Tương tác', 'ER', 'Trạng thái', 'Thao tác'].map(h => <th key={h} className={tableStyles.th}>{h}</th>)}</tr></thead><tbody>{metrics.map(metric => <tr key={metric.id} className={tableStyles.tr}><td className={tableStyles.td}><p className="font-semibold">{metric.campaign_tasks?.kol_profiles?.users?.full_name ?? '—'}</p><p className="text-xs text-slate-400">{metric.campaign_tasks?.campaigns?.campaign_name ?? '—'}</p></td><td className={tableStyles.td}>{metric.report_period}</td><td className={tableStyles.td}>{metric.views.toLocaleString()}</td><td className={tableStyles.td}>{(metric.likes + metric.comments + metric.shares + metric.saves).toLocaleString()}</td><td className={tableStyles.td}>{Number(metric.engagement_rate ?? 0).toFixed(2)}%</td><td className={tableStyles.td}><span className={statusBadgeClass(metric.status)}>{metricStatusLabels[metric.status]}</span></td><td className={tableStyles.td}>{metric.status === 'SUBMITTED' && <div className="flex gap-2"><Button size="xs" variant="danger" disabled={busy === metric.id} onClick={() => void review(metric, false)}>Từ chối</Button><Button size="xs" disabled={busy === metric.id} onClick={() => void review(metric, true)}>Duyệt</Button></div>}</td></tr>)}</tbody></table>{metrics.length === 0 && <Empty text="Chưa có metrics" />}</div></div>;
}

function Payments({ payments, reload }: DataProps) {
  const [busy, setBusy] = useState<number | null>(null);
  const update = async (payment: PaymentWithRelations, status: PaymentStatus) => { try { setBusy(payment.id); await paymentService.updateStatus(payment.id, status, status === 'PARTIAL_PAID' ? Number(window.prompt('Số tiền đã thanh toán:', String(payment.paid_amount)) ?? payment.paid_amount) : undefined); await reload(); } catch (e) { window.alert(getErrorMessage(e)); } finally { setBusy(null); } };
  const total = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  return <div><SectionHeader title="Quản lý thanh toán" subtitle={`Tổng giá trị ${formatCurrency(total)}`} /><div className={`${tableStyles.wrapper} bg-white dark:bg-slate-800`}><table className="w-full"><thead className={tableStyles.thead}><tr>{['KOL/KOC', 'Chiến dịch', 'Số tiền', 'Đã trả', 'Trạng thái', 'Thao tác'].map(h => <th key={h} className={tableStyles.th}>{h}</th>)}</tr></thead><tbody>{payments.map(payment => <tr key={payment.id} className={tableStyles.tr}><td className={tableStyles.td}>{payment.kol_profiles?.users?.full_name ?? '—'}</td><td className={tableStyles.td}>{payment.campaign_tasks?.campaigns?.campaign_name ?? '—'}</td><td className={tableStyles.td}>{formatCurrency(payment.amount)}</td><td className={tableStyles.td}>{formatCurrency(payment.paid_amount)}</td><td className={tableStyles.td}><span className={statusBadgeClass(payment.status)}>{paymentStatusLabels[payment.status]}</span></td><td className={tableStyles.td}>{payment.status !== 'PAID' && <div className="flex gap-2"><Button size="xs" variant="secondary" disabled={busy === payment.id} onClick={() => void update(payment, 'HOLD')}>Tạm giữ</Button><Button size="xs" disabled={busy === payment.id} onClick={() => void update(payment, 'PAID')}>Đã trả</Button></div>}</td></tr>)}</tbody></table>{payments.length === 0 && <Empty text="Chưa có khoản thanh toán" />}</div></div>;
}
