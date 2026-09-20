import { supabase } from '../lib/supabase';
import type { CreateInput, Product, UpdateInput } from '../types/database';
import { insertWithSafeId } from './safeInsert';

export type SupabaseProduct = Product;

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Product[];
  },
  async getById(id: number): Promise<Product> {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Product;
  },
  async create(input: CreateInput<Product>): Promise<Product> {
    return insertWithSafeId<Product>('products', input);
  },
  async update(id: number, input: UpdateInput<Product>): Promise<Product> {
    const { data, error } = await supabase.from('products').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Product;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
  async getProductsByBrand(brandId: number): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').eq('brand_id', brandId).order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Product[];
  },
};
