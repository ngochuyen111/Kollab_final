import { useState, type FormEvent } from 'react';
import { Avatar } from './SharedUI';
import { ImageUpload } from './ImageUpload';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { getErrorMessage } from '../constants/domain';
import type { AppUser } from '../types/database';
export function AccountProfile({ user, onSaved, onClose }: { user: AppUser; onSaved: (user: AppUser) => void; onClose: () => void }) {
  const [name, setName] = useState(user.full_name); const [avatar, setAvatar] = useState(user.avatar_url ?? '');
  const [uploading, setUploading] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const save = async (e: FormEvent) => { e.preventDefault(); try { setSaving(true); setError(''); const updated = await userService.update(user.id, { full_name: name.trim(), avatar_url: avatar || null }); authService.setCurrentUser(updated); onSaved(updated); window.dispatchEvent(new Event('kollab:refresh')); onClose(); } catch (err) { setError(getErrorMessage(err)); } finally { setSaving(false); } };
  return <form onSubmit={save} className="space-y-5"><div className="flex items-center gap-3"><Avatar size="lg" initials={name.slice(0, 2)} image={avatar || undefined} /><div><p className="font-semibold">{user.email}</p><span className="text-xs text-slate-400">{user.role}</span></div></div><div><label className="input-label">Họ tên</label><input required className="input-base" value={name} onChange={e => setName(e.target.value)} /></div><ImageUpload label="Ảnh đại diện" folder="avatars" value={avatar} onChange={setAvatar} onBusyChange={setUploading} />{error && <p role="alert" className="text-sm text-red-500">{error}</p>}<div className="flex justify-end gap-2"><button type="button" className="btn-secondary" disabled={saving || uploading} onClick={onClose}>Hủy</button><button type="submit" disabled={saving || uploading} className="btn-primary disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu hồ sơ'}</button></div></form>;
}
