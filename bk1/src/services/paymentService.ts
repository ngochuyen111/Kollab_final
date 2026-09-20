import { supabase } from '../lib/supabase';
import type { CreateInput, Payment, PaymentStatus, UpdateInput } from '../types/database';

export interface PaymentWithRelations extends Payment {
  campaign_tasks: { campaigns: { campaign_name: string } | null } | null;
  kol_profiles: { users: { full_name: string; avatar_url: string | null } | null } | null;
  brands: { brand_name: string } | null;
}
const selectRelations = '*, campaign_tasks(campaigns(campaign_name)), kol_profiles(users(full_name, avatar_url)), brands(brand_name)';

export const paymentService = {
  async getAll(): Promise<PaymentWithRelations[]> {
    const { data, error } = await supabase.from('payments').select(selectRelations).order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PaymentWithRelations[];
  },
  async getById(id: number): Promise<PaymentWithRelations> {
    const { data, error } = await supabase.from('payments').select(selectRelations).eq('id', id).single();
    if (error) throw error;
    return data as PaymentWithRelations;
  },
  async create(input: CreateInput<Payment>): Promise<Payment> {
    const { data, error } = await supabase.from('payments').insert(input).select().single();
    if (error) throw error;
    return data as Payment;
  },
  createPayment(input: Omit<CreateInput<Payment>, 'paid_amount' | 'status' | 'payment_note' | 'paid_date'>) {
    return this.create({ ...input, paid_amount: 0, status: 'PENDING', payment_note: null, paid_date: null });
  },
  async update(id: number, input: UpdateInput<Payment>): Promise<Payment> {
    const { data, error } = await supabase.from('payments').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Payment;
  },
  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
  },
  async getPaymentsByBrand(brandId: number): Promise<PaymentWithRelations[]> {
    const { data, error } = await supabase.from('payments').select(selectRelations).eq('brand_id', brandId).order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PaymentWithRelations[];
  },
  async getPaymentsByKOL(kolProfileId: number): Promise<PaymentWithRelations[]> {
    const { data, error } = await supabase.from('payments').select(selectRelations).eq('kol_profile_id', kolProfileId).order('id', { ascending: false });
    if (error) throw error;
    return (data ?? []) as PaymentWithRelations[];
  },
  async updateStatus(id: number, status: PaymentStatus, paidAmount?: number, note?: string): Promise<Payment> {
    const current = await this.getById(id);
    const payment = await this.update(id, {
      status, paid_amount: status === 'PAID' ? current.amount : paidAmount ?? current.paid_amount,
      payment_note: note ?? current.payment_note, paid_date: status === 'PAID' ? new Date().toISOString() : current.paid_date,
    });
    if (status === 'PAID') {
      const taskUpdate = await supabase.from('campaign_tasks').update({ status: 'PAID' }).eq('id', current.task_id);
      if (taskUpdate.error) throw taskUpdate.error;
    }
    return payment;
  },
  confirmPayment(id: number) { return this.updateStatus(id, 'PAID'); },
};
