import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ExternalLink, Edit3 } from 'lucide-react';
import { Badge, Button, Modal, SectionHeader } from '../../../components/SharedUI';
import { campaigns, productCategories, products, campaignStatusLabels } from '../../../data/mockData';

const PRODUCT_IMAGES: Record<string, string> = {
  serum: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
  cleanser: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  sunscreen: 'https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=400&h=400&fit=crop',
  vitaminc: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop',
  rosewater: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
  moisturizer: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop',
  detox: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
};

const currentBrandId = 'b1';

export function ProductManagementSection() {
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const brandProducts = products.filter(p => p.brandId === currentBrandId);
  const filtered = brandProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <SectionHeader title="Quản lý sản phẩm" subtitle="Tạo và quản lý sản phẩm cho chiến dịch" action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Tạo sản phẩm mới</Button>} />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Tìm sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <motion.div key={p.id} whileHover={{ y: -2 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden"><img src={PRODUCT_IMAGES[p.image]} alt={p.name} className="w-full h-full object-cover" /></div>
              <Badge label={p.status === 'active' ? 'Active' : 'Inactive'} colorClass={p.status === 'active' ? bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700'}} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{p.name}</h3>
            <p className="text-sm text-slate-500 mb-2">{p.category}</p>
            <p className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-3">{p.price}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowDetail(p.id)}>Chi tiết</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowEdit(p.id)}><Edit3 className="w-3.5 h-3.5" /></Button>
            </div>
          </motion.div>
        ))}
      </div>
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo sản phẩm mới" width="max-w-xl">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên sản phẩm</label><input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="VD: Glow Serum Cấp Ẩm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Danh mục</label><select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">{productCategories.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Giá</label><input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="VD: 299.000 VND" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link sản phẩm</label><input type="url" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" placeholder="https://..." /></div>
          <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mô tả</label><textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none" placeholder="Mô tả sản phẩm..." /></div>
          <div className="flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={() => setShowCreate(false)}>Hủy</Button><Button onClick={() => setShowCreate(false)}><Plus className="w-4 h-4 mr-2" />Tạo sản phẩm</Button></div>
        </div>
      </Modal>
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Chi tiết sản phẩm" width="max-w-xl">{showDetail && (() => { const p = products.find(pr => pr.id === showDetail); if (!p) return null; const relatedCampaigns = campaigns.filter(c => c.productId === p.id); return (<div className="space-y-4"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden"><img src={PRODUCT_IMAGES[p.image]} alt={p.name} className="w-full h-full object-cover" /></div><div><h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3><p className="text-sm text-slate-500">{p.category} • {p.price}</p><Badge label={p.status === 'active' ? 'Active' : 'Inactive'} colorClass={p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'} /></div></div><p className="text-sm text-slate-600 dark:text-slate-300">{p.description}</p><div><a href={p.productLink} className="text-sm text-teal-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />{p.productLink}</a></div><div><h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Chiến dịch liên quan ({relatedCampaigns.length})</h4><div className="space-y-2">{relatedCampaigns.map(c => <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p><p className="text-xs text-slate-500">{campaignStatusLabels[c.status]}</p></div>)}</div></div></div>); })()}</Modal>
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Chỉnh sửa sản phẩm" width="max-w-xl">{showEdit && (() => { const p = products.find(pr => pr.id === showEdit); if (!p) return null; return (<div className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên sản phẩm</label><input defaultValue={p.name} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" /></div><div className="flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={() => setShowEdit(null)}>Hủy</Button><Button onClick={() => setShowEdit(null)}>Lưu thay đổi</Button></div></div>); })()}</Modal>
    </div>
  );
}
