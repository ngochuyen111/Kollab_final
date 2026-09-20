import { supabase } from '../lib/supabase';
import type { Campaign, CampaignStatus, CampaignWithRelations, CreateInput, UpdateInput } from '../types/database';

const selectRelations = '*, products(id, product_name, image_url, price), brands(id, brand_name, logo_url, industry)';

export const campaignService = {
  async getAll(): Promise<CampaignWithRelations[]> {
    const { data, error } = await supabase.from('campaigns').select(selectRelations).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as CampaignWithRelations[];
  },
  async getById(id: number): Promise<CampaignWithRelations> {
    const { data, error } = await supabase.from('campaigns').select(selectRelations).eq('id', id).single();
    if (error) throw error;
    return data as CampaignWithRelations;
  },
  async create(input: CreateInput<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase.from('campaigns').insert(input).select().single();
    if (error) throw error;
    return data as Campaign;
  },
  async update(id: number, input: UpdateInput<Campaign>): Promise<Campaign> {
    const { data, error } = await supabase.from('campaigns').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Campaign;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
  },
  async getBrandCampaigns(brandId: number): Promise<CampaignWithRelations[]> {
    const { data, error } = await supabase.from('campaigns').select(selectRelations).eq('brand_id', brandId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as CampaignWithRelations[];
  },
  async getOpenCampaigns(): Promise<CampaignWithRelations[]> {
    const { data, error } = await supabase.from('campaigns').select(selectRelations).eq('status', 'ACTIVE').order('start_date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as CampaignWithRelations[];
  },
  updateCampaignStatus(id: number, status: CampaignStatus) { return this.update(id, { status }); },
};

export const createCampaign = (input: CreateInput<Campaign>) => campaignService.create(input);
