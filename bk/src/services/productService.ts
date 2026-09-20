import { supabase } from '../lib/supabase';

export interface SupabaseProduct {
  id: number;
  brand_id: number;
  product_name: string;
  description: string | null;
  image_url: string | null;
  product_link: string | null;
  price: number | null;
  status: string;
}

export const productService = {
  async getProductsByBrand(brandId: number) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get products error:', error);
      throw error;
    }

    return (data ?? []) as SupabaseProduct[];
  },
};