import { supabase } from '../lib/supabase';

export interface CreateCampaignInput {
  brandId: number;
  productId: number;
  campaignName: string;
  objective: string;
  startDate: string;
  endDate: string;
  targetViews: number;
  targetER: number;
  targetConversion: number;
  paymentRule: string;
  brief: string;
}

// Trạng thái lưu trong DB (CHECK constraint của bảng campaigns)
export type CampaignDbStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'TRACKING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UpdateCampaignInput {
  campaignName?: string;
  objective?: string;
  brief?: string;
  paymentRule?: string;
  startDate?: string;
  endDate?: string;
}

// Join products + brands để UI hiển thị tên sản phẩm / brand mà không phải gọi thêm
const CAMPAIGN_SELECT = `
  *,
  products (
    id,
    product_name,
    image_url,
    price
  ),
  brands (
    id,
    brand_name,
    logo_url,
    industry
  )
`;

export const campaignService = {
  /** Brand: tất cả campaign (chưa bị xóa mềm), mới nhất trước */
  async getAllCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error('Get campaigns error:', error);
      throw error;
    }

    return data ?? [];
  },

  /** KOL/KOC: chỉ campaign đang mở (ACTIVE) */
  async getOpenCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select(CAMPAIGN_SELECT)
      .eq('status', 'ACTIVE')
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error('Get open campaigns error:', error);
      throw error;
    }

    return data ?? [];
  },

  async createCampaign(input: CreateCampaignInput) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        brand_id: input.brandId,
        product_id: input.productId,
        campaign_name: input.campaignName,
        objective: input.objective,
        campaign_brief: input.brief,
        start_date: input.startDate,
        end_date: input.endDate,
        target_views: input.targetViews,
        target_engagement_rate: input.targetER,
        target_conversion: input.targetConversion,
        payment_rule: input.paymentRule,
        status: 'DRAFT',
      })
      .select()
      .single();

    if (error) {
      console.error('Create campaign error:', error);
      throw error;
    }

    return data;
  },

  /** Đổi trạng thái: kích hoạt / tạm dừng / tiếp tục / kết thúc */
  async updateCampaignStatus(id: number, status: CampaignDbStatus) {
    // .select().single() để báo lỗi nếu không có dòng nào được cập nhật (vd: bị RLS chặn)
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update campaign status error:', error);
      throw error;
    }

    return data;
  },

  /** Sửa thông tin campaign */
  async updateCampaign(id: number, input: UpdateCampaignInput) {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.campaignName !== undefined) patch.campaign_name = input.campaignName;
    if (input.objective !== undefined) patch.objective = input.objective;
    if (input.brief !== undefined) patch.campaign_brief = input.brief;
    if (input.paymentRule !== undefined) patch.payment_rule = input.paymentRule;
    if (input.startDate) patch.start_date = input.startDate;
    if (input.endDate) patch.end_date = input.endDate;

    const { data, error } = await supabase
      .from('campaigns')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update campaign error:', error);
      throw error;
    }

    return data;
  },

  /** Xóa mềm (schema có sẵn deleted_at) */
  async softDeleteCampaign(id: number) {
    const { error } = await supabase
      .from('campaigns')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Delete campaign error:', error);
      throw error;
    }
  },
};

export const createCampaign = campaignService.createCampaign;