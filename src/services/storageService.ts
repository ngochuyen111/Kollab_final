import { supabase } from '../lib/supabase';
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const storageService = {
  async uploadImage(file: File, folder: 'avatars' | 'products' | 'brand-logos'): Promise<string> {
    if (!allowedTypes.has(file.type)) throw new Error('Chọn ảnh JPG, PNG hoặc WebP.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Ảnh tối đa 5 MB.');
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('kollab-assets').upload(path, file, { contentType: file.type, upsert: false, cacheControl: '3600' });
    if (error) throw new Error(`Không thể upload ảnh. Hãy kiểm tra bucket kollab-assets và quyền upload Storage (xem README_UPGRADE.md). ${error.message}`);
    const { data } = supabase.storage.from('kollab-assets').getPublicUrl(path);
    return data.publicUrl;
  },
};
