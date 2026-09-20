import { useState, useMemo, useEffect, useCallback, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { campaignService, createCampaign } from '../../services/campaignService';
import { productService, SupabaseProduct } from '../../services/productService';
import { taskService } from "../../services/taskService";
import { kolService } from "../../services/kolService";
import { draftService } from "../../services/draftService";
import { paymentService } from "../../services/paymentService";
import {
  Filter, BarChart3, DollarSign, Eye, TrendingUp, Plus, Search, Play, Pause,
  CheckCircle2, MessageSquare, CreditCard, Send, Check, XCircle, Trash2,
  Clock, MessageCircle, Heart, Target, Package, Users, Award,
  ExternalLink, Edit3, ChevronRight, ArrowUpDown, History, Lock, Key,
  ChevronLeft, Calendar, FileText
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip
} from 'recharts';
import {
  KPIWidget, Modal, Button, Badge, Avatar, CredentialDisplay, SectionHeader
} from '../../components/SharedUI';

const KOL_AVATAR_IMAGES: Record<string, string> = {
  LB: 'https://i.pravatar.cc/150?img=47',
  MF: 'https://i.pravatar.cc/150?img=11',
  TT: 'https://i.pravatar.cc/150?img=12',
  HF: 'https://i.pravatar.cc/150?img=53',
  PM: 'https://i.pravatar.cc/150?img=44',
  AK: 'https://i.pravatar.cc/150?img=15',
  MH: 'https://i.pravatar.cc/150?img=49',
  LT: 'https://i.pravatar.cc/150?img=48',
  HC: 'https://i.pravatar.cc/150?img=51',
  NM: 'https://i.pravatar.cc/150?img=14',
};

const PRODUCT_IMAGES: Record<string, string> = {
  serum: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
  cleanser: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  sunscreen: 'https://images.unsplash.com/photo-1556227834-09f1de7a7d14?w=400&h=400&fit=crop',
  vitaminc: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop',
  rosewater: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
  moisturizer: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop',
  detox: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
};

function getKolImage(initials: string) { return KOL_AVATAR_IMAGES[initials]; }

// ═══════════════════════════════════════════════════════════════════════
// COMPREHENSIVE MOCK DATASET
// All data is deeply interconnected: brands → products → campaigns → tasks → KOLs → payments
// ═══════════════════════════════════════════════════════════════════════

// ID brand của dữ liệu MOCK (tasks / payments / kols — sẽ chuyển sang Supabase ở Phase 4)
const currentBrandId = 'b1';
// ID brand thật trong Supabase (cột brand_id của bảng campaigns / products)
// TODO: lấy từ session đăng nhập khi có Auth
const SUPABASE_BRAND_ID = 1;

type Campaign = {
  id: string; brandId: string; productId: string; productName: string; brandName: string;
  name: string; objective: string; brief: string; paymentRule: string;
  status: CampaignStatus;
  budget: number; spent: number; assignedKOLs: string[];
  totalViews: number; avgEngagementRate: number; totalConversions: number;
  startDate?: string; deadline: string; createdAt: string;
  kpiTarget: { views: number; engagementRate: number; conversions: number };
};

export const BRAND_DATA = {
  brands: [
    {
      id: 'b1', name: 'Glow Beauty', email: 'admin@glowbeauty.vn', phone: '028 1234 5678',
      industry: 'Cosmetics', plan: 'Agency' as const, status: 'active' as const,
      campaignCount: 4, kolCount: 6, productCount: 4,
      totalViews: 2850000, engagementRate: 7.2, conversionRate: 5.1,
      totalPayment: 425000000, createdAt: '2026-01-15',
    },
    {
      id: 'b2', name: 'Cocoon Vietnam', email: 'contact@cocoon.vn', phone: '028 8888 9999',
      industry: 'Cosmetics', plan: 'Enterprise' as const, status: 'active' as const,
      campaignCount: 6, kolCount: 12, productCount: 7,
      totalViews: 6200000, engagementRate: 8.4, conversionRate: 6.3,
      totalPayment: 890000000, createdAt: '2025-09-01',
    },
    {
      id: 'b3', name: 'Lemonade Drink', email: 'team@lemonade.vn', phone: '028 7777 6666',
      industry: 'Food & Beverage', plan: 'Starter' as const, status: 'active' as const,
      campaignCount: 2, kolCount: 4, productCount: 3,
      totalViews: 420000, engagementRate: 5.8, conversionRate: 3.2,
      totalPayment: 68000000, createdAt: '2026-03-10',
    },
  ],
  products: [
    // Glow Beauty products
    { id: 'p1', brandId: 'b1', brandName: 'Glow Beauty', name: 'Glow Serum Cấp Ẩm Chuyên Sâu', category: 'Skincare', price: '299.000 VND', productLink: 'https://glowbeauty.vn/serum', status: 'active' as const, image: 'serum', description: 'Serum cấp ẩm với Hyaluronic Acid và Vitamin B5', campaignCount: 2 },
    { id: 'p2', brandId: 'b1', brandName: 'Glow Beauty', name: 'Glow Sữa Rửa Mặt Nhẹ Nhàng', category: 'Skincare', price: '159.000 VND', productLink: 'https://glowbeauty.vn/cleanser', status: 'active' as const, image: 'cleanser', description: 'Sữa rửa mặt dịu nhẹ, không gây khô da', campaignCount: 1 },
    { id: 'p3', brandId: 'b1', brandName: 'Glow Beauty', name: 'Glow Kem Chống Nắng SPF 50+', category: 'Skincare', price: '349.000 VND', productLink: 'https://glowbeauty.vn/sunscreen', status: 'active' as const, image: 'sunscreen', description: 'Kem chống nắng SPF 50+, chống UVA/UVB', campaignCount: 1 },
    { id: 'p4', brandId: 'b1', brandName: 'Glow Beauty', name: 'Glow Tinh Chất Vitamin C', category: 'Skincare', price: '420.000 VND', productLink: 'https://glowbeauty.vn/vitamin-c', status: 'active' as const, image: 'vitaminc', description: 'Tinh chất Vitamin C 20% cho da sáng mịn', campaignCount: 0 },
    // Cocoon products
    { id: 'p5', brandId: 'b2', brandName: 'Cocoon Vietnam', name: 'Cocoon Nước Hoa Hồng 100ml', category: 'Skincare', price: '185.000 VND', productLink: 'https://cocoon.vn/rose-water', status: 'active' as const, image: 'rosewater', description: 'Nước hoa hồng hữu cơ 100%', campaignCount: 3 },
    { id: 'p6', brandId: 'b2', brandName: 'Cocoon Vietnam', name: 'Cocoon Kem Dưỡng Ẩm', category: 'Skincare', price: '245.000 VND', productLink: 'https://cocoon.vn/moisturizer', status: 'active' as const, image: 'moisturizer', description: 'Kem dưỡng ẩm cho mọi loại da', campaignCount: 2 },
    // Lemonade products
    { id: 'p7', brandId: 'b3', brandName: 'Lemonade Drink', name: 'Lemonade Detox 500ml', category: 'Beverage', price: '35.000 VND', productLink: 'https://lemonade.vn/detox', status: 'active' as const, image: 'detox', description: 'Nước giải khát detox tự nhiên', campaignCount: 1 },
  ],
  campaigns: [
    {
      id: 'c1', brandId: 'b1', productId: 'p1', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', brandName: 'Glow Beauty',
      name: 'Glow Serum Launch - Spring 2026',
      objective: 'Increase awareness and drive conversions for Glow Serum product launch',
      brief: 'Tạo nội dung giới thiệu serum cấp ẩm: texture mỏng nhẹ, cảm giác sau apply, kết quả sau 7 ngày, CTA mua hàng',
      kpiTarget: { views: 100000, engagementRate: 6, conversions: 50 }, timeline: '2026-04-01 → 2026-06-30',
      deadline: '2026-06-30', paymentRule: 'Base fee + 5% bonus nếu vượt 120% KPI views',
      status: 'tracking' as const, budget: 85000000, spent: 52000000,
      assignedKOLs: (['k1', 'k5', 'k9'] as string[]),
      totalViews: 785000, avgEngagementRate: 7.2, totalConversions: 42, createdAt: '2026-03-15',
    },
    {
      id: 'c2', brandId: 'b1', productId: 'p2', productName: 'Glow Sữa Rửa Mặt Nhẹ Nhàng', brandName: 'Glow Beauty',
      name: 'Glow Cleanser Gentle Campaign',
      objective: 'Promote the gentle cleansing product for sensitive skin audience',
      brief: 'Review/demo sữa rửa mặt: dịu nhẹ, không gây khô, phù hợp da nhạy cảm, mention key ingredients',
      kpiTarget: { views: 50000, engagementRate: 5, conversions: 25 }, timeline: '2026-05-01 → 2026-07-31',
      deadline: '2026-07-31', paymentRule: 'Fixed fee per content piece',
      status: 'active' as const, budget: 35000000, spent: 8500000,
      assignedKOLs: (['k2', 'k6'] as string[]),
      totalViews: 32000, avgEngagementRate: 5.8, totalConversions: 18, createdAt: '2026-04-20',
    },
    {
      id: 'c3', brandId: 'b1', productId: 'p3', productName: 'Glow Kem Chống Nắng SPF 50+', brandName: 'Glow Beauty',
      name: 'Glow Sunscreen Summer Protection',
      objective: 'Drive awareness for the SPF 50+ sunscreen product line',
      brief: 'Content về lợi ích chống nắng, demo sản phẩm không để lại vệt trắng, UV protection benefits',
      kpiTarget: { views: 80000, engagementRate: 6, conversions: 40 }, timeline: '2026-05-15 → 2026-08-15',
      deadline: '2026-08-15', paymentRule: 'Base fee + 3% bonus per 10K views above target',
      status: 'active' as const, budget: 60000000, spent: 12000000,
      assignedKOLs: (['k1', 'k3', 'k7'] as string[]),
      totalViews: 58000, avgEngagementRate: 6.4, totalConversions: 31, createdAt: '2026-05-01',
    },
    {
      id: 'c4', brandId: 'b1', productId: 'p4', productName: 'Glow Tinh Chất Vitamin C', brandName: 'Glow Beauty',
      name: 'Glow Vitamin C Brightening Launch',
      objective: 'Launch the new Vitamin C serum with KOL-driven awareness campaign',
      brief: 'Giới thiệu tinh chất Vitamin C 20%: hiệu quả dưỡng sáng, giảm thâm nám, routine combination tips',
      kpiTarget: { views: 120000, engagementRate: 7, conversions: 60 }, timeline: '2026-06-01 → 2026-09-30',
      deadline: '2026-09-30', paymentRule: 'Base fee + performance bonus',
      status: 'draft' as const, budget: 95000000, spent: 0,
      assignedKOLs: [] as string[],
      totalViews: 0, avgEngagementRate: 0, totalConversions: 0, createdAt: '2026-05-25',
    },
    // Cocoon campaigns
    {
      id: 'c5', brandId: 'b2', productId: 'p5', productName: 'Cocoon Nước Hoa Hồng 100ml', brandName: 'Cocoon Vietnam',
      name: 'Cocoon Rose Water - Summer Glow',
      objective: 'Drive sales of rose water toner for summer skincare routine',
      brief: 'Review và demo nước hoa hồng: toning step, moisture lock, layering tips với serum',
      kpiTarget: { views: 200000, engagementRate: 8, conversions: 100 }, timeline: '2026-04-01 → 2026-07-31',
      deadline: '2026-07-31', paymentRule: 'Base fee + 4% conversion bonus',
      status: 'tracking' as const, budget: 150000000, spent: 78000000,
      assignedKOLs: (['k1', 'k3', 'k5', 'k8'] as string[]),
      totalViews: 1850000, avgEngagementRate: 8.7, totalConversions: 95, createdAt: '2026-03-20',
    },
    // Lemonade campaigns
    {
      id: 'c6', brandId: 'b3', productId: 'p7', productName: 'Lemonade Detox 500ml', brandName: 'Lemonade Drink',
      name: 'Lemonade Summer Detox Challenge',
      objective: 'Promote the detox drink for health-conscious young audience',
      brief: 'Content về lợi ích detox, healthy lifestyle, summer refreshment, promo code activation',
      kpiTarget: { views: 30000, engagementRate: 5, conversions: 15 }, timeline: '2026-06-01 → 2026-08-31',
      deadline: '2026-08-31', paymentRule: 'Fixed fee per content piece',
      status: 'active' as const, budget: 20000000, spent: 5000000,
      assignedKOLs: (['k2', 'k10'] as string[]),
      totalViews: 18000, avgEngagementRate: 4.9, totalConversions: 8, createdAt: '2026-05-15',
    },
  ],
  kols: [
    { id: 'k1', brandId: 'b1', name: 'Linh Beauty', email: 'linhbeauty@gmail.com', handle: '@linhbeauty.official', platform: 'TikTok', role: 'KOL' as const, followers: 1200000, followersDisplay: '1.2M', engagementRate: 6.8, niche: 'Skincare', contentCategory: 'Chăm sóc da', bookingPrice: 8500000, status: 'active' as const, avatar: 'LB', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LinhBeauty&backgroundColor=b6e3f4', bio: 'Beauty Blogger | Skincare Enthusiast | 1.2M followers on TikTok', currentRank: 1, totalEarned: 127500000, pendingPayment: 17000000 },
    { id: 'k2', brandId: 'b1', name: 'Minh Food Review', email: 'minhfoodreview@gmail.com', handle: '@minhfoodreview.vn', platform: 'Facebook', role: 'KOC' as const, followers: 35000, followersDisplay: '35K', engagementRate: 8.2, niche: 'Food & Lifestyle', contentCategory: 'Review đồ ăn', bookingPrice: 2500000, status: 'active' as const, avatar: 'MF', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinhFood&backgroundColor=ffd5dc', bio: 'Food Reviewer | Đi Ăn Là Chạy', currentRank: 3, totalEarned: 32500000, pendingPayment: 5000000 },
    { id: 'k3', brandId: 'b1', name: 'Tuấn Tech Review', email: 'tuantech@gmail.com', handle: '@tuantechreview', platform: 'YouTube', role: 'KOL' as const, followers: 850000, followersDisplay: '850K', engagementRate: 5.4, niche: 'Tech', contentCategory: 'Review công nghệ', bookingPrice: 12000000, status: 'active' as const, avatar: 'TT', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TuanTech&backgroundColor=c0aede', bio: 'Tech Reviewer | Unboxing & Review', currentRank: 2, totalEarned: 96000000, pendingPayment: 12000000 },
    { id: 'k4', brandId: 'b1', name: 'Hà Fitness', email: 'hafitness@gmail.com', handle: '@hafitness.life', platform: 'TikTok', role: 'KOL' as const, followers: 680000, followersDisplay: '680K', engagementRate: 7.5, niche: 'Fitness', contentCategory: 'Thể hình & Sức khỏe', bookingPrice: 6500000, status: 'active' as const, avatar: 'HF', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HaFitness&backgroundColor=d1d4f9', bio: 'Fitness Coach | Home Workout | Protein Lover', currentRank: 4, totalEarned: 71500000, pendingPayment: 6500000 },
    { id: 'k5', brandId: 'b1', name: 'Phương Makeup', email: 'phuongmakeup@gmail.com', handle: '@phuongmakeup.studio', platform: 'Instagram', role: 'KOC' as const, followers: 45000, followersDisplay: '45K', engagementRate: 9.1, niche: 'Beauty', contentCategory: 'Trang điểm', bookingPrice: 3500000, status: 'active' as const, avatar: 'PM', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhuongMakeup&backgroundColor=ffdfbf', bio: 'Makeup Artist | Tutorial & Review', currentRank: 5, totalEarned: 42000000, pendingPayment: 7000000 },
    { id: 'k6', brandId: 'b1', name: 'Anh Khoa Fitness', email: 'anhkhoafit@gmail.com', handle: '@anhkhoafit_official', platform: 'YouTube', role: 'KOL' as const, followers: 420000, followersDisplay: '420K', engagementRate: 6.2, niche: 'Fitness', contentCategory: 'Thể hình', bookingPrice: 5500000, status: 'active' as const, avatar: 'AK', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnhKhoa&backgroundColor=ffedef', bio: 'Bodybuilding Coach | YouTube Fitness Partner', currentRank: 6, totalEarned: 55000000, pendingPayment: 11000000 },
    { id: 'k7', brandId: 'b2', name: 'Mỹ Hà Beauty', email: 'myha@gmail.com', handle: '@myhabu', platform: 'TikTok', role: 'KOL' as const, followers: 920000, followersDisplay: '920K', engagementRate: 7.1, niche: 'Skincare', contentCategory: 'Chăm sóc da', bookingPrice: 7500000, status: 'active' as const, avatar: 'MH', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyHa&backgroundColor=b6e3f4', bio: 'Skincare Expert | Beauty Guru', currentRank: 1, totalEarned: 215000000, pendingPayment: 22000000 },
    { id: 'k8', brandId: 'b2', name: 'Lan Trần Lifestyle', email: 'lantran@gmail.com', handle: '@lantranlifestyle', platform: 'Instagram', role: 'KOL' as const, followers: 380000, followersDisplay: '380K', engagementRate: 8.3, niche: 'Lifestyle', contentCategory: 'Lifestyle', bookingPrice: 5000000, status: 'active' as const, avatar: 'LT', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LanTran&backgroundColor=ffd5dc', bio: 'Lifestyle Influencer | Home Decor | Beauty', currentRank: 2, totalEarned: 145000000, pendingPayment: 15000000 },
    { id: 'k9', brandId: 'b1', name: 'Huyền Chi Skincare', email: 'huyenchiskincare@gmail.com', handle: '@huyenchiskincare', platform: 'TikTok', role: 'KOC' as const, followers: 28000, followersDisplay: '28K', engagementRate: 9.4, niche: 'Skincare', contentCategory: 'Chăm sóc da', bookingPrice: 1500000, status: 'active' as const, avatar: 'HC', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuyenChi&backgroundColor=c0aede', bio: 'Skincare Enthusiast | Budget Beauty Tips', currentRank: 7, totalEarned: 18500000, pendingPayment: 3000000 },
    { id: 'k10', brandId: 'b3', name: 'Ngọc Minh Health', email: 'ngocminhhealth@gmail.com', handle: '@ngocminhhealth', platform: 'YouTube', role: 'KOL' as const, followers: 150000, followersDisplay: '150K', engagementRate: 6.8, niche: 'Health', contentCategory: 'Sức khỏe', bookingPrice: 4000000, status: 'active' as const, avatar: 'NM', avatarImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NgocMinh&backgroundColor=d1d4f9', bio: 'Health & Wellness Coach', currentRank: 1, totalEarned: 48000000, pendingPayment: 8000000 },
  ],
  tasks: [
    // Glow Serum Launch tasks
    { id: 't1', campaignId: 'c1', campaignName: 'Glow Serum Launch - Spring 2026', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', kolId: 'k1', kolName: 'Linh Beauty', kolPlatform: 'TikTok', kolAvatar: 'LB', brief: 'Tạo video TikTok 30-60s giới thiệu Glow Serum: texture, cảm giác sau apply, kết quả sau 7 ngày, CTA', contentRequirements: 'Video vertical, voiceover, product demo, promo code GLOW20', kpiTarget: { views: 100000, engagementRate: 6 }, deadline: '2026-06-25', paymentAmount: 8500000, status: 'metrics_approved' as const, draftContent: [{ contentUrl: 'draft_v1.mp4', caption: 'Serum mới của Glow Beauty 🌟', submittedAt: '2026-06-10 14:30', version: 1, feedback: 'Cần thêm logo brand' }, { contentUrl: 'draft_v2.mp4', caption: 'Serum cấp ẩm cực xịn! ✨', submittedAt: '2026-06-12 09:15', version: 2, feedback: 'Cần thu ngắn intro' }, { contentUrl: 'draft_v3.mp4', caption: 'Dưỡng ẩm đỉnh cao 💧', submittedAt: '2026-06-15 16:45', version: 3 }], publishedContent: { postUrl: 'https://tiktok.com/@linhbeauty.official/video/7284910234', publishedAt: '2026-06-16 10:00' }, metrics: { views: 145000, likes: 8500, comments: 1200, shares: 680, saves: 420, engagementRate: 7.5, snapshots: [{ time: '24h', date: '2026-06-17', views: 45000, likes: 2800 }, { time: 'final', date: '2026-06-30', views: 145000, likes: 8500 }], brandConfirmed: true }, conversion: { orders: 42, leads: 65, couponUsage: 35, revenue: 8400000 }, createdAt: '2026-03-20' },
    { id: 't2', campaignId: 'c1', campaignName: 'Glow Serum Launch - Spring 2026', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', kolId: 'k5', kolName: 'Phương Makeup', kolPlatform: 'Instagram', kolAvatar: 'PM', brief: 'Instagram post và story giới thiệu serum: hình ảnh sản phẩm, swatches, review ngắn', contentRequirements: 'Carousel 5-8 slides, story series 3-4 stories, hashtag brand', kpiTarget: { views: 30000, engagementRate: 6 }, deadline: '2026-06-20', paymentAmount: 3500000, status: 'published' as const, draftContent: [{ contentUrl: 'carousel_v1.jpg', caption: 'Serum cấp ẩm 💧 #GlowBeauty #Skincare', submittedAt: '2026-06-08 11:00', version: 1 }], publishedContent: { postUrl: 'https://instagram.com/p/ABC123', publishedAt: '2026-06-09 15:00' }, metrics: { views: 38000, likes: 2900, comments: 340, shares: 180, saves: 290, engagementRate: 7.6, snapshots: [{ time: 'final', date: '2026-06-30', views: 38000, likes: 2900 }], brandConfirmed: true }, createdAt: '2026-03-22' },
    { id: 't3', campaignId: 'c1', campaignName: 'Glow Serum Launch - Spring 2026', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', kolId: 'k9', kolName: 'Huyền Chi Skincare', kolPlatform: 'TikTok', kolAvatar: 'HC', brief: 'TikTok review ngắn gọn về serum: texture, mùi, cảm giác dùng', contentRequirements: 'TikTok video 15-30s, honest review, CTA mua hàng', kpiTarget: { views: 15000, engagementRate: 6 }, deadline: '2026-06-28', paymentAmount: 1500000, status: 'draft_submitted' as const, draftContent: [{ contentUrl: 'huyenchi_v1.mp4', caption: 'Review serum Glow Beauty 💕', submittedAt: '2026-06-28 16:00', version: 1 }], createdAt: '2026-04-10' },
    // Glow Cleanser tasks
    { id: 't4', campaignId: 'c2', campaignName: 'Glow Cleanser Gentle Campaign', productName: 'Glow Sữa Rửa Mặt Nhẹ Nhàng', kolId: 'k2', kolName: 'Minh Food Review', kolPlatform: 'Facebook', kolAvatar: 'MF', brief: 'Review sữa rửa mặt: phù hợp da nhạy cảm, không gây khô, dịu nhẹ', contentRequirements: 'Video review 2-3 phút, trước và sau khi dùng, mention key ingredients', kpiTarget: { views: 15000, engagementRate: 6 }, deadline: '2026-07-20', paymentAmount: 2500000, status: 'draft_submitted' as const, draftContent: [{ contentUrl: 'cleanser_review.mp4', caption: 'Sữa rửa mặt dịu nhẹ 🌿', submittedAt: '2026-06-28 16:00', version: 1 }], createdAt: '2026-05-01' },
    { id: 't5', campaignId: 'c2', campaignName: 'Glow Cleanser Gentle Campaign', productName: 'Glow Sữa Rửa Mặt Nhẹ Nhàng', kolId: 'k6', kolName: 'Anh Khoa Fitness', kolPlatform: 'YouTube', kolAvatar: 'AK', brief: 'YouTube review sữa rửa mặt cho da nhạy cảm: phù hợp sau gym', contentRequirements: 'Video 5-8 phút, kênh fitness-lifestyle hybrid', kpiTarget: { views: 20000, engagementRate: 5 }, deadline: '2026-07-25', paymentAmount: 5500000, status: 'revision_required' as const, draftContent: [{ contentUrl: 'cleanser_yt_v1.mp4', caption: 'Glow Cleanser Review', submittedAt: '2026-06-20 10:00', version: 1, feedback: 'Cần thêm comparison với sản phẩm khác và phần về scent của sản phẩm' }], createdAt: '2026-05-05' },
    // Glow Sunscreen tasks
    { id: 't6', campaignId: 'c3', campaignName: 'Glow Sunscreen Summer Protection', productName: 'Glow Kem Chống Nắng SPF 50+', kolId: 'k3', kolName: 'Tuấn Tech Review', kolPlatform: 'YouTube', kolAvatar: 'TT', brief: 'YouTube review kem chống nắng: SPF testing, không để lại vệt trắng, UV protection', contentRequirements: 'Video 8-12 phút, professional setup, include UV lamp test', kpiTarget: { views: 40000, engagementRate: 5 }, deadline: '2026-08-10', paymentAmount: 12000000, status: 'assigned' as const, createdAt: '2026-05-10' },
    { id: 't7', campaignId: 'c3', campaignName: 'Glow Sunscreen Summer Protection', productName: 'Glow Kem Chống Nắng SPF 50+', kolId: 'k7', kolName: 'Mỹ Hà Beauty', kolPlatform: 'TikTok', kolAvatar: 'MH', brief: 'TikTok video chống nắng: application demo, không để lại vệt trắng, summer routine', contentRequirements: 'TikTok 30-60s, outdoor filming, before/after UV test', kpiTarget: { views: 50000, engagementRate: 6 }, deadline: '2026-08-05', paymentAmount: 7500000, status: 'assigned' as const, createdAt: '2026-05-12' },
    // Vitamin C launch tasks (draft campaign)
    { id: 't8', campaignId: 'c4', campaignName: 'Glow Vitamin C Brightening Launch', productName: 'Glow Tinh Chất Vitamin C', kolId: 'k1', kolName: 'Linh Beauty', kolPlatform: 'TikTok', kolAvatar: 'LB', brief: 'Teaser content cho sản phẩm mới Vitamin C: preview packaging, hint về benefits', contentRequirements: 'Teaser video 15s, countdown style, teaser caption', kpiTarget: { views: 20000, engagementRate: 7 }, deadline: '2026-09-20', paymentAmount: 8500000, status: 'assigned' as const, createdAt: '2026-05-25' },
  ],
  payments: [
    { id: 'pay1', taskId: 't1', campaignId: 'c1', campaignName: 'Glow Serum Launch - Spring 2026', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', kolId: 'k1', kolName: 'Linh Beauty', kolAvatar: 'LB', kolPlatform: 'TikTok', amount: 8500000, bonus: 425000, totalAmount: 8925000, paidAmount: 8925000, status: 'paid' as const, qrPaymentUrl: 'qr_linhbeauty.png', dueDate: '2026-07-01', paidDate: '2026-06-28', invoiceNumber: 'INV-2026-0089', brandEnteredConversions: true },
    { id: 'pay2', taskId: 't2', campaignId: 'c1', campaignName: 'Glow Serum Launch - Spring 2026', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', kolId: 'k5', kolName: 'Phương Makeup', kolAvatar: 'PM', kolPlatform: 'Instagram', amount: 3500000, bonus: 0, totalAmount: 3500000, paidAmount: 3500000, status: 'paid' as const, qrPaymentUrl: 'qr_phuongmakeup.png', dueDate: '2026-07-05', paidDate: '2026-07-01', invoiceNumber: 'INV-2026-0090', brandEnteredConversions: true },
    { id: 'pay3', taskId: 't3', campaignId: 'c1', campaignName: 'Glow Serum Launch - Spring 2026', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', kolId: 'k9', kolName: 'Huyền Chi Skincare', kolAvatar: 'HC', kolPlatform: 'TikTok', amount: 1500000, bonus: 0, totalAmount: 1500000, paidAmount: 0, status: 'pending' as const, qrPaymentUrl: 'qr_huyenchi.png', dueDate: '2026-07-15', brandEnteredConversions: false },
    { id: 'pay4', taskId: 't4', campaignId: 'c2', campaignName: 'Glow Cleanser Gentle Campaign', productName: 'Glow Sữa Rửa Mặt Nhẹ Nhàng', kolId: 'k2', kolName: 'Minh Food Review', kolAvatar: 'MF', kolPlatform: 'Facebook', amount: 2500000, bonus: 0, totalAmount: 2500000, paidAmount: 0, status: 'pending' as const, qrPaymentUrl: 'qr_minhfood.png', dueDate: '2026-07-20', brandEnteredConversions: false },
    { id: 'pay5', taskId: 't5', campaignId: 'c2', campaignName: 'Glow Cleanser Gentle Campaign', productName: 'Glow Sữa Rửa Mặt Nhẹ Nhàng', kolId: 'k6', kolName: 'Anh Khoa Fitness', kolAvatar: 'AK', kolPlatform: 'YouTube', amount: 5500000, bonus: 0, totalAmount: 5500000, paidAmount: 2750000, status: 'partial_paid' as const, qrPaymentUrl: 'qr_anhkhoafit.png', dueDate: '2026-07-25', brandEnteredConversions: false },
    { id: 'pay6', taskId: 't6', campaignId: 'c3', campaignName: 'Glow Sunscreen Summer Protection', productName: 'Glow Kem Chống Nắng SPF 50+', kolId: 'k3', kolName: 'Tuấn Tech Review', kolAvatar: 'TT', kolPlatform: 'YouTube', amount: 12000000, bonus: 0, totalAmount: 12000000, paidAmount: 0, status: 'pending' as const, qrPaymentUrl: 'qr_tuantech.png', dueDate: '2026-08-10', brandEnteredConversions: false },
    { id: 'pay7', taskId: 't7', campaignId: 'c3', campaignName: 'Glow Sunscreen Summer Protection', productName: 'Glow Kem Chống Nắng SPF 50+', kolId: 'k7', kolName: 'Mỹ Hà Beauty', kolAvatar: 'MH', kolPlatform: 'TikTok', amount: 7500000, bonus: 0, totalAmount: 7500000, paidAmount: 0, status: 'pending' as const, qrPaymentUrl: 'qr_myhabeauty.png', dueDate: '2026-08-05', brandEnteredConversions: false },
    { id: 'pay8', taskId: 't8', campaignId: 'c4', campaignName: 'Glow Vitamin C Brightening Launch', productName: 'Glow Tinh Chất Vitamin C', kolId: 'k1', kolName: 'Linh Beauty', kolAvatar: 'LB', kolPlatform: 'TikTok', amount: 8500000, bonus: 0, totalAmount: 8500000, paidAmount: 0, status: 'pending' as const, qrPaymentUrl: 'qr_vitaminc.png', dueDate: '2026-09-20', brandEnteredConversions: false },
  ],
  kolRankings: [
    { kolId: 'k1', kolName: 'Linh Beauty', totalViews: 1250000, avgEngagementRate: 6.8, score: 95, rank: 1 },
    { kolId: 'k3', kolName: 'Tuấn Tech Review', totalViews: 850000, avgEngagementRate: 5.4, score: 82, rank: 2 },
    { kolId: 'k2', kolName: 'Minh Food Review', totalViews: 350000, avgEngagementRate: 8.2, score: 78, rank: 3 },
    { kolId: 'k4', kolName: 'Hà Fitness', totalViews: 680000, avgEngagementRate: 7.5, score: 75, rank: 4 },
    { kolId: 'k5', kolName: 'Phương Makeup', totalViews: 45000, avgEngagementRate: 9.1, score: 72, rank: 5 },
    { kolId: 'k6', kolName: 'Anh Khoa Fitness', totalViews: 420000, avgEngagementRate: 6.2, score: 68, rank: 6 },
    { kolId: 'k9', kolName: 'Huyền Chi Skincare', totalViews: 28000, avgEngagementRate: 9.4, score: 65, rank: 7 },
  ],
  campaignRankings: [
    { campaignId: 'c5', campaignName: 'Cocoon Rose Water - Summer Glow', productName: 'Cocoon Nước Hoa Hồng 100ml', totalViews: 1850000, avgEngagementRate: 8.7, conversionRate: 5.1, score: 98, rank: 1 },
    { campaignId: 'c1', campaignName: 'Glow Serum Launch - Spring 2026', productName: 'Glow Serum Cấp Ẩm Chuyên Sâu', totalViews: 785000, avgEngagementRate: 7.2, conversionRate: 5.3, score: 88, rank: 2 },
    { campaignId: 'c3', campaignName: 'Glow Sunscreen Summer Protection', productName: 'Glow Kem Chống Nắng SPF 50+', totalViews: 58000, avgEngagementRate: 6.4, conversionRate: 5.3, score: 72, rank: 3 },
    { campaignId: 'c6', campaignName: 'Lemonade Summer Detox Challenge', productName: 'Lemonade Detox 500ml', totalViews: 18000, avgEngagementRate: 4.9, conversionRate: 4.4, score: 58, rank: 4 },
    { campaignId: 'c2', campaignName: 'Glow Cleanser Gentle Campaign', productName: 'Glow Sữa Rửa Mặt Nhẹ Nhàng', totalViews: 32000, avgEngagementRate: 5.8, conversionRate: 5.6, score: 55, rank: 5 },
  ],
};

// NOTE: `campaigns` và `campaignRankings` KHÔNG còn lấy từ mock — chúng đến từ Supabase
// (xem BrandDashboard + BrandDataContext bên dưới). Các phần còn lại vẫn là mock cho tới Phase 4.
const { brands, products, kols, tasks, payments, kolRankings } = BRAND_DATA as typeof BRAND_DATA;

// Tasks/payments/KOL mock vẫn gắn với các campaign mock của brand b1
const MOCK_BRAND_CAMPAIGN_IDS = new Set(
  BRAND_DATA.campaigns.filter(c => c.brandId === currentBrandId).map(c => c.id as string)
);
const MOCK_BRAND_KOL_IDS = new Set(
  BRAND_DATA.campaigns.filter(c => c.brandId === currentBrandId).flatMap(c => c.assignedKOLs as string[])
);

// ═══════════════════════════════════════════════════════════════════════
// SUPABASE ADAPTER — campaigns
// Supabase trả về snake_case (campaign_name, brand_id, ...) → map sang camelCase
// để toàn bộ UI hiện có (c.name, c.brandId, c.productName, ...) chạy được không phải sửa.
// ═══════════════════════════════════════════════════════════════════════

type CampaignRow = Record<string, any>;

type CampaignRanking = {
  campaignId: string; campaignName: string; productName: string;
  totalViews: number; avgEngagementRate: number; conversionRate: number; score: number; rank: number;
};

const CAMPAIGN_STATUSES: readonly string[] = ['draft', 'active', 'paused', 'tracking', 'completed', 'cancelled'];

const toNumber = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const toDateOnly = (v: unknown) => (v ? String(v).slice(0, 10) : '');

function mapCampaignRow(row: CampaignRow, productNames: Record<string, string>): Campaign {
  const rawStatus = String(row.status ?? 'draft').toLowerCase();   // DB có thể lưu 'DRAFT'
  const productId = row.product_id != null ? String(row.product_id) : '';
  return {
    id: String(row.id),
    brandId: row.brand_id != null ? String(row.brand_id) : '',
    productId,
    productName: row.products?.product_name ?? row.product_name ?? productNames[productId] ?? '—',
    brandName: row.brands?.brand_name ?? row.brand_name ?? '',
    name: row.campaign_name ?? row.name ?? '(Chưa đặt tên)',
    objective: row.objective ?? '',
    brief: row.campaign_brief ?? row.brief ?? '',
    paymentRule: row.payment_rule ?? '',
    status: (CAMPAIGN_STATUSES.includes(rawStatus) ? rawStatus : 'draft') as CampaignStatus,
    budget: toNumber(row.budget),
    spent: toNumber(row.spent),
    assignedKOLs: [],                                   // Phase 4: lấy từ bảng tasks
    totalViews: toNumber(row.total_views),
    avgEngagementRate: toNumber(row.avg_engagement_rate),
    totalConversions: toNumber(row.total_conversions),
    startDate: toDateOnly(row.start_date),
    deadline: toDateOnly(row.end_date ?? row.deadline),   // DB không có cột deadline → dùng end_date
    createdAt: toDateOnly(row.created_at),
    kpiTarget: {
      views: toNumber(row.target_views),
      engagementRate: toNumber(row.target_engagement_rate ?? row.target_er),
      conversions: toNumber(row.target_conversion),
    },
  };
}

function buildCampaignRankings(list: Campaign[]): CampaignRanking[] {
  return [...list]
    .sort((a, b) => b.totalViews - a.totalViews)
    .map((c, i) => {
      const viewsPct = c.kpiTarget.views > 0 ? Math.min(100, (c.totalViews / c.kpiTarget.views) * 100) : 0;
      const erPct = c.kpiTarget.engagementRate > 0 ? Math.min(100, (c.avgEngagementRate / c.kpiTarget.engagementRate) * 100) : 0;
      return {
        campaignId: c.id,
        campaignName: c.name,
        productName: c.productName,
        totalViews: c.totalViews,
        avgEngagementRate: c.avgEngagementRate,
        conversionRate: c.totalViews > 0 ? Number(((c.totalConversions / c.totalViews) * 100).toFixed(1)) : 0,
        score: Math.round(viewsPct * 0.6 + erPct * 0.4),
        rank: i + 1,
      };
    });
}

// Context: chia sẻ dữ liệu Supabase cho các view con (các view là function ở module level)
type BrandDataContextValue = {
  campaigns: Campaign[];
  campaignRankings: CampaignRanking[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const BrandDataContext = createContext<BrandDataContextValue>({
  campaigns: [], campaignRankings: [], loading: true, error: null, reload: async () => { },
});

const useBrandContext = () => useContext(BrandDataContext);

// Các thao tác đổi trạng thái campaign → giá trị ghi vào DB
type CampaignStatusAction = 'activate' | 'pause' | 'resume' | 'complete';

const CAMPAIGN_STATUS_ACTIONS: Record<CampaignStatusAction, {
  title: string; text: string; label: string; dbStatus: 'ACTIVE' | 'PAUSED' | 'COMPLETED'; box: string; btn: string;
}> = {
  activate: {
    title: 'Kích hoạt chiến dịch',
    text: 'Chiến dịch sẽ được mở — KOL/KOC sẽ nhìn thấy chiến dịch này trong mục Khám phá.',
    label: 'Kích hoạt', dbStatus: 'ACTIVE',
    box: 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
  },
  pause: {
    title: 'Tạm dừng chiến dịch',
    text: 'Chiến dịch sẽ bị tạm dừng và ẩn khỏi KOL/KOC. Bạn có thể tiếp tục chạy lại sau.',
    label: 'Tạm dừng', dbStatus: 'PAUSED',
    box: 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40',
    btn: 'bg-amber-600 hover:bg-amber-700',
  },
  resume: {
    title: 'Tiếp tục chiến dịch',
    text: 'Chiến dịch sẽ tiếp tục chạy và hiển thị lại cho KOL/KOC.',
    label: 'Tiếp tục', dbStatus: 'ACTIVE',
    box: 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40',
    btn: 'bg-blue-600 hover:bg-blue-700',
  },
  complete: {
    title: 'Kết thúc chiến dịch',
    text: 'Chiến dịch sẽ được đánh dấu hoàn thành. Không thể giao nhiệm vụ mới.',
    label: 'Kết thúc', dbStatus: 'COMPLETED',
    box: 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
  },
};


export type TaskStatus = 'assigned' | 'draft_submitted' | 'revision_required' | 'approved_to_publish' | 'published' | 'tracking' | 'metrics_submitted' | 'metrics_approved' | 'completed' | 'payment_pending' | 'paid' | 'hold' | 'rejected';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'tracking' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'partial_paid' | 'paid' | 'hold' | 'rejected';

export const taskStatusLabels: Record<TaskStatus, string> = {
  assigned: 'Đã phân công', draft_submitted: 'Đã nộp bản nháp', revision_required: 'Yêu cầu chỉnh sửa',
  approved_to_publish: 'Được phép đăng', published: 'Đã đăng bài', tracking: 'Đang theo dõi',
  metrics_submitted: 'Đã gửi metrics', metrics_approved: 'Đã xác nhận metrics', completed: 'Hoàn thành',
  payment_pending: 'Chờ thanh toán', paid: 'Đã thanh toán', hold: 'Tạm giữ', rejected: 'Bị từ chối',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  draft_submitted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  revision_required: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  approved_to_publish: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
  published: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  tracking: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  metrics_submitted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  metrics_approved: 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  payment_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  paid: 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300',
  hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  rejected: 'bg-slate-200 text-slate-300 dark:bg-slate-700 dark:text-slate-300',
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Bản nháp', active: 'Đang chạy', paused: 'Tạm dừng', tracking: 'Theo dõi', completed: 'Hoàn thành', cancelled: 'Đã hủy',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Chưa thanh toán', pending: 'Đang chờ', partial_paid: 'Thanh toán một phần',
  paid: 'Đã thanh toán', hold: 'Tạm giữ', rejected: 'Bị từ chối',
};

export const nicheColors: Record<string, string> = {
  Skincare: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  Beauty: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  Fitness: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  Tech: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  Food: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  Lifestyle: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  Health: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

export const nicheLabels: Record<string, string> = {
  Skincare: 'Skincare', Beauty: 'Làm đẹp', Fitness: 'Thể hình',
  Tech: 'Công nghệ', 'Food & Lifestyle': 'Ăn uống', Health: 'Sức khỏe',
};

export const productCategories = ['Skincare', 'Makeup', 'Haircare', 'Beverage', 'Food', 'Tech', 'Fashion', 'Fitness', 'Lifestyle', 'Health'];

// ═══════════════════════════════════════════════════════════════════════
// BRAND DASHBOARD — NAVIGATION SHELL
// ═══════════════════════════════════════════════════════════════════════

const brandViews = ['overview', 'products', 'campaigns', 'kol', 'tasks', 'content', 'performance', 'payment'] as const;
type BrandView = (typeof brandViews)[number];

// Component gốc: tải campaign thật từ Supabase rồi cấp cho toàn bộ dashboard qua context
export function BrandDashboard({ initialView = 'overview' }: { initialView?: string }) {
  const [showTaskModal, setShowTaskModal]
    =
    useState(false);


  const [selectedCampaign, setSelectedCampaign]
    =
    useState<any>(null);


  const [kols, setKols]
    =
    useState<any[]>([]);


  const [tasks, setTasks]
    =
    useState<any[]>([]);

  useEffect(() => {


    async function loadKOL() {

      const data =
        await kolService.getAllKOLs();

      setKols(data);

    }


    loadKOL();


  }, []);



  const [drafts, setDrafts]
    =
    useState<any[]>([]);
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoadError(null);

      // Lấy campaign + product song song; lỗi product không được làm hỏng danh sách campaign
      const [campaignRes, productRes] = await Promise.allSettled([
        campaignService.getAllCampaigns(),
        productService.getProductsByBrand(SUPABASE_BRAND_ID),
      ]);
      if (campaignRes.status === 'rejected') throw campaignRes.reason;

      const productNames: Record<string, string> = {};
      if (productRes.status === 'fulfilled') {
        (productRes.value as SupabaseProduct[]).forEach(p => { productNames[String(p.id)] = p.product_name; });
      }

      const rows = (campaignRes.value ?? []) as unknown as CampaignRow[];
      setCampaignList(
        rows
          .filter(r => !r.deleted_at)                                  // bỏ campaign đã xóa mềm
          .filter(r => String(r.brand_id) === String(SUPABASE_BRAND_ID))
          .map(r => mapCampaignRow(r, productNames))
      );
    } catch (error) {
      console.error('Load campaigns error:', error);
      setLoadError('Không thể tải chiến dịch từ Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const campaignRankings = useMemo(() => buildCampaignRankings(campaignList), [campaignList]);

  const contextValue = useMemo<BrandDataContextValue>(() => ({
    campaigns: campaignList, campaignRankings, loading, error: loadError, reload: loadCampaigns,
  }), [campaignList, campaignRankings, loading, loadError, loadCampaigns]);

  return (
    <BrandDataContext.Provider value={contextValue}>
      <BrandDashboardShell initialView={initialView} />
    </BrandDataContext.Provider>
  );
}

function BrandDashboardShell({ initialView = 'overview' }: { initialView?: string }) {
  const { campaigns, loading, error, reload } = useBrandContext();
  const [activeView, setActiveView] = useState<BrandView>(
    brandViews.includes(initialView as BrandView) ? (initialView as BrandView) : 'overview'
  );
  const [selectedProject, setSelectedProject] = useState('all');
  const [previousView, setPreviousView] = useState<BrandView | null>('overview');

  const navigateTo = (view: BrandView) => {
    if (view !== activeView) {
      setPreviousView(activeView);
      setActiveView(view);
    }
  };

  const goBack = () => {
    if (previousView) {
      setActiveView(previousView);
      setPreviousView('overview');
    }
  };

  const [popupData, setPopupData] = useState<{
    type: 'campaigns' | 'kol' | 'tasks' | 'payments' | 'reviews' | 'activities';
    title: string;
  } | null>(null);

  const [itemPopup, setItemPopup] = useState<{
    type: 'campaign' | 'kol';
    id: string;
  } | null>(null);

  const projectOptions = [
    { label: 'Tất cả dự án', value: 'all' },
    ...campaigns.map(c => ({
      label: c.name,
      value: c.id
    })),
  ];

  const renderView = () => {
    switch (activeView) {
      case 'products': return <ProductsView selectedProject={selectedProject} />;
      case 'campaigns': return <CampaignsView selectedProject={selectedProject} />;
      case 'kol': return <KOLView selectedProject={selectedProject} />;
      case 'tasks': return <TasksView selectedProject={selectedProject} />;
      case 'content': return <WorkflowView selectedProject={selectedProject} initialNode="content_review" />;
      case 'performance': return <WorkflowView selectedProject={selectedProject} initialNode="metrics_review" />;
      case 'payment': return <WorkflowView selectedProject={selectedProject} initialNode="payout" />;
      default: return <OverviewView
        selectedProject={selectedProject}
        onNavigate={navigateTo}
        onOpenPopup={(type, title) => setPopupData({ type, title })}
        onOpenItem={(type, id) => setItemPopup({ type, id })}
      />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeView !== 'overview' && (
            <button onClick={goBack} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 transition-colors border border-slate-200 dark:border-slate-700">
              <ChevronLeft className="w-4 h-4" />Quay lại
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="card-base p-10 text-center text-sm text-slate-500">Đang tải dữ liệu từ Supabase...</div>
      ) : (
        <>
          {error && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
              <span>{error}</span>
              <Button size="sm" variant="secondary" onClick={() => { reload(); }}>Thử lại</Button>
            </div>
          )}
          {renderView()}
        </>
      )}

      {/* Popup table modal — opened from overview */}
      <Modal isOpen={!!popupData} onClose={() => setPopupData(null)} title={popupData?.title || ''} width="max-w-4xl">
        {popupData && <OverviewPopupTable type={popupData.type} />}
      </Modal>

      {/* Item detail popup — campaign or KOL */}
      <Modal isOpen={!!itemPopup} onClose={() => setItemPopup(null)} title={itemPopup?.type === 'campaign' ? 'Chi tiết chiến dịch' : 'Chi tiết KOL/KOC'} width="max-w-3xl">
        {itemPopup && <ItemDetailPopup type={itemPopup.type} id={itemPopup.id} />}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════

function useBrandData(selectedProject: string) {
  const { campaigns } = useBrandContext();   // campaign: dữ liệu thật từ Supabase

  return useMemo(() => {
    const brandCampaigns = campaigns.filter(c =>
      selectedProject === 'all' || c.id === selectedProject
    );

    // tasks / payments / KOL: vẫn là mock (Phase 4 sẽ chuyển sang Supabase)
    const brandTasks = tasks.filter(t =>
      MOCK_BRAND_CAMPAIGN_IDS.has(t.campaignId) &&
      (selectedProject === 'all' || t.campaignId === selectedProject)
    );

    const brandPayments = payments.filter(p =>
      brandTasks.some(t => t.id === p.taskId)
    );

    const brandKOLs = kols.filter(k =>
      MOCK_BRAND_KOL_IDS.has(k.id) &&
      (selectedProject === 'all' || brandTasks.some(t => t.kolId === k.id))
    );

    return { brandCampaigns, brandTasks, brandPayments, brandKOLs };
  }, [campaigns, selectedProject]);
}
// ═══════════════════════════════════════════════════════════════════════

function OverviewView({ selectedProject, onNavigate, onOpenPopup, onOpenItem }: {
  selectedProject: string;
  onNavigate: (view: BrandView) => void;
  onOpenPopup: (type: 'campaigns' | 'kol' | 'tasks' | 'payments' | 'reviews' | 'activities', title: string) => void;
  onOpenItem: (type: 'campaign' | 'kol', id: string) => void;
}) {
  const { brandCampaigns, brandTasks, brandPayments, brandKOLs } = useBrandData(selectedProject);
  const { campaignRankings } = useBrandContext();
  const [filterKOL, setFilterKOL] = useState('all');
  const [filterTimeRange, setFilterTimeRange] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');

  const filteredCampaigns = useMemo(() => {
    let result = brandCampaigns;
    if (filterCampaign !== 'all') result = result.filter(c => c.id === filterCampaign);
    if (filterProduct !== 'all') result = result.filter(c => c.productName === filterProduct);
    return result;
  }, [brandCampaigns, filterCampaign, filterProduct]);

  const filteredTasks = useMemo(() => {
    let result = brandTasks;
    if (filterKOL !== 'all') result = result.filter(t => t.kolId === filterKOL);
    if (filterCampaign !== 'all') result = result.filter(t => t.campaignId === filterCampaign);
    return result;
  }, [brandTasks, filterKOL, filterCampaign]);

  const completedTasks = filteredTasks.filter(t => ['completed', 'paid', 'metrics_approved'].includes(t.status as TaskStatus)).length;
  const topKOL = kolRankings.find(r => filteredTasks.some(t => t.kolId === r.kolId));
  const totalViews = filteredCampaigns.reduce((s, c) => s + c.totalViews, 0);
  const totalEngagement = filteredCampaigns.reduce((s, c) => s + Math.round(c.totalViews * (c.avgEngagementRate / 100)), 0);
  const engagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : '0.0';
  const conversionRate = (filteredCampaigns.reduce((s, c) => s + (c.totalConversions || 0), 0) / Math.max(totalViews, 1) * 100).toFixed(1);
  const avgViews = filteredCampaigns.length > 0 ? Math.round(totalViews / filteredCampaigns.length) : 0;
  const kolCount = [...new Set(filteredTasks.map(t => t.kolId))].length;

  const completedCount = filteredCampaigns.filter(c => c.status === 'completed').length;
  const inProgressCount = filteredCampaigns.filter(c => ['active', 'tracking'].includes(c.status)).length;
  const notCompletedCount = filteredCampaigns.filter(c => ['draft', 'cancelled'].includes(c.status)).length;

  const campaignStatusData = [
    { name: 'Hoàn thành', value: completedCount, color: '#10b981' },
    { name: 'Đang thực hiện', value: inProgressCount, color: '#55B3D9' },
    { name: 'Chưa hoàn thành', value: notCompletedCount, color: '#f59e0b' },
  ];

  const trendData = brandCampaigns.slice(0, 6).map((c, i) => ({
    name: c.name.split(' ').slice(0, 2).join(' '),
    views: Math.round(c.totalViews * (0.78 + i * 0.05)),
    conversions: Math.round((c.totalConversions || 0) * (0.8 + i * 0.04)),
  }));

  const pendingPayments = brandPayments.filter(p => ['pending', 'partial_paid', 'hold'].includes(p.status)).slice(0, 5);
  const recentTasks = filteredTasks.slice(0, 5);
  const pendingReviews = filteredTasks.filter(t => ['draft_submitted', 'revision_required'].includes(t.status)).slice(0, 5);
  const productList = [...new Set(brandCampaigns.map(c => c.productName))];
  const campaignOptions = brandCampaigns;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium text-slate-300 dark:text-slate-300">Bộ lọc:</span>
        </div>
        <select value={filterKOL} onChange={e => setFilterKOL(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="all">Tất cả KOL/KOC</option>
          {brandKOLs.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <select value={filterTimeRange} onChange={e => setFilterTimeRange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="all">Tất cả thời gian</option>
          <option value="7d">7 ngày gần đây</option>
          <option value="30d">30 ngày gần đây</option>
          <option value="90d">90 ngày gần đây</option>
        </select>
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="all">Tất cả sản phẩm</option>
          {productList.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none">
          <option value="all">Tất cả chiến dịch</option>
          {campaignOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* KPI Row — 8 cards matching spec */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <div onClick={() => onNavigate('performance')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="Total Views" value={totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : `${Math.round(totalViews / 1000)}K`} icon={<Eye className="w-5 h-5" />} /></div>
        <div onClick={() => onNavigate('performance')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="Average Views" value={avgViews >= 1000 ? `${Math.round(avgViews / 1000)}K` : avgViews.toString()} icon={<TrendingUp className="w-5 h-5" />} /></div>
        <div onClick={() => onNavigate('performance')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="Engagement" value={totalEngagement >= 1000000 ? `${(totalEngagement / 1000000).toFixed(1)}M` : `${Math.round(totalEngagement / 1000)}K`} icon={<Heart className="w-5 h-5" />} /></div>
        <div onClick={() => onNavigate('performance')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="Engagement Rate" value={`${engagementRate}%`} icon={<TrendingUp className="w-5 h-5" />} /></div>
        <div onClick={() => onNavigate('performance')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="Conversion Rate" value={`${conversionRate}%`} icon={<Target className="w-5 h-5" />} /></div>
        <div onClick={() => onNavigate('kol')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="KOL/KOC" value={kolCount.toString()} icon={<Users className="w-5 h-5" />} /></div>
        <div onClick={() => onNavigate('tasks')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="Task Progress" value={`${completedTasks}/${filteredTasks.length}`} icon={<CheckCircle2 className="w-5 h-5" />} /></div>
        <div onClick={() => onNavigate('kol')} className="cursor-pointer hover:opacity-80 transition-opacity"><KPIWidget label="Top Rank KOL" value={topKOL?.kolName?.split(' ')[0] || '-'} icon={<Award className="w-5 h-5" />} /></div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card-base p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Campaign Status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={campaignStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3}>
                {campaignStatusData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie><Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {campaignStatusData.map(e => (
              <div key={e.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="text-xs text-slate-600 dark:text-slate-400">{e.name}</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white ml-auto">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-base p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Performance Trend</h3>
            <span className="text-xs text-slate-500">Views & Conversions</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#55B3D9" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="conversions" stroke="#88E8F2" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Campaign Ranking */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />Campaign Rankings
            </h3>
            <button onClick={() => onOpenPopup('campaigns', 'Tất cả chiến dịch')} className="text-xs text-brand-500 dark:text-brand-400 hover:underline font-medium">Xem tất cả →</button>
          </div>
          <div className="space-y-2">
            {campaignRankings.length === 0 && <p className="text-sm text-slate-500">Chưa có chiến dịch nào.</p>}
            {campaignRankings.slice(0, 5).map((r, i) => (
              <div key={r.campaignId} onClick={() => onOpenItem('campaign', r.campaignId)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' :
                  i === 1 ? 'bg-slate-400 text-white' :
                    i === 2 ? 'bg-amber-700 text-white' :
                      'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.campaignName}</p>
                  <p className="text-xs text-slate-500">{r.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{r.score}</p>
                  <p className="text-xs text-slate-500">Điểm</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOL/KOC Ranking */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />KOL/KOC Rankings
            </h3>
            <button onClick={() => onOpenPopup('kol', 'Tất cả KOL/KOC')} className="text-xs text-brand-500 dark:text-brand-400 hover:underline font-medium">Xem tất cả →</button>
          </div>
          <div className="space-y-2">
            {kolRankings.slice(0, 5).map((r, i) => (
              <div key={r.kolId} onClick={() => onOpenItem('kol', r.kolId)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' :
                  i === 1 ? 'bg-slate-400 text-white' :
                    i === 2 ? 'bg-amber-700 text-white' :
                      'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.kolName}</p>
                  <p className="text-xs text-slate-500">{brandKOLs.find(k => k.id === r.kolId)?.platform || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{r.score}</p>
                  <p className="text-xs text-slate-500">Điểm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Campaigns */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Campaigns</h3>
            <button onClick={() => onOpenPopup('campaigns', 'Tất cả chiến dịch')} className="text-xs text-brand-500 dark:text-brand-400 hover:underline font-medium">Xem tất cả →</button>
          </div>
          <div className="space-y-3">
            {brandCampaigns.slice(0, 5).map(c => (
              <div key={c.id} onClick={() => onOpenItem('campaign', c.id)}
                className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 cursor-pointer transition-colors px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.productName}</p>
                </div>
                <Badge label={campaignStatusLabels[c.status]} colorClass={
                  c.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                    c.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      c.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300'
                } />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Activities</h3>
            <button onClick={() => onOpenPopup('activities', 'Tất cả hoạt động')} className="text-xs text-brand-500 dark:text-brand-400 hover:underline font-medium">Xem tất cả →</button>
          </div>
          <div className="space-y-3">
            {recentTasks.map(t => (
              <div key={t.id} onClick={() => onOpenItem('kol', t.kolId)}
                className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 cursor-pointer transition-colors px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p>
                  <p className="text-xs text-slate-500">{t.campaignName}</p>
                </div>
                <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pending Reviews</h3>
            <button onClick={() => onOpenPopup('reviews', 'Bài chờ duyệt')} className="text-xs text-brand-500 dark:text-brand-400 hover:underline font-medium">Xem tất cả →</button>
          </div>
          <div className="space-y-3">
            {pendingReviews.length > 0 ? pendingReviews.map(t => (
              <div key={t.id} onClick={() => onOpenItem('kol', t.kolId)}
                className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 cursor-pointer transition-colors px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p>
                  <p className="text-xs text-slate-500">{t.campaignName}</p>
                </div>
                <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
              </div>
            )) : <p className="text-sm text-slate-500">Không có bài chờ duyệt.</p>}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pending Payments</h3>
            <button onClick={() => onOpenPopup('payments', 'Thanh toán chờ')} className="text-xs text-brand-500 dark:text-brand-400 hover:underline font-medium">Xem tất cả →</button>
          </div>
          <div className="space-y-3">
            {pendingPayments.length > 0 ? pendingPayments.map(p => (
              <div key={p.id} onClick={() => onOpenItem('kol', p.kolId)}
                className="flex items-center justify-between rounded-xl bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 cursor-pointer transition-colors px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{p.kolName}</p>
                  <p className="text-xs text-slate-500">{p.campaignName}</p>
                </div>
                <Badge label={paymentStatusLabels[p.status]} colorClass={
                  p.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                    (p.status as string) === 'hold' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                } />
              </div>
            )) : <p className="text-sm text-slate-500">Không có thanh toán chờ.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// OVERVIEW POPUP TABLE
// ═══════════════════════════════════════════════════════════════════════

function OverviewPopupTable({ type }: { type: 'campaigns' | 'kol' | 'tasks' | 'payments' | 'reviews' | 'activities'; onClose?: () => void }) {
  const { campaigns } = useBrandContext();
  const brandTasks = tasks.filter(t => kols.find(k => k.id === t.kolId)?.brandId === currentBrandId);
  const brandPayments = payments.filter(p => kols.find(k => k.id === p.kolId)?.brandId === currentBrandId);

  if (type === 'campaigns') {
    return (
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/80">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Chiến dịch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Mục tiêu</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Hạn chót</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KOL</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => (
              <tr key={c.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{c.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.productName}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{c.objective}</td>
                <td className="px-4 py-3">
                  <Badge label={campaignStatusLabels[c.status]} colorClass={
                    c.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      c.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        c.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300'
                  } />
                </td>
                <td className="px-4 py-3 text-slate-500">{c.deadline}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{c.assignedKOLs.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'kol') {
    return (
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/80">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nền tảng</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Lĩnh vực</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Followers</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nhiệm vụ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {kols.filter(k => k.brandId === currentBrandId).map(k => {
              const taskCount = brandTasks.filter(t => t.kolId === k.id).length;
              const rank = kolRankings.find(r => r.kolId === k.id);
              return (
                <tr key={k.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={k.avatar} size="sm" image={getKolImage(k.avatar)} />
                      <span className="font-medium text-slate-900 dark:text-white">{k.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{k.platform}</td>
                  <td className="px-4 py-3"><Badge label={k.niche} colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" /></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{k.followersDisplay}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{taskCount}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{rank?.score || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'activities') {
    return (
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/80">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Chiến dịch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Mô tả</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Hạn nộp</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Thù lao</th>
            </tr>
          </thead>
          <tbody>
            {brandTasks.map(t => (
              <tr key={t.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.kolName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.campaignName}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">{t.brief}</td>
                <td className="px-4 py-3">
                  <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
                </td>
                <td className="px-4 py-3 text-slate-500">{t.deadline}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{(Number((t as any).payment) || 0).toLocaleString()}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'reviews') {
    const reviewTasks = brandTasks.filter(t => ['draft_submitted', 'revision_required'].includes(t.status as string));
    return (
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/80">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Chiến dịch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nội dung</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nộp lúc</th>
            </tr>
          </thead>
          <tbody>
            {reviewTasks.length > 0 ? reviewTasks.map(t => (
              <tr key={t.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.kolName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.campaignName}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">{t.brief}</td>
                <td className="px-4 py-3">
                  <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
                </td>
                <td className="px-4 py-3 text-slate-500">{(t as any).updatedAt || '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Không có bài chờ duyệt.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'payments') {
    return (
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/80">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Chiến dịch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Số tiền</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {brandPayments.map(p => (
              <tr key={p.id} className="border-b border-slate-100/60 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.kolName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.campaignName}</td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{(Number(p.amount) || 0).toLocaleString()}₫</td>
                <td className="px-4 py-3">
                  <Badge label={paymentStatusLabels[p.status]} colorClass={
                    p.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      (p.status as string) === 'hold' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  } />
                </td>
                <td className="px-4 py-3 text-slate-500">{(p as any).date || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// ITEM DETAIL POPUP — Campaign & KOL
// ═══════════════════════════════════════════════════════════════════════

function ItemDetailPopup({ type, id }: { type: 'campaign' | 'kol'; id: string }) {
  const { campaigns } = useBrandContext();
  if (type === 'campaign') {
    const c = campaigns.find(camp => camp.id === id);
    if (!c) return <p className="p-4 text-sm text-slate-500">Không tìm thấy chiến dịch.</p>;
    const kolList = kols.filter(k => c.assignedKOLs.includes(k.id));
    const kolTaskData = kolList.map(k => {
      const t = tasks.find(task => task.campaignId === id && task.kolId === k.id);
      return { kol: k, task: t };
    });
    const totalTaskViews = c.totalViews;
    const totalEngagement = Math.round(c.totalViews * (c.avgEngagementRate / 100));

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-brand-50 dark:from-blue-900/20 dark:to-brand-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{c.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">Sản phẩm: {c.productName}</p>
              <p className="text-xs text-slate-400 mt-0.5">Mục tiêu: {c.objective}</p>
            </div>
            <Badge label={campaignStatusLabels[c.status]} colorClass={
              c.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                c.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                  c.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                    'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300'
            } />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Lượt xem', value: totalTaskViews >= 1000000 ? `${(totalTaskViews / 1000000).toFixed(1)}M` : `${Math.round(totalTaskViews / 1000)}K`, icon: <Eye className="w-4 h-4" /> },
            { label: 'Tương tác', value: totalEngagement >= 1000 ? `${Math.round(totalEngagement / 1000)}K` : totalEngagement.toString(), icon: <Heart className="w-4 h-4" /> },
            { label: 'Tỷ lệ ER', value: `${c.avgEngagementRate}%`, icon: <TrendingUp className="w-4 h-4" /> },
            { label: 'Chuyển đổi', value: (c.totalConversions || 0).toLocaleString(), icon: <Target className="w-4 h-4" /> },
          ].map(s => (
            <div key={s.label} className="surface-subtle p-3 text-center">
              <div className="flex justify-center mb-1 text-slate-400">{s.icon}</div>
              <p className="text-base font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Bắt đầu: <span className="font-medium text-slate-700 dark:text-slate-200">{(c as any).startDate || '-'}</span></span>
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Hạn chót: <span className="font-medium text-slate-700 dark:text-slate-200">{c.deadline}</span></span>
          </div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>{kolList.length} KOL/KOC</span>
          </div>
        </div>

        {/* KOL List */}
        {kolTaskData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4" />Danh sách KOL/KOC tham gia
            </h4>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {kolTaskData.map(({ kol, task }) => (
                <div key={kol.id} className="flex items-center gap-3 p-3 surface-subtle">
                  <Avatar initials={kol.avatar} size="sm" image={getKolImage(kol.avatar)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{kol.name}</p>
                    <p className="text-xs text-slate-500">{kol.platform} / {kol.followersDisplay}</p>
                  </div>
                  {task ? (
                    <Badge label={taskStatusLabels[task.status as TaskStatus]} colorClass={taskStatusColors[task.status as TaskStatus]} />
                  ) : (
                    <Badge label="Chưa giao" colorClass="bg-slate-100/60 dark:bg-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // KOL detail
  const k = kols.find(kol => kol.id === id);
  if (!k) return <p className="p-4 text-sm text-slate-500">Không tìm thấy KOL/KOC.</p>;
  const kTasks = tasks.filter(t => t.kolId === id);
  const kPayments = payments.filter(p => p.kolId === id);
  const kRank = kolRankings.find(r => r.kolId === id);

  // Demo drafts — bản nháp nội dung KOL đã nạp
  const demoDrafts = [
    { campaignId: kTasks[0]?.campaignId || 'camp-1', campaignName: kTasks[0]?.campaignName || 'Chiến dịch mẫu', submittedAt: '2026-06-01 14:23', version: 1, status: 'draft_submitted' as const, contentUrl: 'https://picsum.photos/seed/draft1/600/400', caption: 'Review sản phẩm skincare mới — cảm nhận sau 2 tuần sử dụng. Tone nhẹ nhàng, gần gũi.' },
    { campaignId: kTasks[1]?.campaignId || 'camp-2', campaignName: kTasks[1]?.campaignName || 'Chiến dịch 2', submittedAt: '2026-06-02 09:15', version: 2, status: 'revision_required' as const, contentUrl: 'https://picsum.photos/seed/draft2/600/400', caption: 'Unboxing sản phẩm — phấn nền V-coc, tông màu phù hợp da Việt.' },
    { campaignId: kTasks[2]?.campaignId || 'camp-3', campaignName: kTasks[2]?.campaignName || 'Chiến dịch 3', submittedAt: '2026-05-28 18:45', version: 1, status: 'approved' as const, contentUrl: 'https://picsum.photos/seed/draft3/600/400', caption: 'Reels thử son V-coc — màu đẹp, bền 6h không lem.' },
  ];

  const pendingDrafts = demoDrafts.filter(d => d.status === 'draft_submitted' || d.status === 'revision_required');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-brand-50 to-cyan-50 dark:from-brand-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-brand-800/40">
        <Avatar initials={k.avatar} size="lg" image={getKolImage(k.avatar)} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{k.name}</h2>
            <Badge label={k.niche} colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{k.platform} / {k.followersDisplay} followers</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
            <span>Điểm: <span className="font-bold text-amber-500">{kRank?.score || '-'}</span></span>
            <span>Task: <span className="font-bold text-brand-600">{kTasks.length}</span></span>
            <span>Thanh toán: <span className="font-bold text-emerald-600">{(kPayments.reduce((s, p) => s + Number(p.amount), 0)).toLocaleString()}₫</span></span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-brand-600">{kTasks.filter(t => ['completed', 'paid', 'metrics_approved'].includes(t.status as string)).length}</p>
          <p className="text-xs text-slate-500">Hoàn thành</p>
        </div>
        <div className="bg-amber-50/80 dark:bg-amber-900/20 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-600">{pendingDrafts.length}</p>
          <p className="text-xs text-slate-500">Chờ duyệt</p>
        </div>
        <div className="bg-blue-50/80 dark:bg-blue-900/20 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-600">{kTasks.filter(t => (t.status as string) === 'in_progress').length}</p>
          <p className="text-xs text-slate-500">Đang làm</p>
        </div>
      </div>

      {/* Bản nháp nội dung đã nạp */}
      {pendingDrafts.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />Bản nháp đã nạp ({pendingDrafts.length})
          </h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {pendingDrafts.map((d, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <img src={d.contentUrl} alt={`Draft ${i + 1}`} className="w-full h-40 object-cover" />
                <div className="p-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-slate-500">{d.campaignName}</p>
                    <Badge label={d.status === 'draft_submitted' ? 'Chờ duyệt' : 'Cần sửa'} colorClass={
                      d.status === 'draft_submitted' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    } />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{d.caption}</p>
                  <p className="text-xs text-slate-400 mt-1.5">Nộp lúc {d.submittedAt} / Version {d.version}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent tasks */}
      {kTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />Nhiệm vụ gần đây
          </h4>
          <div className="space-y-2">
            {kTasks.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center justify-between p-2.5 surface-subtle">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{t.campaignName}</p>
                  <p className="text-xs text-slate-500">{t.brief}</p>
                </div>
                <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PRODUCTS VIEW
// ═══════════════════════════════════════════════════════════════════════

function ProductsView({ selectedProject }: { selectedProject: string }) {
  const { campaigns } = useBrandContext();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const brandProducts = products.filter(p => p.brandId === currentBrandId);
  const filtered = brandProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SectionHeader title="Quản lý sản phẩm" subtitle="Tạo và quản lý sản phẩm cho chiến dịch"
        action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Tạo sản phẩm mới</Button>}
      />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Tìm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const productCampaigns = campaigns.filter(c => c.productId === p.id);
          return (
            <motion.div key={p.id} whileHover={{ y: -2 }}
              className="card-base p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                  <img src={PRODUCT_IMAGES[p.image]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <Badge label={p.status === 'active' ? 'Active' : 'Inactive'} colorClass={p.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300'} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{p.name}</h3>
              <p className="text-sm text-slate-500 mb-1">{p.category}</p>
              <p className="text-lg font-bold text-brand-500 dark:text-brand-400 mb-1">{p.price}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {productCampaigns.length > 0 ? productCampaigns.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                    {c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name}
                  </span>
                )) : (
                  <span className="text-xs text-slate-400 italic">Chưa có chiến dịch</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setShowDetail(p.id)}>Chi tiết</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowEdit(p.id)}><Edit3 className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteProduct(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo sản phẩm mới" width="max-w-xl">
        <ProductForm onClose={() => setShowCreate(false)} mode="create" />
      </Modal>
      {/* Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Chi tiết sản phẩm" width="max-w-xl">
        {showDetail && <ProductDetail productId={showDetail} onClose={() => setShowDetail(null)} />}
      </Modal>
      {/* Edit Modal */}
      <Modal isOpen={!!showEdit} onClose={() => setShowEdit(null)} title="Chỉnh sửa sản phẩm" width="max-w-xl">
        {showEdit && <ProductForm onClose={() => setShowEdit(null)} mode="edit" productId={showEdit} />}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteProduct} onClose={() => setDeleteProduct(null)} title="Xác nhận xóa sản phẩm" width="max-w-md">
        {deleteProduct && (() => {
          const p = products.find(pr => pr.id === deleteProduct);
          return p ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800/40">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Bạn có chắc muốn xóa sản phẩm <strong>"{p.name}"</strong>? Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDeleteProduct(null)}>Hủy</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => setDeleteProduct(null)}>
                  <Trash2 className="w-4 h-4 mr-2" />Xóa sản phẩm
                </Button>
              </div>
            </div>
          ) : null;
        })()}
      </Modal>
    </div>
  );
}

function ProductForm({ onClose, mode, productId }: { onClose: () => void; mode: 'create' | 'edit'; productId?: string }) {
  const p = productId ? products.find(pr => pr.id === productId) : null;
  return (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Tên sản phẩm</label>
        <input type="text" defaultValue={p?.name} placeholder="VD: Glow Serum Cấp Ẩm"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">Hình ảnh sản phẩm</label>
        <div className="border-2 border-dashed bg-slate-200 dark:border-slate-600 rounded-xl p-4 text-center hover:border-brand-400 transition-colors cursor-pointer">
          <p className="text-sm text-slate-500">Tải lên hình ảnh sản phẩm</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG tối đa 5MB</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Danh mục</label>
          <select defaultValue={p?.category} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
            {productCategories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Giá</label>
          <input type="text" defaultValue={p?.price} placeholder="VD: 299.000 VND"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
        </div>
      </div>
      <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Link sản phẩm</label>
        <input type="url" defaultValue={p?.productLink} placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
      </div>
      <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Mô tả</label>
        <textarea rows={3} defaultValue={p?.description} placeholder="Mô tả sản phẩm..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Hủy</Button>
        <Button onClick={onClose}><Plus className="w-4 h-4 mr-2" />{mode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}</Button>
      </div>
    </div>
  );
}

function ProductDetail({ productId, onClose }: { productId: string; onClose: () => void }) {
  const { campaigns } = useBrandContext();
  const p = products.find(pr => pr.id === productId);
  if (!p) return null;
  const related = campaigns.filter(c => c.productId === p.id);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 surface-subtle">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
          <img src={PRODUCT_IMAGES[p.image]} alt={p.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.name}</h3>
          <p className="text-sm text-slate-500">{p.category} • {p.price}</p>
          <Badge label={p.status === 'active' ? 'Active' : 'Inactive'} colorClass={p.status === 'active' ? 'bg-emerald-100' : 'bg-slate-100'} />
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{p.description}</p>
      <div><a href={p.productLink} className="text-sm text-brand-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />{p.productLink}</a></div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Chiến dịch liên quan ({related.length})</h4>
        <div className="space-y-2">
          {related.map(c => (
            <div key={c.id} className="p-3 surface-subtle">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
              <p className="text-xs text-slate-500">{campaignStatusLabels[c.status]}</p>
            </div>
          ))}
          {related.length === 0 && <p className="text-sm text-slate-500">Chưa có chiến dịch nào.</p>}
        </div>
      </div>
      <div className="flex justify-end"><Button onClick={onClose}>Đóng</Button></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CAMPAIGNS VIEW
// ═══════════════════════════════════════════════════════════════════════

function CampaignsView({ selectedProject }: { selectedProject: string }) {
  const { campaigns, reload } = useBrandContext();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [editCampaign, setEditCampaign] = useState<string | null>(null);
  const [createTask, setCreateTask] = useState<{ campaignId: string; campaignName: string; productName: string } | null>(null);
  const [campaignStatusAction, setCampaignStatusAction] = useState<{ id: string; action: CampaignStatusAction } | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<'name' | 'totalViews' | 'status' | 'deadline'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const closeStatusModal = () => { setCampaignStatusAction(null); setStatusError(''); };

  // Ghi trạng thái mới vào Supabase rồi tải lại danh sách
  const confirmStatusChange = async () => {
    if (!campaignStatusAction) return;
    try {
      setSavingStatus(true);
      setStatusError('');
      await campaignService.updateCampaignStatus(
        Number(campaignStatusAction.id),
        CAMPAIGN_STATUS_ACTIONS[campaignStatusAction.action].dbStatus
      );
      await reload();
      closeStatusModal();
    } catch (error) {
      console.error('Update campaign status error:', error);
      setStatusError('Không thể cập nhật trạng thái. Kiểm tra kết nối hoặc quyền (RLS) trên Supabase.');
    } finally {
      setSavingStatus(false);
    }
  };

  const brandCampaigns = campaigns.filter(c => selectedProject === 'all' || c.id === selectedProject);
  const filtered = brandCampaigns
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) && (filterStatus === 'all' || c.status === filterStatus))
    .sort((a, b) => {
      let av: string | number = a[sortField] as string | number;
      let bv: string | number = b[sortField] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortHeader = ({ field, label }: { field: typeof sortField; label: string }) => (
    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-300 dark:hover:text-slate-300"
      onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">{label}<ArrowUpDown className="w-3 h-3" /></span>
    </th>
  );

  return (
    <div className="space-y-4">
      <SectionHeader title="Quản lý chiến dịch" subtitle="Tạo và theo dõi chiến dịch KOL/KOC"
        action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Tạo chiến dịch mới</Button>}
      />
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Tìm chiến dịch..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="active">Đang chạy</option>
          <option value="tracking">Theo dõi</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100/60">
                <SortHeader field="name" label="Chiến dịch" />
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
                <SortHeader field="totalViews" label="Lượt xem" />
                <SortHeader field="status" label="Trạng thái" />
                <SortHeader field="deadline" label="Hạn chót" />
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">KOL</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.objective}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 dark:text-slate-300">{c.productName}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{c.totalViews >= 1000000 ? `${(c.totalViews / 1000000).toFixed(1)}M` : `${Math.round(c.totalViews / 1000)}K`}</td>
                  <td className="px-6 py-4">
                    <Badge label={campaignStatusLabels[c.status]} colorClass={
                      c.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                        c.status === 'tracking' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                          c.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                            c.status === 'draft' ? 'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    } />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.deadline}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{c.assignedKOLs.length}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setShowDetail(c.id)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="secondary" onClick={() => setCreateTask({ campaignId: c.id, campaignName: c.name, productName: c.productName })}>
                        <Plus className="w-3.5 h-3.5 mr-1" />Nhiệm vụ
                      </Button>
                      {c.status === 'draft' && (
                        <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700" onClick={() => setCampaignStatusAction({ id: c.id, action: 'activate' })}>
                          <Play className="w-3.5 h-3.5 mr-1" />Kích hoạt
                        </Button>
                      )}
                      {c.status === 'active' && (
                        <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700" onClick={() => setCampaignStatusAction({ id: c.id, action: 'pause' })}>
                          <Pause className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {(c.status as string) === 'tracking' && (
                        <>
                          <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700" onClick={() => setCampaignStatusAction({ id: c.id, action: 'pause' })}>
                            <Pause className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700" onClick={() => setCampaignStatusAction({ id: c.id, action: 'complete' })}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {(c.status as string) === 'paused' && (
                        <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700" onClick={() => setCampaignStatusAction({ id: c.id, action: 'resume' })}>
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setEditCampaign(c.id)}><Edit3 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo chiến dịch mới" width="max-w-2xl">
        <CampaignForm onClose={() => setShowCreate(false)} onCreated={reload} />
      </Modal>
      {/* Campaign Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Chi tiết chiến dịch" width="max-w-3xl">
        {showDetail && <CampaignDetail campaignId={showDetail} onClose={() => setShowDetail(null)} />}
      </Modal>
      {/* Edit Campaign Modal */}
      <Modal isOpen={!!editCampaign} onClose={() => setEditCampaign(null)} title="Chỉnh sửa chiến dịch" width="max-w-2xl">
        {editCampaign && (() => {
          const c = campaigns.find(camp => camp.id === editCampaign);
          return c ? <EditCampaignForm campaign={c} onClose={() => setEditCampaign(null)} onSaved={reload} /> : null;
        })()}
      </Modal>

      {/* Tạo nhiệm vụ cho chiến dịch */}
      <Modal isOpen={!!createTask} onClose={() => setCreateTask(null)} title="Tạo nhiệm vụ cho chiến dịch" width="max-w-lg">
        {createTask && (
          <TaskCreationFormLite
            campaignId={createTask.campaignId}
            campaignName={createTask.campaignName}
            productName={createTask.productName}
            onClose={() => setCreateTask(null)}
          />
        )}
      </Modal>

      {/* Xác nhận kích hoạt / tạm dừng / tiếp tục / kết thúc chiến dịch (ghi vào Supabase) */}
      <Modal isOpen={!!campaignStatusAction} onClose={closeStatusModal}
        title={campaignStatusAction ? CAMPAIGN_STATUS_ACTIONS[campaignStatusAction.action].title : ''} width="max-w-md">
        {campaignStatusAction && (() => {
          const c = campaigns.find(camp => camp.id === campaignStatusAction.id);
          if (!c) return null;
          const cfg = CAMPAIGN_STATUS_ACTIONS[campaignStatusAction.action];
          return (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${cfg.box}`}>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
                <p className="text-xs text-slate-500 mt-1">Sản phẩm: {c.productName}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{cfg.text}</p>
              {statusError && <p className="text-sm text-red-500">{statusError}</p>}
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={closeStatusModal} disabled={savingStatus}>Hủy</Button>
                <Button className={cfg.btn} onClick={confirmStatusChange} disabled={savingStatus}>
                  {savingStatus ? 'Đang lưu...' : cfg.label}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TASK CREATION FORM — Campaign-scoped
// ═══════════════════════════════════════════════════════════════════════

function TaskCreationFormLite({ campaignId, campaignName, productName, onClose }: { campaignId: string; campaignName: string; productName: string; onClose: () => void }) {
  const brandKOLs = kols.filter(k => k.brandId === currentBrandId);
  const [selectedKOLs, setSelectedKOLs] = useState<string[]>([]);
  const [brief, setBrief] = useState('');
  const [deadline, setDeadline] = useState('');
  const [payment, setPayment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleKOL = (id: string) => {
    setSelectedKOLs(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };


  const validate = () => {
    const e: Record<string, string> = {};
    if (selectedKOLs.length === 0) e.kolId = 'Chọn ít nhất một KOL/KOC';
    if (!brief.trim()) e.brief = 'Nhập mô tả nhiệm vụ';
    if (!deadline) e.deadline = 'Chọn hạn nộp';
    if (!payment.trim() || isNaN(Number(payment))) e.payment = 'Nhập thù lao hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const totalAmount = selectedKOLs.length * Number(payment || 0);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-300">
        <p className="font-semibold mb-0.5">{campaignName}</p>
        <p className="text-xs opacity-80">Sản phẩm: {productName}</p>
      </div>

      {/* Chọn nhiều KOL */}
      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-2">KOL/KOC * <span className="text-xs text-slate-400">(chọn nhiều)</span></label>
        <div className={`border rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 ${errors.kolId ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-700`}>
          {brandKOLs.map(k => {
            const checked = selectedKOLs.includes(k.id);
            return (
              <label key={k.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-slate-50/50 dark:hover:bg-slate-600/50'}`}>
                <input type="checkbox" checked={checked} onChange={() => toggleKOL(k.id)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 dark:border-slate-500 focus:ring-brand-500" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Avatar initials={k.avatar} size="sm" image={getKolImage(k.avatar)} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{k.name}</p>
                    <p className="text-xs text-slate-500">{k.platform} / {k.followersDisplay}</p>
                  </div>
                </div>
                <Badge label={k.niche} colorClass="bg-gray-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
              </label>
            );
          })}
        </div>
        {selectedKOLs.length > 0 && (
          <p className="text-xs text-brand-500 dark:text-brand-400 mt-1.5 font-medium">
            Đã chọn {selectedKOLs.length} KOL/KOC
          </p>
        )}
        {errors.kolId && <p className="text-xs text-red-500 mt-1">{errors.kolId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Mô tả nhiệm vụ *</label>
        <textarea rows={3} value={brief} onChange={e => setBrief(e.target.value)} placeholder="VD: Quay video review sản phẩm, đăng Reels kèm CTA mua hàng..."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none ${errors.brief ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`} />
        {errors.brief && <p className="text-xs text-red-500 mt-1">{errors.brief}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Hạn nộp *</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.deadline ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`} />
          {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Thù lao / KOL (VND) *</label>
          <input type="number" value={payment} onChange={e => setPayment(e.target.value)} placeholder="VD: 5000000"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.payment ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`} />
          {errors.payment && <p className="text-xs text-red-500 mt-1">{errors.payment}</p>}
        </div>
      </div>

      {selectedKOLs.length > 0 && payment && (
        <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-teal-200 dark:border-brand-800/40">
          <div className="flex justify-between items-center text-sm">
            <span className="text-teal-700 dark:text-brand-300">
              Tổng chi phí ({selectedKOLs.length} KOL × {Number(payment).toLocaleString()}₫)
            </span>
            <span className="font-bold text-brand-500 dark:text-brand-400">
              {totalAmount.toLocaleString()}₫
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Hủy</Button>
        <Button onClick={() => { if (validate()) onClose(); }}>
          <Send className="w-4 h-4 mr-2" />Giao nhiệm vụ ({selectedKOLs.length || 0})
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// KOL VIEW
// ═══════════════════════════════════════════════════════════════════════

function CampaignForm({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void | Promise<void> }) {
  const [brandProducts, setBrandProducts] =
    useState<SupabaseProduct[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProductsByBrand(SUPABASE_BRAND_ID);
        setBrandProducts(data);
      } catch (error) {
        console.error('Load products error:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    productId: '', campaignName: '', objective: '', startDate: '', endDate: '',
    targetViews: '', targetER: '', targetConversion: '',
    paymentRule: '', deadline: '', budget: '', brief: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isCreating, setIsCreating] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.productId) e.productId = 'Chọn ít nhất một sản phẩm';
      if (!form.campaignName.trim()) e.campaignName = 'Tên chiến dịch không được để trống';
      if (!form.objective.trim()) e.objective = 'Mục tiêu không được để trống';
      if (!form.startDate) e.startDate = 'Ngày bắt đầu không được để trống';
      if (!form.endDate) e.endDate = 'Ngày kết thúc không được để trống';
      if (form.startDate && form.endDate && form.startDate > form.endDate)
        e.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    if (s === 2) {
      if (!form.targetViews || Number(form.targetViews) <= 0) e.targetViews = 'Target Views phải > 0';
      if (!form.targetER || Number(form.targetER) <= 0 || Number(form.targetER) > 100) e.targetER = 'Target ER phải từ 0–100';
      if (!form.budget || Number(form.budget) <= 0) e.budget = 'Ngân sách phải > 0';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);
  const handleCreateCampaign = async () => {
    try {
      setIsCreating(true);
      setSubmitError('');

      await createCampaign({
        brandId: SUPABASE_BRAND_ID,
        productId: Number(form.productId),

        campaignName: form.campaignName,
        objective: form.objective,
        startDate: form.startDate,
        endDate: form.endDate,

        targetViews: Number(form.targetViews),
        targetER: Number(form.targetER),
        targetConversion: form.targetConversion
          ? Number(form.targetConversion)
          : 0,

        paymentRule: form.paymentRule,
        brief: form.brief,
      });

      // Tải lại danh sách campaign từ Supabase để dashboard hiện campaign mới ngay
      await onCreated?.();

      alert('Tạo chiến dịch thành công!');
      onClose();
    } catch (error) {
      console.error('Create campaign error:', error);
      setSubmitError('Không thể tạo chiến dịch. Vui lòng thử lại.');
    } finally {
      setIsCreating(false);
    }
  };

  const STEPS = [
    { n: 1, label: 'Thông tin cơ bản', sub: 'Sản phẩm, tên, mục tiêu, timeline' },
    { n: 2, label: 'KPI & Thanh toán', sub: 'Chỉ tiêu, ngân sách, quy tắc trả tiền' },
    { n: 3, label: 'Brief & Hoàn tất', sub: 'Yêu cầu nội dung và xem lại' },
  ];

  const selectedProduct = brandProducts.find(
    p => p.id === Number(form.productId)
  );

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > s.n ? 'bg-brand-600 text-white' :
                step === s.n ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-900' :
                  'bg-slate-200 dark:bg-slate-600 text-slate-400'
                }`}>
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <p className={`text-[10px] mt-1 text-center ${step === s.n ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>{s.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${step > s.n ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Basic Info ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-300">
            Chọn sản phẩm gắn với chiến dịch này trước khi bắt đầu.
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Sản phẩm *</label>
            <select value={form.productId} onChange={e => set('productId', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.productId ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                }`}>
              <option value="">
                {loadingProducts ? 'Đang tải sản phẩm...' : '-- Chọn sản phẩm --'}
              </option>

              {brandProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.product_name}
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-xs text-red-500 mt-1">{errors.productId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Tên chiến dịch *</label>
            <input type="text" value={form.campaignName} onChange={e => set('campaignName', e.target.value)} placeholder="VD: Glow Serum Summer Launch 2026"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.campaignName ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                }`} />
            {errors.campaignName && <p className="text-xs text-red-500 mt-1">{errors.campaignName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Mục tiêu chiến dịch *</label>
            <input type="text" value={form.objective} onChange={e => set('objective', e.target.value)} placeholder="VD: Tăng nhận diện thương hiệu, tăng doanh số..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.objective ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                }`} />
            {errors.objective && <p className="text-xs text-red-500 mt-1">{errors.objective}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Ngày bắt đầu *</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.startDate ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                  }`} />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Ngày kết thúc *</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.endDate ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                  }`} />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={next}>Tiếp theo <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {/* ── Step 2: KPI & Payment ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Target Views *</label>
              <input type="number" value={form.targetViews} onChange={e => set('targetViews', e.target.value)} placeholder="VD: 100000"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.targetViews ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                  }`} />
              {errors.targetViews && <p className="text-xs text-red-500 mt-1">{errors.targetViews}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Target ER (%) *</label>
              <input type="number" value={form.targetER} onChange={e => set('targetER', e.target.value)} placeholder="VD: 5"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.targetER ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                  }`} />
              {errors.targetER && <p className="text-xs text-red-500 mt-1">{errors.targetER}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Target Conversion</label>
              <input type="number" value={form.targetConversion} onChange={e => set('targetConversion', e.target.value)} placeholder="VD: 500"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Ngân sách (VND) *</label>
            <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="VD: 50000000"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.budget ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                }`} />
            {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Hạn chót</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Quy tắc thanh toán</label>
            <textarea rows={2} value={form.paymentRule} onChange={e => set('paymentRule', e.target.value)}
              placeholder="VD: Base 5M + bonus 500K cho mỗi 10K views vượt target..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={back}><ChevronRight className="w-4 h-4 rotate-180 mr-1" />Quay lại</Button>
            <Button onClick={next}>Tiếp theo <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Brief & Review ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Brief chiến dịch</label>
            <textarea rows={4} value={form.brief} onChange={e => set('brief', e.target.value)}
              placeholder="Mô tả yêu cầu nội dung, key message, USP sản phẩm, đối tượng khách hàng mục tiêu..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>

          {/* Review summary */}
          <div className="p-4 surface-subtle space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Xem lại thông tin</p>
            {[
              { label: 'Sản phẩm', value: selectedProduct?.product_name || '-' },
              { label: 'Chiến dịch', value: form.campaignName || '-' },
              { label: 'Mục tiêu', value: form.objective || '-' },
              { label: 'Timeline', value: form.startDate && form.endDate ? `${form.startDate} → ${form.endDate}` : '-' },
              { label: 'KPI Views', value: form.targetViews ? Number(form.targetViews).toLocaleString() : '-' },
              { label: 'KPI ER', value: form.targetER ? `${form.targetER}%` : '-' },
              { label: 'Ngân sách', value: form.budget ? `${Number(form.budget).toLocaleString()} VND` : '-' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{row.value}</span>
              </div>
            ))}
          </div>

          {submitError && (
            <p className="text-sm text-red-500">
              {submitError}
            </p>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={back}><ChevronRight className="w-4 h-4 rotate-180 mr-1" />Quay lại</Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={isCreating}
            >
              <Check className="w-4 h-4 mr-2" />
              {isCreating ? 'Đang tạo...' : 'Tạo chiến dịch'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditCampaignForm({ campaign, onClose, onSaved }: {
  campaign: Campaign; onClose: () => void; onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    name: campaign.name,
    objective: campaign.objective,
    brief: campaign.brief,
    paymentRule: campaign.paymentRule,
    startDate: campaign.startDate || '',
    endDate: campaign.deadline || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none';
  const labelCls = 'block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1';

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Tên chiến dịch không được để trống'); return; }
    if (form.startDate && form.endDate && form.startDate > form.endDate) { setError('Ngày kết thúc phải sau ngày bắt đầu'); return; }
    try {
      setSaving(true);
      setError('');
      await campaignService.updateCampaign(Number(campaign.id), {
        campaignName: form.name.trim(),
        objective: form.objective,
        brief: form.brief,
        paymentRule: form.paymentRule,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      await onSaved();
      onClose();
    } catch (e) {
      console.error('Update campaign error:', e);
      setError('Không thể lưu thay đổi. Kiểm tra kết nối hoặc quyền (RLS) trên Supabase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div><label className={labelCls}>Tên chiến dịch</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
      </div>
      <div><label className={labelCls}>Mục tiêu</label>
        <input type="text" value={form.objective} onChange={e => set('objective', e.target.value)} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Ngày bắt đầu</label>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
        </div>
        <div><label className={labelCls}>Ngày kết thúc</label>
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div><label className={labelCls}>Brief</label>
        <textarea rows={3} value={form.brief} onChange={e => set('brief', e.target.value)} className={`${inputCls} resize-none`} />
      </div>
      <div><label className={labelCls}>Quy tắc thanh toán</label>
        <textarea rows={2} value={form.paymentRule} onChange={e => set('paymentRule', e.target.value)} className={`${inputCls} resize-none`} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>Hủy</Button>
        <Button onClick={handleSave} disabled={saving}><Check className="w-4 h-4 mr-2" />{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
      </div>
    </div>
  );
}

function CampaignDetail({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const { campaigns } = useBrandContext();
  const c = campaigns.find(camp => camp.id === campaignId);
  if (!c) return null;
  const campaignTasks = tasks.filter(t => t.campaignId === c.id);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 surface-subtle text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{c.totalViews >= 1000000 ? `${(c.totalViews / 1000000).toFixed(1)}M` : `${Math.round(c.totalViews / 1000)}K`}</p>
          <p className="text-xs text-slate-500">Lượt xem</p>
        </div>
        <div className="p-3 surface-subtle text-center">
          <p className="text-xl font-bold text-brand-600">{c.avgEngagementRate}%</p>
          <p className="text-xs text-slate-500">TL tương tác</p>
        </div>
        <div className="p-3 surface-subtle text-center">
          <p className="text-xl font-bold text-blue-600">{c.totalConversions}</p>
          <p className="text-xs text-slate-500">Chuyển đổi</p>
        </div>
        <div className="p-3 surface-subtle text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{c.assignedKOLs.length}</p>
          <p className="text-xs text-slate-500">KOL/KOC</p>
        </div>
      </div>
      <div className="p-4 surface-subtle">
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Mục tiêu</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{c.objective}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Brief</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{c.brief}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Quy tắc thanh toán</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{c.paymentRule}</p>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">KPI Target</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 surface-subtle"><p className="text-lg font-bold text-slate-900 dark:text-white">{c.kpiTarget.views.toLocaleString()}</p><p className="text-xs text-slate-500">Views</p></div>
          <div className="p-3 surface-subtle"><p className="text-lg font-bold text-slate-900 dark:text-white">{c.kpiTarget.engagementRate}%</p><p className="text-xs text-slate-500">ER Target</p></div>
          <div className="p-3 surface-subtle"><p className="text-lg font-bold text-slate-900 dark:text-white">{c.kpiTarget.conversions}</p><p className="text-xs text-slate-500">Conversions</p></div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Timeline</h4>
        <div className="flex items-center gap-2">
          {['draft', 'active', 'tracking', 'completed'].map((step, i) => (
            <div key={step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${['draft', 'active', 'tracking', 'completed'].indexOf(c.status) >= i
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                  }`}>
                  {i + 1}
                </div>
                <span className="text-xs mt-1 text-center text-slate-500">{step === 'draft' ? 'Bản nháp' : step === 'active' ? 'Đang chạy' : step === 'tracking' ? 'Theo dõi' : 'Hoàn thành'}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${['draft', 'active', 'tracking', 'completed'].indexOf(c.status) > i ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-600'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Task Progress */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Task Progress</h4>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: 'Đã phân công', count: campaignTasks.filter(t => t.status === 'assigned').length, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
            { label: 'Đã nộp bản nháp', count: campaignTasks.filter(t => t.status === 'draft_submitted').length, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
            { label: 'Đã đăng bài', count: campaignTasks.filter(t => ['published', 'tracking'].includes(t.status)).length, color: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300' },
            { label: 'Hoàn thành', count: campaignTasks.filter(t => ['completed', 'paid'].includes(t.status)).length, color: 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' },
            { label: 'Chờ sửa lại', count: campaignTasks.filter(t => t.status === 'revision_required').length, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
            { label: 'Tổng nhiệm vụ', count: campaignTasks.length, color: 'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300' },
          ].map(item => (
            <div key={item.label} className="p-3 surface-subtle flex items-center justify-between">
              <span className="text-xs text-slate-500">{item.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.color}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Nhiệm vụ KOL/KOC ({campaignTasks.length})</h4>
        <div className="space-y-2">
          {campaignTasks.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 surface-subtle">
              <div className="flex items-center gap-2">
                <Avatar initials={t.kolAvatar} size="sm" image={getKolImage(t.kolAvatar)} />
                <div><p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p><p className="text-xs text-slate-500">{t.kolPlatform}</p></div>
              </div>
              <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
            </div>
          ))}
          {campaignTasks.length === 0 && <p className="text-sm text-slate-500">Chưa có nhiệm vụ.</p>}
        </div>
      </div>
      <div className="flex justify-end"><Button onClick={onClose}>Đóng</Button></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// KOL VIEW
// ═══════════════════════════════════════════════════════════════════════

function KOLView({ selectedProject }: { selectedProject: string }) {
  const [showCreate, setShowCreate] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{ username: string; password: string } | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [resetCreds, setResetCreds] = useState<{ kolId: string; kolName: string; username: string; password: string } | null>(null);
  const [changePassword, setChangePassword] = useState<{ kolId: string; kolName: string; newPassword: string } | null>(null);
  const [search, setSearch] = useState('');

  const brandKOLs = kols.filter(k => k.brandId === currentBrandId);
  const filtered = brandKOLs.filter(k =>
    k.name.toLowerCase().includes(search.toLowerCase()) || k.niche.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setCreatedCreds({ username: `kol_${Date.now().toString(36)}`, password: Math.random().toString(36).slice(2, 10) + 'A1!' });
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Quản lý KOL/KOC" subtitle="Tạo và quản lý tài khoản KOL/KOC"
        action={<Button onClick={() => { setShowCreate(true); setCreatedCreds(null); }}><Plus className="w-4 h-4 mr-2" />Tạo tài khoản KOL/KOC</Button>}
      />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Tìm KOL/KOC..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100/60">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nền tảng</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Theo dõi</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Lĩnh vực</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">TL tương tác</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Thứ hạng</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(kol => {
                const ranking = kolRankings.find(r => r.kolId === kol.id);
                return (
                  <tr key={kol.id} className="border-b border-slate-100/60 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={kol.avatar} size="sm" image={getKolImage(kol.avatar)} />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{kol.name}</p>
                          <p className="text-xs text-slate-500">{kol.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge label={kol.platform} colorClass="bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300" /></td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{kol.followersDisplay}</td>
                    <td className="px-6 py-4"><Badge label={kol.niche} colorClass="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" /></td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-500 dark:text-brand-400">{kol.engagementRate}%</td>
                    <td className="px-6 py-4">
                      {ranking ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ranking.rank === 1 ? 'bg-amber-500 text-white' : ranking.rank === 2 ? 'bg-slate-400 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>{ranking.rank}</div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={kol.status === 'active' ? 'Hoạt động' : 'Tạm khóa'} colorClass={kol.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300'} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setShowDetail(kol.id)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setChangePassword({ kolId: kol.id, kolName: kol.name, newPassword: '' });
                        }}><Lock className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setResetCreds({ kolId: kol.id, kolName: kol.name, username: kol.handle, password: Math.random().toString(36).slice(2, 10) + 'A1!' });
                        }}><Key className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create KOL Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setCreatedCreds(null); }} title="Tạo tài khoản KOL/KOC mới" width="max-w-xl">
        <div className="space-y-4">
          {!createdCreds ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Họ và tên</label>
                  <input type="text" placeholder="VD: Linh Beauty" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
                </div>
                <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" placeholder="email@example.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Nền tảng</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                    {['TikTok', 'Instagram', 'YouTube', 'Facebook'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Vai trò</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                    <option>KOL</option><option>KOC</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Lĩnh vực</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                  {productCategories.slice(0, 6).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Mật khẩu</label>
                <input type="text" placeholder="Mật khẩu cho tài khoản"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
              </div>
              <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Link mạng xã hội</label>
                <input type="url" placeholder="VD: https://tiktok.com/@username"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setShowCreate(false)}>Hủy</Button>
                <Button onClick={handleCreate}><Send className="w-4 h-4 mr-2" />Tạo & cấp thông tin</Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /><p className="text-sm font-semibold text-emerald-600">Tài khoản KOL/KOC đã được tạo thành công!</p></div>
              <p className="text-xs text-slate-500 mb-4">Cung cấp thông tin đăng nhập cho KOL/KOC. Thông tin chỉ hiển thị một lần.</p>
              <CredentialDisplay username={createdCreds.username} password={createdCreds.password} />
              <div className="flex justify-end pt-4"><Button onClick={() => { setShowCreate(false); setCreatedCreds(null); }}>Hoàn tất</Button></div>
            </>
          )}
        </div>
      </Modal>

      {/* KOL Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Chi tiết KOL/KOC" width="max-w-3xl">
        {showDetail && <KOLDetail kolId={showDetail} onClose={() => setShowDetail(null)} />}
      </Modal>

      {/* Đổi mật khẩu KOL */}
      <Modal isOpen={!!changePassword} onClose={() => setChangePassword(null)} title="Đổi mật khẩu KOL/KOC" width="max-w-md">
        {changePassword && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 surface-subtle">
              <Avatar initials={changePassword.kolName.charAt(0)} size="md" image={getKolImage(changePassword.kolName.charAt(0))} />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{changePassword.kolName}</p>
                <p className="text-xs text-slate-500">Đặt lại mật khẩu mới cho tài khoản</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">Mật khẩu mới</label>
              <input
                type="text"
                value={changePassword.newPassword}
                onChange={e => setChangePassword(p => p ? { ...p, newPassword: e.target.value } : null)}
                placeholder="VD: Koi@2026! — tối thiểu 8 ký tự"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">Mật khẩu phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số.</p>
            </div>
            <div className="bg-amber-50/80 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/40">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                KOL/KOC sẽ phải đăng nhập lại bằng mật khẩu mới. Hãy thông báo cho họ sau khi cập nhật.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setChangePassword(null)}>Hủy</Button>
              <Button
                onClick={() => {
                  if (!changePassword.newPassword.trim() || changePassword.newPassword.length < 6) return;
                  setChangePassword(null);
                }}
                disabled={!changePassword.newPassword.trim() || changePassword.newPassword.length < 6}
              >
                <Lock className="w-4 h-4 mr-2" />Đổi mật khẩu
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cấp lại tài khoản KOL */}
      <Modal isOpen={!!resetCreds} onClose={() => setResetCreds(null)} title="Cấp lại tài khoản KOL/KOC" width="max-w-md">
        {resetCreds && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40">
              <Key className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Cấp lại tài khoản cho <strong>{resetCreds.kolName}</strong></p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Username giữ nguyên, mật khẩu sẽ được tạo mới.</p>
              </div>
            </div>
            <CredentialDisplay
              username={resetCreds.username}
              password={resetCreds.password}
            />
            <div className="bg-amber-50/80 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/40">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Thông tin đăng nhập chỉ hiển thị <strong>một lần duy nhất</strong>. Hãy gửi cho KOL/KOC ngay sau khi cấp lại.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setResetCreds(null)}>Hủy</Button>
              <Button
                onClick={() => {
                  setResetCreds(null);
                }}
              >
                <Check className="w-4 h-4 mr-2" />Xác nhận cấp lại
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function KOLDetail({ kolId, onClose }: { kolId: string; onClose: () => void }) {
  const kol = kols.find(k => k.id === kolId);
  if (!kol) return null;
  const kolTasks = tasks.filter(t => t.kolId === kol.id);
  const ranking = kolRankings.find(r => r.kolId === kol.id);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar initials={kol.avatar} size="lg" image={getKolImage(kol.avatar)} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{kol.name}</h3>
          <p className="text-sm text-slate-500">{kol.handle} / {kol.platform} / {kol.role}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge label={nicheLabels[kol.niche] || kol.niche} colorClass={nicheColors[kol.niche]} />
            <Badge label={`${kol.followersDisplay} followers`} colorClass="bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 surface-subtle text-center"><p className="text-xl font-bold text-brand-600">{kol.engagementRate}%</p><p className="text-xs text-slate-500">TL tương tác</p></div>
        <div className="p-3 surface-subtle text-center"><p className="text-xl font-bold text-slate-900 dark:text-white">{ranking?.rank || '-'}</p><p className="text-xs text-slate-500">Thứ hạng</p></div>
        <div className="p-3 surface-subtle text-center"><p className="text-xl font-bold text-emerald-600">{(kol.totalEarned / 1000000).toFixed(1)}M</p><p className="text-xs text-slate-500">Đã kiếm (VND)</p></div>
        <div className="p-3 surface-subtle text-center"><p className="text-xl font-bold text-amber-600">{(kol.pendingPayment / 1000000).toFixed(1)}M</p><p className="text-xs text-slate-500">Chờ thanh toán</p></div>
      </div>
      {kol.bio && <p className="text-sm text-slate-600 dark:text-slate-300">{kol.bio}</p>}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Nhiệm vụ ({kolTasks.length})</h4>
        <div className="space-y-2">
          {kolTasks.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 surface-subtle">
              <div><p className="text-sm font-medium text-slate-900 dark:text-white">{t.campaignName}</p><p className="text-xs text-slate-500">{t.productName}</p></div>
              <Badge label={taskStatusLabels[t.status as TaskStatus]} colorClass={taskStatusColors[t.status as TaskStatus]} />
            </div>
          ))}
          {kolTasks.length === 0 && <p className="text-sm text-slate-500">Chưa có nhiệm vụ.</p>}
        </div>
      </div>
      <div className="flex justify-end"><Button onClick={onClose}>Đóng</Button></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TASKS VIEW
// ═══════════════════════════════════════════════════════════════════════

function TasksView({ selectedProject }: { selectedProject: string }) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<'kolName' | 'campaignName' | 'status' | 'deadline' | 'paymentAmount'>('kolName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { brandTasks } = useBrandData(selectedProject);
  const filtered = filterStatus === 'all' ? brandTasks : brandTasks.filter(t => t.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = a[sortField] as string | number;
    let bv: string | number = b[sortField] as string | number;
    if (sortField === 'paymentAmount') { av = a.paymentAmount; bv = b.paymentAmount; }
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
  });

  const toggleSort = (field: 'kolName' | 'campaignName' | 'status' | 'deadline' | 'paymentAmount') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortTh = ({ field, label }: { field: 'kolName' | 'campaignName' | 'status' | 'deadline' | 'paymentAmount'; label: string }) => (
    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase cursor-pointer hover:text-slate-300 dark:hover:text-slate-300"
      onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">{label}<ArrowUpDown className="w-3 h-3" /></span>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nhiệm vụ</h1>
          <p className="text-sm text-slate-500 mt-0.5">Theo dõi và quản lý nhiệm vụ cho KOL/KOC</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả trạng thái</option>
          {(Object.keys(taskStatusLabels) as TaskStatus[]).map(s => <option key={s} value={s}>{taskStatusLabels[s]}</option>)}
        </select>
        <span className="text-sm text-slate-500">{sorted.length} nhiệm vụ</span>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100/60">
                <SortTh field="kolName" label="KOL/KOC" />
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Nền tảng</th>
                <SortTh field="campaignName" label="Chiến dịch" />
                <SortTh field="status" label="Trạng thái" />
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
                <SortTh field="deadline" label="Hạn" />
                <SortTh field="paymentAmount" label="Thù lao" />
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(task => (
                <tr key={task.id} className="border-b border-slate-100/60 hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={task.kolAvatar} size="sm" image={getKolImage(task.kolAvatar)} />
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{task.kolName}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4"><Badge label={task.kolPlatform} colorClass="bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300" /></td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{task.campaignName}</td>
                  <td className="px-5 py-4"><Badge label={taskStatusLabels[task.status as TaskStatus]} colorClass={taskStatusColors[task.status as TaskStatus]} /></td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{task.productName}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{task.deadline}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-900 dark:text-white">{task.paymentAmount.toLocaleString()} VND</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedTask(task.id)}>
                        <Eye className="w-3.5 h-3.5 mr-1" />Chi tiết
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Không có nhiệm vụ nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Chi tiết nhiệm vụ" width="max-w-3xl">
        {selectedTask && <TaskDetail taskId={selectedTask} onClose={() => setSelectedTask(null)} />}
      </Modal>
    </div>
  );
}

function TaskDetail({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  const latestDraft = task.draftContent?.[task.draftContent.length - 1];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 surface-subtle">
        <Avatar initials={task.kolAvatar} size="lg" image={getKolImage(task.kolAvatar)} />
        <div className="flex-1">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{task.kolName}</p>
          <p className="text-sm text-slate-500">{task.campaignName} • {task.productName}</p>
        </div>
        <Badge label={taskStatusLabels[task.status as TaskStatus]} colorClass={taskStatusColors[task.status as TaskStatus]} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 surface-subtle"><p className="text-xs text-slate-500 mb-1">KPI Target Views</p><p className="text-lg font-bold">{task.kpiTarget.views.toLocaleString()}</p></div>
        <div className="p-4 surface-subtle"><p className="text-xs text-slate-500 mb-1">KPI Target ER</p><p className="text-lg font-bold">{task.kpiTarget.engagementRate}%</p></div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Brief nhiệm vụ</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 p-3 surface-subtle">{task.brief}</p>
      </div>
      {task.draftContent && task.draftContent.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Bản nháp ({task.draftContent.length})</h4>
          {task.draftContent.map((draft, i) => (
            <div key={i} className={`p-3 rounded-xl ${i === task.draftContent!.length - 1 ? 'bg-brand-50 dark:bg-brand-900/20 border border-teal-200' : 'bg-slate-50/50 dark:bg-slate-700/50'} mb-2`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Phiên bản {draft.version}</p>
                <span className="text-xs text-slate-500">{draft.submittedAt}</span>
              </div>
              {'feedback' in draft && draft.feedback && <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"><MessageCircle className="w-3 h-3" />{draft.feedback}</p>}
            </div>
          ))}
        </div>
      )}
      {task.publishedContent && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Bài đăng</h4>
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <a href={task.publishedContent.postUrl} className="text-sm text-brand-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />{task.publishedContent.postUrl}</a>
            </div>
            <p className="text-xs text-slate-500">Đăng lúc: {task.publishedContent.publishedAt}</p>
            <div className="border-2 border-dashed bg-slate-200 dark:border-slate-600 rounded-xl p-3 text-center cursor-pointer hover:border-brand-400 transition-colors">
              <p className="text-xs text-slate-400">Tải lên screenshot bài đăng (JPG, PNG tối đa 5MB)</p>
            </div>
          </div>
        </div>
      )}
      {task.metrics && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Metrics</h4>
          <div className="p-3 surface-subtle">
            <div className="grid grid-cols-5 gap-2 mb-2">
              {([['Views', task.metrics.views], ['Likes', task.metrics.likes], ['Comments', task.metrics.comments], ['Shares', task.metrics.shares], ['Saves', task.metrics.saves]] as [string, number][]).map(([k, v]) => (
                <div key={k} className="text-center"><p className="text-lg font-bold">{v.toLocaleString()}</p><p className="text-xs text-slate-500">{k}</p></div>
              ))}
            </div>
            <p className="text-sm text-center text-brand-600 font-medium">Engagement Rate: {task.metrics.engagementRate}%</p>
            <p className="text-xs text-center text-slate-500 mt-1">
              {task.metrics.brandConfirmed ? <span className="text-emerald-600">✓ Đã xác nhận</span> : <span className="text-amber-600">Chờ xác nhận</span>}
            </p>
            <div className="border-2 border-dashed bg-slate-200 dark:border-slate-600 rounded-xl p-2 text-center cursor-pointer hover:border-brand-400 transition-colors mt-2">
              <p className="text-xs text-slate-400">Tải lên insight screenshot</p>
            </div>
          </div>
        </div>
      )}
      {task.conversion && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Conversion Data</h4>
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl">
            <div className="grid grid-cols-4 gap-2">
              {([['Orders', task.conversion.orders], ['Leads', task.conversion.leads], ['Coupon usage', task.conversion.couponUsage], ['Revenue', `${(task.conversion.revenue / 1000000).toFixed(1)}M`]] as [string, string | number][]).map(([k, v]) => (
                <div key={k}><p className="text-lg font-bold text-slate-900 dark:text-white">{v}</p><p className="text-xs text-slate-500">{k}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end"><Button onClick={onClose}>Đóng</Button></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WORKFLOW VIEW — Brand Flowchart Implementation
// ═══════════════════════════════════════════════════════════════════════

type WorkflowNode = 'content_review' | 'metrics_review' | 'payout';
interface TaskState { status: TaskStatus; feedback?: string; metricsConfirmed?: boolean; }

const WORKFLOW_NODES: { id: WorkflowNode; label: string; subtitle: string }[] = [
  { id: 'content_review', label: 'Phê duyệt nội dung', subtitle: 'Xem draft — Approve để KOL đăng bài, Reject để KOL chỉnh sửa' },
  { id: 'metrics_review', label: 'Xác nhận Metrics', subtitle: 'Xem post URL, screenshot, số liệu KOL nhập, và conversion data' },
  { id: 'payout', label: 'Thanh toán', subtitle: 'Duyệt thanh toán đầy đủ, một phần, hoặc giữ tạm' },
];

function WorkflowView({ selectedProject, initialNode }: { selectedProject: string; initialNode?: WorkflowNode }) {
  const [node, setNode] = useState<WorkflowNode>(initialNode || 'content_review');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<Record<string, TaskState>>({});
  const [feedback, setFeedback] = useState('');
  const [paymentAction, setPaymentAction] = useState<{ paymentId: string; action: 'approve' | 'partial' | 'hold' | 'reject' } | null>(null);

  const getTaskState = (taskId: string): TaskStatus =>
    localTasks[taskId]?.status || tasks.find(t => t.id === taskId)?.status || 'assigned';
  const setTaskState = (taskId: string, status: TaskStatus, fb?: string) => {
    setLocalTasks(prev => ({ ...prev, [taskId]: { status, feedback: fb, metricsConfirmed: prev[taskId]?.metricsConfirmed } }));
    if (fb !== undefined) setFeedback('');
    setSelectedTaskId(null);
  };
  const setMetricsConfirmed = (taskId: string, confirmed: boolean) => {
    const existing = localTasks[taskId] || {} as TaskState;
    setLocalTasks(prev => ({ ...prev, [taskId]: { ...existing, metricsConfirmed: confirmed } }));
  };

  const goTo = (n: WorkflowNode) => setNode(n);

  // Step indicator
  const STEP_ORDER: WorkflowNode[] = ['content_review', 'metrics_review', 'payout'];
  const STEP_LABELS: Record<WorkflowNode, string> = {
    content_review: 'Phê duyệt\nnội dung',
    metrics_review: 'Xác nhận\nMetrics',
    payout: 'Thanh toán',
  };
  const currentStepIdx = STEP_ORDER.indexOf(node);

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      <div className="card-base p-5">
        <div className="flex items-center justify-between">
          {STEP_ORDER.map((step, i) => {
            const isActive = node === step;
            const isPast = currentStepIdx > i;
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${isActive ? 'bg-brand-500 text-white ring-4 ring-brand-100 dark:ring-brand-900/40' : isPast ? 'bg-brand-500 text-white' : 'bg-slate-100/60 dark:bg-slate-700 text-slate-400'}`}>
                    {isPast ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <p className={`text-[11px] font-medium mt-2 text-center whitespace-pre-line ${isActive ? 'text-brand-500 dark:text-brand-400 font-bold' : isPast ? 'text-brand-400' : 'text-slate-400'}`}>
                    {STEP_LABELS[step]}
                  </p>
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${currentStepIdx > i ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow tabs */}
      <div className="flex gap-1 p-1 bg-slate-100/60 dark:bg-slate-700/50 rounded-xl w-fit">
        {WORKFLOW_NODES.map(n => (
          <button key={n.id} onClick={() => goTo(n.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${node === n.id
              ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 dark:text-slate-400 dark:hover:text-slate-200'}`}>
            {n.label}
          </button>
        ))}
      </div>

      {/* ── Content Review ── */}
      {node === 'content_review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Phê duyệt nội dung</h1>
              <p className="text-sm text-slate-500 mt-0.5">Xem draft từ KOL/KOC — Phê duyệt để KOL đăng bài, Từ chối để KOL chỉnh sửa</p>
            </div>
          </div>
          <ContentReviewPanel
            selectedProject={selectedProject}
            selectedTaskId={selectedTaskId}
            setSelectedTaskId={id => { setSelectedTaskId(id); setFeedback(''); }}
            feedback={feedback} setFeedback={setFeedback}
            getTaskState={getTaskState} setTaskState={setTaskState}
          />
        </div>
      )}

      {/* ── Metrics Review ── */}
      {node === 'metrics_review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Xác nhận Metrics</h1>
              <p className="text-sm text-slate-500 mt-0.5">Xem post URL, screenshot, số liệu KOL nhập, và conversion data</p>
            </div>
          </div>
          <MetricsReviewPanel
            selectedProject={selectedProject}
            getTaskState={getTaskState} setMetricsConfirmed={setMetricsConfirmed}
            localTasks={localTasks} setTaskState={setTaskState}
          />
        </div>
      )}

      {/* ── Payout ── */}
      {node === 'payout' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thanh toán</h1>
              <p className="text-sm text-slate-500 mt-0.5">Duyệt thanh toán đầy đủ, một phần, giữ tạm hoặc từ chối</p>
            </div>
          </div>
          <PayoutPanel selectedProject={selectedProject} paymentAction={paymentAction} setPaymentAction={setPaymentAction} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ACTION DASHBOARD — Unified Action Center
// State Machine:
//   Content Flow : draft_submitted → [Approve] → approved_to_publish
//                                → [Reject] → revision_required → draft_submitted (loop)
//   Metrics Flow : published → tracking → metrics_submitted → [Approve] → metrics_approved
//                                                               → [Request Update] → tracking
//   Payment Flow : metrics_approved → [Full Approve] → payment_pending → paid
//                                     → [Partial] → payment_pending → paid
//                                     → [Hold/Reject] → hold / rejected
// Edge Cases: concurrent edits, double-submit, KOL churn during review cycle,
//            budget overrun, fake metrics, content guideline violation
// ═══════════════════════════════════════════════════════════════════════

function ActionDashboardModal({ selectedProject }: { selectedProject: string }) {
  const { brandTasks } = useBrandData(selectedProject);

  // Local state machine — independent from WorkflowView's localTasks
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({});
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'content' | 'metrics' | 'payment'>('all');

  const getState = (taskId: string, t: typeof brandTasks[number]): TaskStatus =>
    taskStates[taskId]?.status || t.status;

  // Filter groups
  const pendingContent = brandTasks.filter(t =>
    ['draft_submitted', 'revision_required'].includes(getState(t.id, t))
  );
  const pendingMetrics = brandTasks.filter(t =>
    ['published', 'tracking', 'metrics_submitted'].includes(getState(t.id, t))
  );
  const pendingPayment = brandTasks.filter(t =>
    ['metrics_approved', 'payment_pending'].includes(getState(t.id, t))
  );

  const pendingByType = {
    all: brandTasks.filter(t =>
      ['draft_submitted', 'revision_required', 'published', 'tracking', 'metrics_submitted', 'metrics_approved', 'payment_pending'].includes(getState(t.id, t))
    ),
    content: pendingContent,
    metrics: pendingMetrics,
    payment: pendingPayment,
  };

  const TABS = [
    { id: 'all' as const, label: 'Tất cả', count: pendingByType.all.length },
    { id: 'content' as const, label: 'Duyệt bài', count: pendingContent.length },
    { id: 'metrics' as const, label: 'Duyệt metrics', count: pendingMetrics.length },
    { id: 'payment' as const, label: 'Thanh toán', count: pendingPayment.length },
  ];

  // ── State Machine: Content ──
  // draft_submitted | revision_required → [Approve] → approved_to_publish
  // draft_submitted | revision_required → [Reject] → revision_required
  const [rejectFb, setRejectFb] = useState('');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const handleContentApprove = (taskId: string) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { status: 'approved_to_publish' as TaskStatus, metricsConfirmed: prev[taskId]?.metricsConfirmed },
    }));
    setOpenTask(null);
  };

  // ── State Machine: Metrics ──
  // published | tracking | metrics_submitted → [Approve] → metrics_approved
  // published | tracking | metrics_submitted → [Request Update] → tracking
  const handleMetricsApprove = (taskId: string) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: { status: 'metrics_approved' as TaskStatus, feedback: prev[taskId]?.feedback, metricsConfirmed: true },
    }));
    setOpenTask(null);
  };

  // ── State Machine: Payment ──
  // metrics_approved | payment_pending → [Full] → paid
  //                               → [Partial] → paid
  //                               → [Hold] → hold  | [Reject] → rejected
  const [paymentDecision, setPaymentDecision] = useState<{
    taskId: string; action: 'full' | 'partial' | 'hold' | 'reject'; amount?: number; reason?: string;
  } | null>(null);

  const handlePaymentConfirm = () => {
    if (!paymentDecision) return;
    const newStatus: TaskStatus =
      paymentDecision.action === 'full' || paymentDecision.action === 'partial' ? 'paid' :
        paymentDecision.action === 'hold' ? 'hold' : 'rejected';
    setTaskStates(prev => ({
      ...prev,
      [paymentDecision.taskId]: { status: newStatus, feedback: paymentDecision.reason, metricsConfirmed: true },
    }));
    setPaymentDecision(null);
    setOpenTask(null);
  };

  const badgeMap: Record<string, { label: string; color: string }> = {
    draft_submitted: { label: 'Mới nộp', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
    revision_required: { label: 'Cần sửa lại', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
    published: { label: 'Đã đăng bài', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' },
    tracking: { label: 'Đang theo dõi', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
    metrics_submitted: { label: 'Đã gửi metrics', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' },
    metrics_approved: { label: 'Metrics OK', color: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300' },
    payment_pending: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  };

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Chờ duyệt bài', count: pendingContent.length, color: 'bg-gray-50 dark:bg-gray-800', icon: <CheckCircle2 className="w-4 h-4" />, accent: 'text-gray-600 dark:text-gray-400', tabKey: 'content' },
          { label: 'Chờ duyệt metrics', count: pendingMetrics.length, color: 'bg-gray-50 dark:bg-gray-800', icon: <BarChart3 className="w-4 h-4" />, accent: 'text-gray-600 dark:text-gray-400', tabKey: 'metrics' },
          { label: 'Chờ thanh toán', count: pendingPayment.length, color: 'bg-gray-50 dark:bg-gray-800', icon: <CreditCard className="w-4 h-4" />, accent: 'text-gray-600 dark:text-gray-400', tabKey: 'payment' },
        ].map(item => (
          <div key={item.label} className={`${item.color} rounded p-4 text-center cursor-pointer border border-gray-200 dark:border-gray-700`}
            onClick={() => setTab(item.tabKey as typeof tab)}>
            <div className={`${item.accent} flex justify-center mb-1`}>{item.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.count}</p>
            <p className="text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Tab filter */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${tab === t.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-slate-100/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {pendingByType[tab].length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có tác vụ nào ở trạng thái này.</p>
          </div>
        ) : (
          pendingByType[tab].map(t => {
            const state = getState(t.id, t);
            const badge = badgeMap[state] || { label: state, color: 'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300' };
            const metricsData = t.metrics;
            const views = metricsData ? Number(metricsData.views) : 0;
            const er = metricsData ? metricsData.engagementRate : 0;
            const conv = metricsData && 'conversions' in metricsData ? Number((metricsData as { conversions?: number }).conversions || 0) : 0;

            return (
              <div key={t.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all ${openTask === t.id ? 'border-brand-400 shadow-md' : 'border-slate-200/80 dark:border-slate-700/60'
                  } hover:shadow-md cursor-pointer`}
                onClick={() => setOpenTask(openTask === t.id ? null : t.id)}>

                {/* Header */}
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={t.kolAvatar} size="sm" image={getKolImage(t.kolAvatar)} />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p>
                      <p className="text-xs text-slate-500">{t.kolPlatform} · {t.productName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
                    <span className="text-xs text-slate-400">{t.deadline}</span>
                  </div>
                </div>

                {/* Expanded */}
                {openTask === t.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100/80 pt-3">
                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-2">
                      {metricsData ? (
                        <>
                          <div className="p-2 bg-slate-50/50 dark:bg-slate-700/40 rounded-lg text-center">
                            <p className="text-sm font-bold">{views.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">Views</p>
                          </div>
                          <div className="p-2 bg-slate-50/50 dark:bg-slate-700/40 rounded-lg text-center">
                            <p className="text-sm font-bold">{er}%</p>
                            <p className="text-[10px] text-slate-500">ER</p>
                          </div>
                          <div className="p-2 bg-slate-50/50 dark:bg-slate-700/40 rounded-lg text-center">
                            <p className="text-sm font-bold">{conv.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">Conversions</p>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-3 p-2 bg-slate-50/50 dark:bg-slate-700/40 rounded-lg text-center text-xs text-slate-500">
                          Chưa có metrics — KOL chưa nộp số liệu
                        </div>
                      )}
                    </div>

                    {/* Payment info */}
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Thù lao</span>
                      <span className="font-medium text-slate-900 dark:text-white">{t.paymentAmount.toLocaleString()} VND</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {/* Content */}
                      {(state === 'draft_submitted' || state === 'revision_required') && (
                        <>
                          <Button size="sm" onClick={() => handleContentApprove(t.id)}>
                            <Check className="w-3.5 h-3.5 mr-1" />Duyệt bài
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setRejectTarget(t.id)}>
                            <XCircle className="w-3.5 h-3.5 mr-1" />Từ chối
                          </Button>
                        </>
                      )}
                      {/* Metrics */}
                      {(state === 'published' || state === 'tracking' || state === 'metrics_submitted') && (
                        <>
                          <Button size="sm" onClick={() => handleMetricsApprove(t.id)}>
                            <Check className="w-3.5 h-3.5 mr-1" />Duyệt Metrics
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setOpenTask(null)}>
                            <MessageSquare className="w-3.5 h-3.5 mr-1" />Yêu cầu cập nhật
                          </Button>
                        </>
                      )}
                      {/* Payment */}
                      {(state === 'metrics_approved' || state === 'payment_pending') && (
                        <>
                          <Button size="sm" onClick={() => setPaymentDecision({ taskId: t.id, action: 'full' })}>
                            <CreditCard className="w-3.5 h-3.5 mr-1" />Duyệt toàn bộ
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setPaymentDecision({ taskId: t.id, action: 'partial' })}>
                            Trả một phần
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setPaymentDecision({ taskId: t.id, action: 'hold' })}>
                            <Clock className="w-3.5 h-3.5 mr-1" />Giữ tạm
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Reject feedback modal */}
      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Từ chối bài viết" width="max-w-md">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300">
            KOL sẽ nhận được thông báo và cần chỉnh sửa theo feedback trước khi nộp lại.
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Feedback cho KOL *</label>
            <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="VD: Video quá ngắn, cần thêm phần giới thiệu sản phẩm và CTA rõ ràng hơn..."
              value={rejectFb} onChange={e => setRejectFb(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setRejectTarget(null); setRejectFb(''); }}>Hủy</Button>
            <Button variant="danger" disabled={!rejectFb.trim()} onClick={() => {
              if (rejectTarget) {
                setTaskStates(prev => ({
                  ...prev,
                  [rejectTarget]: { status: 'revision_required' as TaskStatus, feedback: rejectFb, metricsConfirmed: prev[rejectTarget]?.metricsConfirmed },
                }));
                setRejectTarget(null);
                setRejectFb('');
                setOpenTask(null);
              }
            }}>
              <XCircle className="w-4 h-4 mr-2" />Gửi từ chối
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment decision modal */}
      <Modal isOpen={!!paymentDecision} onClose={() => setPaymentDecision(null)} title="Xác nhận thanh toán" width="max-w-md">
        {paymentDecision && (
          <div className="space-y-4">
            {paymentDecision.action === 'partial' && (
              <div>
                <label className="block text-sm font-medium mb-1">Số tiền thanh toán (VND)</label>
                <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="VD: 2500000"
                  onChange={e => setPaymentDecision(p => p ? { ...p, amount: Number(e.target.value) } : null)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Ghi chú / Lý do {paymentDecision.action === 'hold' ? '*' : '(tùy chọn)'}
              </label>
              <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder={paymentDecision.action === 'hold' ? 'Lý do giữ tạm (bắt buộc)...' : 'Ghi chú thêm...'}
                onChange={e => setPaymentDecision(p => p ? { ...p, reason: e.target.value } : null)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPaymentDecision(null)}>Hủy</Button>
              <Button
                variant={paymentDecision.action === 'reject' ? 'danger' : 'primary'}
                onClick={handlePaymentConfirm}
                disabled={paymentDecision.action === 'hold' && !paymentDecision.reason?.trim()}>
                {paymentDecision.action === 'full' ? 'Duyệt toàn bộ' :
                  paymentDecision.action === 'partial' ? 'Thanh toán một phần' :
                    paymentDecision.action === 'hold' ? 'Giữ tạm' : 'Từ chối'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SMART ACTION HUB — Unified Actionable Dashboard
// UX Laws Applied:
//   1. Progressive Disclosure  : charts → KPI cards → task list → drawer
//   2. Data-driven Navigation  : click chart segment → filters task list
//   3. Component Standardization: 8pt grid, consistent status colors
//   4. No Dead Ends            : every row has CTA, every drawer has next action
// Layout: [Top: Chart Row] → [Middle: KPI Action Cards + Filters]
//         → [Bottom: Filterable Task Table with Inline Actions]
//         → [Right: Sliding Drawer for Task Detail]
// ═══════════════════════════════════════════════════════════════════════

type HubFilter = 'all' | 'content' | 'metrics' | 'payment' | 'draft_submitted' | 'revision_required' | 'published' | 'tracking' | 'metrics_submitted';

function SmartActionHub({ selectedProject }: { selectedProject: string }) {
  const { brandTasks, brandCampaigns } = useBrandData(selectedProject);

  // ── State: filtering ──
  const [filter, setFilter] = useState<HubFilter>('all');
  const [drawerTask, setDrawerTask] = useState<typeof brandTasks[number] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ── State: task overrides ──
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>({});

  // ── Local helpers ──
  const getState = (t: typeof brandTasks[number]): TaskStatus =>
    taskStates[t.id]?.status || t.status;

  // ── Group counts ──
  const counts = {
    all: brandTasks.length,
    content: brandTasks.filter(t => ['draft_submitted', 'revision_required'].includes(getState(t))).length,
    metrics: brandTasks.filter(t => ['published', 'tracking', 'metrics_submitted'].includes(getState(t))).length,
    payment: brandTasks.filter(t => ['metrics_approved', 'payment_pending'].includes(getState(t))).length,
    draft_submitted: brandTasks.filter(t => getState(t) === 'draft_submitted').length,
    revision_required: brandTasks.filter(t => getState(t) === 'revision_required').length,
    published: brandTasks.filter(t => getState(t) === 'published').length,
    tracking: brandTasks.filter(t => getState(t) === 'tracking').length,
    metrics_submitted: brandTasks.filter(t => getState(t) === 'metrics_submitted').length,
  };

  // ── Filtered list ──
  const filtered = brandTasks.filter(t => {
    if (filter !== 'all' && filter !== 'content' && filter !== 'metrics' && filter !== 'payment') {
      if (getState(t) !== filter) return false;
    }
    if (filter === 'content' && !['draft_submitted', 'revision_required'].includes(getState(t))) return false;
    if (filter === 'metrics' && !['published', 'tracking', 'metrics_submitted'].includes(getState(t))) return false;
    if (filter === 'payment' && !['metrics_approved', 'payment_pending'].includes(getState(t))) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!t.kolName.toLowerCase().includes(s) && !t.productName.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  // ── Side drawer task ──
  const drawerState = drawerTask ? getState(drawerTask) : null;

  // ── Chart data: task status donut ──
  const chartData = [
    { name: 'Mới nộp', value: counts.draft_submitted, color: '#7c3aed' },
    { name: 'Cần sửa', value: counts.revision_required, color: '#dc2626' },
    { name: 'Đã đăng bài', value: counts.published, color: '#0891b2' },
    { name: 'Theo dõi', value: counts.tracking, color: '#d97706' },
    { name: 'Chờ metrics', value: counts.metrics_submitted, color: '#4f46e5' },
    { name: 'Chờ thanh toán', value: counts.payment, color: '#059669' },
  ].filter(d => d.value > 0);

  const totalChart = chartData.reduce((s, d) => s + d.value, 0);

  // ── Chart click → set filter ──
  const handleChartClick = (segmentName: string) => {
    const map: Record<string, HubFilter> = {
      'Mới nộp': 'draft_submitted',
      'Cần sửa': 'revision_required',
      'Đã đăng bài': 'published',
      'Theo dõi': 'tracking',
      'Chờ metrics': 'metrics_submitted',
      'Chờ thanh toán': 'payment',
    };
    setFilter(map[segmentName] || 'all');
  };

  // ── State machine actions ──
  const approveContent = (taskId: string) => {
    setTaskStates(prev => ({ ...prev, [taskId]: { status: 'approved_to_publish' as TaskStatus, metricsConfirmed: prev[taskId]?.metricsConfirmed } }));
    setDrawerTask(null);
  };
  const rejectContent = (taskId: string, fb: string) => {
    setTaskStates(prev => ({ ...prev, [taskId]: { status: 'revision_required' as TaskStatus, feedback: fb, metricsConfirmed: prev[taskId]?.metricsConfirmed } }));
    setDrawerTask(null);
  };
  const approveMetrics = (taskId: string) => {
    setTaskStates(prev => ({ ...prev, [taskId]: { status: 'metrics_approved' as TaskStatus, feedback: prev[taskId]?.feedback, metricsConfirmed: true } }));
    setDrawerTask(null);
  };
  const [paymentDecision, setPaymentDecision] = useState<{ taskId: string; action: 'full' | 'partial' | 'hold'; amount?: number; reason?: string } | null>(null);
  const confirmPayment = () => {
    if (!paymentDecision) return;
    const newStatus: TaskStatus = paymentDecision.action === 'full' || paymentDecision.action === 'partial' ? 'paid' : 'hold';
    setTaskStates(prev => ({ ...prev, [paymentDecision.taskId]: { status: newStatus, feedback: paymentDecision.reason, metricsConfirmed: true } }));
    setPaymentDecision(null);
    setDrawerTask(null);
  };

  const STATUS_COLORS: Record<string, string> = {
    draft_submitted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    revision_required: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    approved_to_publish: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
    published: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    tracking: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    metrics_submitted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    metrics_approved: 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300',
    payment_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    rejected: 'bg-slate-200 text-slate-300 dark:bg-slate-700 dark:text-slate-300',
    assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  };

  return (
    <div className="relative">
      <div className={`transition-colors duration-300 ${drawerTask ? 'pr-80' : ''}`}>
        {/* ── Section 1: Charts + KPI Row ── */}
        <div className="grid grid-cols-12 gap-4 mb-5">
          {/* Donut chart */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Phân bổ trạng thái</p>
            <p className="text-xs text-slate-500 mb-3">Click vào phần để lọc danh sách</p>
            {chartData.length > 0 ? (
              <div className="flex items-center gap-4">
                {/* Donut SVG */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    {chartData.reduce((acc, seg, i) => {
                      const start = acc.cumPct;
                      const pct = seg.value / totalChart;
                      const dash = (pct * 100).toFixed(1);
                      const gap = ((1 - pct) * 100).toFixed(1);
                      acc.paths.push(
                        <circle key={seg.name} cx="18" cy="18" r="14" fill="none"
                          stroke={seg.color} strokeWidth="5"
                          strokeDasharray={`${dash} ${gap}`}
                          strokeDashoffset={`-${(start * 100).toFixed(2)}`}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleChartClick(seg.name)}
                          style={{ filter: filter === seg.name ? 'drop-shadow(0 0 4px ' + seg.color + ')' : undefined }}
                        />
                      );
                      acc.cumPct += pct;
                      return acc;
                    }, { paths: [] as JSX.Element[], cumPct: 0 }).paths}
                    <circle cx="18" cy="18" r="10" fill="white" className="dark:fill-gray-800" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{totalChart}</p>
                    <p className="text-[10px] text-slate-500">tổng</p>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex-1 space-y-1.5">
                  {chartData.map(seg => {
                    const isActive = (
                      (filter === 'draft_submitted' && seg.name === 'Mới nộp') ||
                      (filter === 'revision_required' && seg.name === 'Cần sửa') ||
                      (filter === 'published' && seg.name === 'Đã đăng bài') ||
                      (filter === 'tracking' && seg.name === 'Theo dõi') ||
                      (filter === 'metrics_submitted' && seg.name === 'Chờ metrics') ||
                      (filter === 'payment' && seg.name === 'Chờ thanh toán')
                    );
                    return (
                      <button key={seg.name} onClick={() => handleChartClick(seg.name)}
                        className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-lg transition-all text-xs group ${isActive ? 'bg-slate-100/60 dark:bg-slate-700 font-semibold' : 'hover:bg-slate-50/60 dark:hover:bg-slate-700/50'
                          }`}>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-slate-300 dark:text-slate-300 flex-1">{seg.name}</span>
                        <span className={`font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{seg.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">Không có dữ liệu</div>
            )}
          </div>

          {/* KPI action cards — click to filter */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'draft_submitted', label: 'Mới nộp', sub: 'Cần duyệt bài', color: 'bg-gray-50 dark:bg-gray-800', icon: <CheckCircle2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />, count: counts.draft_submitted },
              { key: 'revision_required', label: 'Cần sửa lại', sub: 'Feedback chờ gửi', color: 'bg-gray-50 dark:bg-gray-800', icon: <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />, count: counts.revision_required },
              { key: 'metrics', label: 'Chờ duyệt Metrics', sub: 'Xác nhận số liệu', color: 'bg-gray-50 dark:bg-gray-800', icon: <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />, count: counts.metrics },
              { key: 'payment', label: 'Chờ thanh toán', sub: 'Duyệt & trả tiền', color: 'bg-gray-50 dark:bg-gray-800', icon: <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />, count: counts.payment },
            ].map(card => (
              <button key={card.key} onClick={() => setFilter(card.key === 'metrics' ? 'metrics' : card.key as HubFilter)}
                className={`${card.color} rounded p-4 text-left border border-gray-200 dark:border-gray-700 ${filter === card.key || (card.key === 'metrics' && filter === 'metrics') ? 'ring-2 ring-gray-400' : ''
                  }`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{card.count}</span>
                  {card.icon}
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Section 2: Filter bar + Search ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Quick filter chips */}
          <div className="flex gap-2 flex-wrap">
            {([
              { id: 'all' as HubFilter, label: 'Tất cả' },
              { id: 'content' as HubFilter, label: 'Duyệt bài' },
              { id: 'metrics' as HubFilter, label: 'Duyệt metrics' },
              { id: 'payment' as HubFilter, label: 'Thanh toán' },
            ] as { id: HubFilter; label: string }[]).map(chip => (
              <button key={chip.id} onClick={() => setFilter(chip.id)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filter === chip.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}>
                {chip.label}
                {counts[chip.id] > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === chip.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600'
                    }`}>{counts[chip.id]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm KOL, sản phẩm..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white" />
          </div>

          {/* Result count */}
          <span className="text-sm text-slate-500">{filtered.length} nhiệm vụ</span>
        </div>

        {/* ── Section 3: Task Table ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Sản phẩm</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">KPI</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Thù lao</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Hạn</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Không có nhiệm vụ nào phù hợp bộ lọc.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(t => {
                    const state = getState(t);
                    const isActionable = ['draft_submitted', 'revision_required', 'published', 'tracking', 'metrics_submitted', 'metrics_approved', 'payment_pending'].includes(state);
                    return (
                      <tr key={t.id}
                        className={`border-b border-slate-100/60 transition-colors cursor-pointer ${drawerTask?.id === t.id ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50/70 dark:hover:bg-slate-700/30'
                          }`}
                        onClick={() => setDrawerTask(drawerTask?.id === t.id ? null : t)}>
                        {/* KOL */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={t.kolAvatar} size="sm" image={getKolImage(t.kolAvatar)} />
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{t.kolName}</p>
                              <p className="text-xs text-slate-500">{t.kolPlatform}</p>
                            </div>
                          </div>
                        </td>
                        {/* Product */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-slate-300 dark:text-slate-300">{t.productName}</p>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[state] || 'bg-slate-100'}`}>
                            {taskStatusLabels[state] || state}
                          </span>
                        </td>
                        {/* KPI quick */}
                        <td className="px-5 py-3.5">
                          {t.metrics ? (
                            <div className="text-xs space-y-0.5">
                              <p className="font-medium text-slate-900 dark:text-white">{Number(t.metrics.views).toLocaleString()} views</p>
                              <p className="text-slate-500">ER {t.metrics.engagementRate}%</p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">—</span>
                          )}
                        </td>
                        {/* Payment */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{t.paymentAmount.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">VND</p>
                        </td>
                        {/* Deadline */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-slate-300 dark:text-slate-300">{t.deadline}</p>
                        </td>
                        {/* Inline CTA */}
                        <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1.5 items-center">
                            {/* Content: Approve */}
                            {state === 'draft_submitted' && (
                              <Button size="sm" onClick={() => approveContent(t.id)}>
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            {/* Metrics: Approve */}
                            {(state === 'published' || state === 'tracking' || state === 'metrics_submitted') && (
                              <Button size="sm" onClick={() => approveMetrics(t.id)}>
                                <BarChart3 className="w-3 h-3" />
                              </Button>
                            )}
                            {/* Payment: Pay */}
                            {(state === 'metrics_approved' || state === 'payment_pending') && (
                              <Button size="sm" onClick={() => { setPaymentDecision({ taskId: t.id, action: 'full' }); setDrawerTask(t); }}>
                                <CreditCard className="w-3 h-3" />
                              </Button>
                            )}
                            {/* Detail drawer */}
                            <Button size="sm" variant="ghost" onClick={() => setDrawerTask(drawerTask?.id === t.id ? null : t)}>
                              <ChevronRight className={`w-3 h-3 transition-transform ${drawerTask?.id === t.id ? 'rotate-90' : ''}`} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Section 4: Sliding Drawer (Progressive Disclosure) ── */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-800 border-l border-slate-200/60 dark:border-slate-700 shadow-2xl z-50 transition-transform duration-300 overflow-y-auto ${drawerTask ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {drawerTask && (
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{drawerTask.kolName}</h3>
                <p className="text-sm text-slate-500">{drawerTask.productName}</p>
              </div>
              <button onClick={() => setDrawerTask(null)} className="p-1 rounded-lg hover:bg-slate-100/60 dark:hover:bg-slate-700/50">
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[drawerState!] || ''}`}>
                {taskStatusLabels[drawerState!] || drawerState}
              </span>
              <span className="text-xs text-slate-400">{drawerTask.kolPlatform}</span>
            </div>

            {/* KPI Detail */}
            {drawerTask.metrics && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Views', value: Number(drawerTask.metrics.views).toLocaleString() },
                  { label: 'ER', value: drawerTask.metrics.engagementRate + '%' },
                  { label: 'Comments', value: Number((drawerTask.metrics as { comments?: number }).comments || 0).toLocaleString() },
                ].map(k => (
                  <div key={k.label} className="bg-slate-50/50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{k.value}</p>
                    <p className="text-[10px] text-slate-500">{k.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Content links */}
            {(drawerTask.publishedContent?.postUrl) && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Link bài đăng</p>
                <a href={drawerTask.publishedContent?.postUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-teal-700 underline truncate">
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />{drawerTask.publishedContent?.postUrl}
                </a>
              </div>
            )}

            {/* Payment info */}
            <div className="p-3 surface-subtle">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-500">Thù lao</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{drawerTask.paymentAmount.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Hạn</span>
                <span className="text-xs font-medium text-slate-300 dark:text-slate-300">{drawerTask.deadline}</span>
              </div>
            </div>

            {/* ── Contextual CTAs (No Dead Ends) ── */}
            <div className="space-y-2">
              {/* Content actions */}
              {(drawerState === 'draft_submitted' || drawerState === 'revision_required') && (
                <>
                  <Button onClick={() => approveContent(drawerTask.id)} className="w-full justify-center">
                    <Check className="w-4 h-4 mr-2" />Duyệt bài — Cho đăng
                  </Button>
                  <Button variant="secondary" onClick={() => rejectContent(drawerTask.id, '')} className="w-full justify-center">
                    <XCircle className="w-4 h-4 mr-2" />Từ chối — Gửi feedback
                  </Button>
                </>
              )}
              {/* Metrics actions */}
              {(drawerState === 'published' || drawerState === 'tracking' || drawerState === 'metrics_submitted') && (
                <>
                  <Button onClick={() => approveMetrics(drawerTask.id)} className="w-full justify-center">
                    <Check className="w-4 h-4 mr-2" />Duyệt số liệu
                  </Button>
                  <Button variant="secondary" className="w-full justify-center">
                    <MessageSquare className="w-4 h-4 mr-2" />Yêu cầu cập nhật metrics
                  </Button>
                </>
              )}
              {/* Payment actions */}
              {(drawerState === 'metrics_approved' || drawerState === 'payment_pending') && (
                <>
                  <Button onClick={() => setPaymentDecision({ taskId: drawerTask.id, action: 'full' })} className="w-full justify-center">
                    <CreditCard className="w-4 h-4 mr-2" />Thanh toán toàn bộ
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => setPaymentDecision({ taskId: drawerTask.id, action: 'partial' })} className="justify-center">
                      Trả một phần
                    </Button>
                    <Button variant="danger" onClick={() => setPaymentDecision({ taskId: drawerTask.id, action: 'hold' })} className="justify-center">
                      <Clock className="w-4 h-4 mr-1" />Giữ tạm
                    </Button>
                  </div>
                </>
              )}
              {/* Done states */}
              {(drawerState === 'paid' || drawerState === 'completed') && (
                <div className="text-center py-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
                  Nhiệm vụ đã hoàn thành
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {drawerTask && (
        <div className="fixed inset-0 bg-black/10 z-40" onClick={() => setDrawerTask(null)} />
      )}

      {/* Payment decision modal */}
      <Modal isOpen={!!paymentDecision} onClose={() => setPaymentDecision(null)} title="Xác nhận thanh toán" width="max-w-md">
        {paymentDecision && (
          <div className="space-y-4">
            {paymentDecision.action === 'partial' && (
              <div>
                <label className="block text-sm font-medium mb-1">Số tiền thanh toán (VND)</label>
                <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="VD: 2500000"
                  onChange={e => setPaymentDecision(p => p ? { ...p, amount: Number(e.target.value) } : null)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">
                Ghi chú {paymentDecision.action === 'hold' ? '*' : '(tùy chọn)'}
              </label>
              <textarea rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="Ghi chú thanh toán..."
                onChange={e => setPaymentDecision(p => p ? { ...p, reason: e.target.value } : null)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPaymentDecision(null)}>Hủy</Button>
              <Button variant={paymentDecision.action === 'hold' ? 'danger' : 'primary'} onClick={confirmPayment}>
                {paymentDecision.action === 'full' ? 'Duyệt toàn bộ' : paymentDecision.action === 'partial' ? 'Thanh toán một phần' : 'Giữ tạm'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TASK CREATION FORM
// ═══════════════════════════════════════════════════════════════════════

function TaskCreationForm({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const [form, setForm] = useState({
    kolId: '', contentType: 'Video ngắn (TikTok/Reels)', requirement: '',
    draftDeadline: '', publishDeadline: '', reward: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.kolId) e.kolId = 'Chọn KOL/KOC';
    if (!form.contentType) e.contentType = 'Chọn loại nội dung';
    if (!form.requirement.trim()) e.requirement = 'Yêu cầu không được để trống';
    if (!form.draftDeadline) e.draftDeadline = 'Hạn nộp bản nháp không được để trống';
    if (!form.publishDeadline) e.publishDeadline = 'Hạn đăng bài không được để trống';
    if (!form.reward || Number(form.reward) <= 0) e.reward = 'Thù lao phải > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const brandKOLs = kols.filter(k => k.brandId === currentBrandId);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-300">
        Tạo nhiệm vụ cho KOL/KOC tham gia chiến dịch <strong>{campaign.name}</strong>.
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">KOL/KOC *</label>
        <select value={form.kolId} onChange={e => set('kolId', e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.kolId ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            }`}>
          <option value="">-- Chọn KOL/KOC --</option>
          {brandKOLs.map(k => <option key={k.id} value={k.id}>{k.name} (@{k.handle}) — {k.platform}</option>)}
        </select>
        {errors.kolId && <p className="text-xs text-red-500 mt-1">{errors.kolId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Loại nội dung *</label>
        <select value={form.contentType} onChange={e => set('contentType', e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.contentType ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            }`}>
          <option>Video ngắn (TikTok/Reels)</option>
          <option>Video dài (YouTube)</option>
          <option>Post ảnh</option>
          <option>Story</option>
          <option>Livestream</option>
          <option>Blog/Review dài</option>
        </select>
        {errors.contentType && <p className="text-xs text-red-500 mt-1">{errors.contentType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Yêu cầu chi tiết *</label>
        <textarea rows={4} value={form.requirement} onChange={e => set('requirement', e.target.value)}
          placeholder="VD: Video review sản phẩm Glow Serum 30–60s, nhấn mạnh công dụng cấp ẩm, có CTA 'Mua ngay' ở cuối video..."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.requirement ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            }`} />
        {errors.requirement && <p className="text-xs text-red-500 mt-1">{errors.requirement}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Hạn nộp bản nháp *</label>
          <input type="date" value={form.draftDeadline} onChange={e => set('draftDeadline', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.draftDeadline ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
              }`} />
          {errors.draftDeadline && <p className="text-xs text-red-500 mt-1">{errors.draftDeadline}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Hạn đăng bài *</label>
          <input type="date" value={form.publishDeadline} onChange={e => set('publishDeadline', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.publishDeadline ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
              }`} />
          {errors.publishDeadline && <p className="text-xs text-red-500 mt-1">{errors.publishDeadline}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Thù lao (VND) *</label>
        <input type="number" value={form.reward} onChange={e => set('reward', e.target.value)} placeholder="VD: 5000000"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.reward ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            }`} />
        {errors.reward && <p className="text-xs text-red-500 mt-1">{errors.reward}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Hủy</Button>
        <button

          onClick={() => {

            setSelectedCampaign(campaign);

            setShowTaskModal(true);

          }}

        >
          Nhiệm vụ
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// KOL ACCOUNT MANAGEMENT PANEL
// ═══════════════════════════════════════════════════════════════════════

function KOLAccountManagementPanel({ selectedProject }: { selectedProject: string }) {
  const { brandKOLs } = useBrandData(selectedProject);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = brandKOLs.filter(k =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = brandKOLs.filter(k => k.status === 'active').length;

  return (
    <>
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng KOL/KOC', value: brandKOLs.length, icon: <Users className="w-4 h-4" /> },
          { label: 'Đang hoạt động', value: activeCount, icon: <CheckCircle2 className="w-4 h-4" /> },
          { label: 'Tổng Followers', value: brandKOLs.reduce((s, k) => s + (k.followers || 0), 0) >= 1000000 ? `${(brandKOLs.reduce((s, k) => s + (k.followers || 0), 0) / 1000000).toFixed(1)}M` : `${Math.round(brandKOLs.reduce((s, k) => s + (k.followers || 0), 0) / 1000)}K`, icon: <Eye className="w-4 h-4" /> },
          { label: 'Avg ER', value: `${(brandKOLs.reduce((s, k) => s + (k.engagementRate || 0), 0) / Math.max(brandKOLs.length, 1)).toFixed(1)}%`, icon: <TrendingUp className="w-4 h-4" /> },
        ].map(item => (
          <div key={item.label} className={`bg-gradient-to-br ${(item as { accent?: string }).accent || 'from-slate-100/60 to-slate-200/40 dark:from-slate-800 dark:to-slate-700'} rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Header + Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm kiếm tên hoặc handle..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none" />
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />Tạo tài khoản KOL/KOC</Button>
      </div>

      {/* KOL Account List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100/60">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nền tảng</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vai trò</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Followers</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">ER</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(kol => (
                <tr key={kol.id} className="border-b border-slate-100/60 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={kol.avatar} size="sm" image={getKolImage(kol.avatar)} />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{kol.name}</p>
                        <p className="text-xs text-slate-500">@{kol.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 dark:text-slate-300">{kol.platform}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                      {String(kol.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{kol.followersDisplay}</td>
                  <td className="px-6 py-4 text-sm font-medium text-brand-500 dark:text-brand-400">{kol.engagementRate}%</td>
                  <td className="px-6 py-4">
                    <Badge label={kol.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'} colorClass={
                      kol.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300'
                    } />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Edit3 className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(kol.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              {searchTerm ? 'Không tìm thấy KOL/KOC nào.' : 'Chưa có tài khoản KOL/KOC nào.'}
            </div>
          )}
        </div>
      </div>

      {/* Create KOL Account Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo tài khoản KOL/KOC" width="max-w-lg">
        <KOLAccountForm onClose={() => setShowCreateModal(false)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Xóa tài khoản KOL/KOC" width="max-w-sm">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300">
            Hành động này không thể hoàn tác. Tài khoản sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="danger" onClick={() => setDeleteTarget(null)}><Trash2 className="w-4 h-4 mr-2" />Xóa tài khoản</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// KOL ACCOUNT FORM
// ═══════════════════════════════════════════════════════════════════════

function KOLAccountForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'KOC', platform: 'TikTok', handle: '', socialLink: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Tên không được để trống';
    if (!form.email.trim()) e.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password || form.password.length < 6) e.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!form.role) e.role = 'Chọn vai trò';
    if (!form.platform) e.platform = 'Chọn nền tảng';
    if (!form.handle.trim()) e.handle = 'Handle không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 text-sm text-blue-700 dark:text-blue-300">
        Điền thông tin để tạo tài khoản và cấp quyền truy cập cho KOL/KOC.
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Tên KOL/KOC *</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="VD: Nguyễn Thu Hà"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.name ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
              }`} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Vai trò *</label>
          <select value={form.role} onChange={e => set('role', e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.role ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
              }`}>
            <option value="KOC">KOC (Key Opinion Consumer)</option>
            <option value="KOL">KOL (Key Opinion Leader)</option>
            <option value="Celebrity">Celebrity</option>
          </select>
          {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Email *</label>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="VD: thuha.kol@gmail.com"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.email ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            }`} />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Mật khẩu *</label>
        <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Nhập mật khẩu tạm thời..."
          className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.password ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            }`} />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Nền tảng *</label>
          <select value={form.platform} onChange={e => set('platform', e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.platform ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
              }`}>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
          </select>
          {errors.platform && <p className="text-xs text-red-500 mt-1">{errors.platform}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Handle *</label>
          <input type="text" value={form.handle} onChange={e => set('handle', e.target.value)} placeholder="VD: @thuha.beauty"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${errors.handle ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
              }`} />
          {errors.handle && <p className="text-xs text-red-500 mt-1">{errors.handle}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Link mạng xã hội</label>
        <input type="url" value={form.socialLink} onChange={e => set('socialLink', e.target.value)} placeholder="VD: https://tiktok.com/@thuha.beauty"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Hủy</Button>
        <Button onClick={() => { if (validate()) onClose(); }}><Check className="w-4 h-4 mr-2" />Cấp tài khoản</Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WORKFLOW SUB-PANELS
// ═══════════════════════════════════════════════════════════════════════

function ContentReviewPanel({ selectedProject, selectedTaskId, setSelectedTaskId, feedback, setFeedback, getTaskState, setTaskState }: {
  selectedProject: string; selectedTaskId: string | null; setSelectedTaskId: (id: string | null) => void;
  feedback: string; setFeedback: (f: string) => void;
  getTaskState: (id: string) => TaskStatus; setTaskState: (id: string, s: TaskStatus, fb?: string) => void;
}) {
  const { brandTasks, brandCampaigns } = useBrandData(selectedProject);
  const reviewTasks = brandTasks.filter(t => ['draft_submitted', 'revision_required'].includes(getTaskState(t.id)));
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : reviewTasks[0] ?? null;
  const latestDraft = selectedTask?.draftContent?.[(selectedTask.draftContent?.length || 1) - 1];
  const state = selectedTask ? getTaskState(selectedTask.id) : undefined;
  const [rejectModalTask, setRejectModalTask] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const handleApprove = (taskId: string) => {
    setTaskState(taskId, 'approved_to_publish');
    setFeedback('');
  };

  const handleReject = () => {
    if (!rejectModalTask) return;
    setTaskState(rejectModalTask, 'revision_required', rejectComment || feedback);
    setRejectModalTask(null);
    setRejectComment('');
    setFeedback('');
  };

  const submittedCampaign = selectedTask ? brandCampaigns.find(c => c.id === selectedTask.campaignId) : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIWidget label="Chờ duyệt" value={reviewTasks.filter(t => getTaskState(t.id) === 'draft_submitted').length.toString()} icon={<MessageSquare className="w-5 h-5" />} />
        <KPIWidget label="Cần chỉnh sửa" value={reviewTasks.filter(t => getTaskState(t.id) === 'revision_required').length.toString()} icon={<XCircle className="w-5 h-5" />} />
        <KPIWidget label="Đã duyệt" value={(brandTasks.filter(t => getTaskState(t.id) === 'approved_to_publish').length).toString()} icon={<CheckCircle2 className="w-5 h-5" />} />
        <KPIWidget label="Đã đăng bài" value={brandTasks.filter(t => getTaskState(t.id) === 'published').length.toString()} icon={<Play className="w-5 h-5" />} />
      </div>

      {reviewTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-dashed border border-slate-200/60 dark:border-slate-700 p-10 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300 dark:text-slate-300">Không có nội dung cần duyệt</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left: Draft List */}
          <div className="xl:col-span-1 space-y-3">
            {reviewTasks.map(task => {
              const draft = task.draftContent?.[task.draftContent.length - 1];
              const s = getTaskState(task.id);
              return (
                <motion.button key={task.id} layout onClick={() => { setSelectedTaskId(task.id); setFeedback(('feedback' in (draft || {})) ? (draft as { feedback?: string }).feedback || '' : ''); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedTask?.id === task.id ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-900/20' : 'border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar initials={task.kolAvatar} size="sm" image={getKolImage(task.kolAvatar)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{task.kolName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{task.campaignName}</p>
                    </div>
                    <Badge label={taskStatusLabels[s]} colorClass={taskStatusColors[s]} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="rounded-xl bg-slate-50/50 dark:bg-slate-700/40 px-2 py-1.5 text-center">
                      <p className="uppercase tracking-wide text-[9px] mb-0.5">Phiên bản</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">v{draft?.version || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50/50 dark:bg-slate-700/40 px-2 py-1.5 text-center">
                      <p className="uppercase tracking-wide text-[9px] mb-0.5">Trạng thái</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{s === 'revision_required' ? 'Có góp ý' : 'Mới nộp'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50/50 dark:bg-slate-700/40 px-2 py-1.5 text-center">
                      <p className="uppercase tracking-wide text-[9px] mb-0.5">Thời gian</p>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{draft?.submittedAt?.split(' ')[0] || '-'}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Draft Detail */}
          <div className="xl:col-span-2">
            {selectedTask && state ? (
              <div className="card-base p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedTask.campaignName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedTask.kolName} • {selectedTask.kolPlatform} • {latestDraft ? `Bản nháp v${latestDraft.version}` : 'Chưa có bản nháp'}</p>
                  </div>
                  <Badge label={taskStatusLabels[state]} colorClass={taskStatusColors[state]} />
                </div>

                {/* Campaign + Product Info Side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submittedCampaign ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Thông tin Campaign</h4>
                      <div className="p-3 surface-subtle space-y-1.5">
                        <div className="flex justify-between"><span className="text-xs text-slate-500">Campaign</span><span className="text-xs font-medium text-slate-900 dark:text-white">{submittedCampaign.name}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500">Product</span><span className="text-xs font-medium text-slate-900 dark:text-white">{selectedTask.productName}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500">Brief</span><span className="text-xs text-slate-300 dark:text-slate-300 text-right line-clamp-2">{selectedTask.brief}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Thông tin Campaign</h4>
                      <div className="p-3 surface-subtle">
                        <p className="text-xs text-slate-500">{selectedTask.productName}</p>
                        <p className="text-xs text-slate-300 dark:text-slate-300 mt-1">{selectedTask.brief}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Yêu cầu nội dung</h4>
                    <div className="p-3 surface-subtle space-y-1.5">
                      <div className="flex justify-between"><span className="text-xs text-slate-500">Content Type</span><span className="text-xs font-medium text-slate-900 dark:text-white">{selectedTask.contentRequirements ? 'Video ngắn' : '-'}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-slate-500">Draft Deadline</span><span className="text-xs font-medium text-slate-900 dark:text-white">{selectedTask.deadline}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-slate-500">Publish Deadline</span><span className="text-xs font-medium text-slate-900 dark:text-white">{selectedTask.deadline}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-slate-500">KPI Views</span><span className="text-xs font-medium text-slate-900 dark:text-white">{selectedTask.kpiTarget.views.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-slate-500">KPI ER</span><span className="text-xs font-medium text-slate-900 dark:text-white">{selectedTask.kpiTarget.engagementRate}%</span></div>
                    </div>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center px-4">
                    <Play className="w-12 h-12 text-white/60 mx-auto mb-2" />
                    <p className="text-sm text-white/70">Xem trước video duyệt nội dung</p>
                    <p className="text-xs text-white/40 mt-1 break-all">{latestDraft?.contentUrl || 'draft.mp4'}</p>
                  </div>
                </div>

                {/* Caption */}
                {latestDraft?.caption && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Caption</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 p-3 surface-subtle">{latestDraft.caption}</p>
                  </div>
                )}

                {/* Version History Timeline */}
                {selectedTask.draftContent && selectedTask.draftContent.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Lịch sử các phiên bản</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[...selectedTask.draftContent].reverse().map((draft, idx) => {
                        const isCurrent = idx === 0;
                        return (
                          <div key={draft.submittedAt} className={`flex items-start gap-3 p-3 rounded-xl ${isCurrent ? 'bg-brand-50 dark:bg-brand-900/20 border border-teal-200 dark:border-brand-800/40' : 'bg-slate-50/50 dark:bg-slate-700/30'
                            }`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${isCurrent ? 'bg-brand-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                              }`}>
                              v{draft.version}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs font-medium text-slate-900 dark:text-white">
                                  {isCurrent ? 'Phiên bản hiện tại' : `Phiên bản trước`}
                                </p>
                                <p className="text-[10px] text-slate-400">{draft.submittedAt}</p>
                              </div>
                              {('feedback' in draft) && draft.feedback && (
                                <div className="mt-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-800/30">
                                  <p className="text-[11px] text-red-600 dark:text-red-400 flex items-start gap-1.5">
                                    <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>Feedback Brand: {(draft as { feedback: string }).feedback}</span>
                                  </p>
                                </div>
                              )}
                              {(!('feedback' in draft) || !(draft as { feedback?: string }).feedback) && !isCurrent && (
                                <p className="text-[11px] text-slate-400 italic">Không có feedback</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Feedback</h4>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Nhập comment/feedback cho video..."
                  />
                </div>

                {/* Actions */}
                {['draft_submitted', 'revision_required'].includes(state) ? (
                  <div className="space-y-2">
                    <div className="flex gap-3 pt-1">
                      <Button className="flex-1 !bg-emerald-600 hover:!bg-emerald-700" onClick={() => handleApprove(selectedTask.id)}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />Phê duyệt
                      </Button>
                      <Button variant="danger" className="flex-1" onClick={() => setRejectModalTask(selectedTask.id)}>
                        <XCircle className="w-4 h-4 mr-2" />Từ chối
                      </Button>
                    </div>
                    {state === 'draft_submitted' && (
                      <p className="text-xs text-slate-400 text-center">Phê duyệt → KOL được phép đăng bài • Từ chối → KOL chỉnh sửa và submit lại</p>
                    )}
                    {state === 'revision_required' && (
                      <p className="text-xs text-amber-500 text-center">KOL đã nhận feedback và đang chỉnh sửa nội dung</p>
                    )}
                  </div>
                ) : state === 'approved_to_publish' ? (
                  <div className="flex items-center gap-2 p-4 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">Đã phê duyệt — KOL có thể đăng bài ngay.</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-12 text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-300 dark:text-slate-300">Chọn một bản nháp để xem chi tiết</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModalTask} onClose={() => { setRejectModalTask(null); setRejectComment(''); }} title="Từ chối bản nháp" width="max-w-lg">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800/40">
            <p className="text-sm text-red-700 dark:text-red-300">Nếu từ chối, KOL sẽ nhận được feedback và phải chỉnh sửa rồi submit lại bản nháp mới.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">Nhập feedback cho KOL/KOC *</label>
            <textarea
              rows={4}
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
              placeholder="Ví dụ: Cần cắt ngắn phần intro, thêm logo ở đầu video, chỉnh màu sắc rõ hơn..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setRejectModalTask(null); setRejectComment(''); }}>Hủy</Button>
            <Button variant="danger" onClick={handleReject}><XCircle className="w-4 h-4 mr-2" />Xác nhận từ chối & gửi feedback</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function MetricsReviewPanel({ selectedProject, getTaskState, setMetricsConfirmed, localTasks, setTaskState }: {
  selectedProject: string; getTaskState: (id: string) => TaskStatus;
  setMetricsConfirmed: (id: string, confirmed: boolean) => void; localTasks: Record<string, TaskState>;
  setTaskState: (id: string, s: TaskStatus, fb?: string) => void;
}) {
  const { brandTasks } = useBrandData(selectedProject);
  const metricsTasks = brandTasks.filter(t => t.metrics || ['metrics_submitted', 'metrics_approved'].includes(getTaskState(t.id)));

  const handleRequestUpdate = (taskId: string) => {
    setTaskState(taskId, 'revision_required', 'Brand yêu cầu cập nhật số liệu metrics.');
  };

  return (
    <div className="space-y-4">
      {/* ── Header bar: context only, NO KPI cards ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 rounded border border-cyan-200 dark:border-cyan-800/40">
        <BarChart3 className="w-5 h-5 text-cyan-600 flex-shrink-0" />
        <p className="text-sm text-cyan-800 dark:text-cyan-200">
          Theo dõi hiệu suất: kiểm tra link bài đăng, xác minh số liệu KOL nhập với KPI mục tiêu, xác nhận hoặc yêu cầu cập nhật.
        </p>
      </div>

      {/* ── Task list with horizontal step indicator ── */}
      <div className="space-y-3">
        {metricsTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-dashed border border-slate-200/60 dark:border-slate-700 p-12 text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-500">Chưa có nhiệm vụ nào được đăng bài.</p>
          </div>
        ) : metricsTasks.map(task => {
          const m = task.metrics;
          const confirmed = localTasks[task.id]?.metricsConfirmed || m?.brandConfirmed;
          const viewsOk = m ? m.views >= task.kpiTarget.views : false;
          const erOk = m ? m.engagementRate >= task.kpiTarget.engagementRate : false;
          const allOk = viewsOk && erOk;

          return (
            <div key={task.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
              {/* ── Task header ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Avatar initials={task.kolAvatar} size="md" image={getKolImage(task.kolAvatar)} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{task.kolName}</p>
                    <p className="text-xs text-slate-500">{task.campaignName} · {task.kolPlatform}</p>
                  </div>
                </div>
                <Badge
                  label={confirmed ? 'Đã xác nhận' : 'Chờ duyệt'}
                  colorClass={confirmed ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}
                />
              </div>

              {/* ── Step indicator: 3 horizontal steps ── */}
              <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-0">
                  {[
                    { num: 1, label: 'Link bài đăng', done: !!task.publishedContent?.postUrl, active: !!task.publishedContent?.postUrl && !m },
                    { num: 2, label: 'Số liệu KOL', done: !!m, active: !!m && !confirmed },
                    { num: 3, label: 'Xác nhận', done: confirmed, active: !!m && !confirmed },
                  ].map((step, idx) => (
                    <div key={step.num} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step.done
                          ? 'bg-gray-500 text-white'
                          : step.active
                            ? 'bg-brand-500 text-white ring-4 ring-brand-200 dark:ring-brand-800/40'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-400'
                          }`}>
                          {step.done ? <Check className="w-4 h-4" /> : step.num}
                        </div>
                        <p className={`text-[11px] mt-1.5 font-medium text-center ${step.done ? 'text-emerald-600 dark:text-emerald-400' : step.active ? 'text-brand-500 dark:text-brand-400' : 'text-slate-400'
                          }`}>{step.label}</p>
                      </div>
                      {idx < 2 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 rounded ${step.done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-600'
                          }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Step 1: Link bài đăng ── */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100/60 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 mt-0.5">1</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1.5">Link bài đăng & Screenshot</p>
                    {task.publishedContent?.postUrl ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a href={task.publishedContent.postUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-teal-700 underline truncate">
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{task.publishedContent.postUrl}</span>
                        </a>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">{task.publishedContent.publishedAt}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có link bài đăng.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Step 2: Số liệu ── */}
              {m && (
                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100/60 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 mt-0.5">2</span>
                    <div className="flex-1 min-w-0 space-y-3">
                      <p className="text-xs font-semibold text-slate-300 dark:text-slate-300 mb-1.5">Số liệu KOL nhập vs KPI mục tiêu</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Views', actual: m.views.toLocaleString(), target: task.kpiTarget.views.toLocaleString(), pct: Math.min(100, Math.round((m.views / task.kpiTarget.views) * 100)), ok: viewsOk },
                          { label: 'ER', actual: `${m.engagementRate}%`, target: `${task.kpiTarget.engagementRate}%`, pct: Math.min(100, Math.round((m.engagementRate / task.kpiTarget.engagementRate) * 100)), ok: erOk },
                          { label: 'Likes', actual: (m.likes || 0).toLocaleString(), target: '—', pct: null, ok: null },
                        ].map(item => (
                          <div key={item.label} className="text-center p-2 bg-slate-50/50 dark:bg-slate-700/40 rounded-xl">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.actual}</p>
                            <p className="text-[10px] text-slate-500">{item.label}{item.target !== '—' ? ` / ${item.target}` : ''}</p>
                            {item.pct !== null && (
                              <div className="mt-1.5 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${item.pct}%` }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${allOk ? 'bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50/80 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        }`}>
                        {allOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {allOk ? 'Đạt KPI — sẵn sàng xác nhận' : 'Chưa đạt KPI — xem lại trước khi xác nhận'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Xác nhận ── */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100/60 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 mt-0.5">3</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-300 dark:text-slate-300 mb-2">Xác nhận hoặc yêu cầu cập nhật</p>
                    <div className="flex gap-2 flex-wrap">
                      {!confirmed && m ? (
                        <>
                          <Button size="sm" onClick={() => setMetricsConfirmed(task.id, true)}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Xác nhận số liệu
                          </Button>
                          <Button size="sm" variant="ghost" className="text-orange-500" onClick={() => handleRequestUpdate(task.id)}>
                            <XCircle className="w-3.5 h-3.5 mr-1" />Yêu cầu cập nhật
                          </Button>
                        </>
                      ) : confirmed ? (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />Số liệu đã được xác nhận
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chờ KOL nhập số liệu.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PayoutPanel({ selectedProject, paymentAction, setPaymentAction }: {
  selectedProject: string;
  paymentAction: { paymentId: string; action: 'approve' | 'partial' | 'hold' | 'reject' } | null;
  setPaymentAction: (a: typeof paymentAction) => void;
}) {
  const { brandPayments } = useBrandData(selectedProject);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const getStatus = (p: typeof brandPayments[0]) => localStatuses[p.id] || p.status;
  const processedPayments = brandPayments.map(p => ({ ...p, _status: getStatus(p) as typeof p.status }));
  const paidTotal = processedPayments.filter(p => p._status === 'paid').reduce((s, p) => s + p.paidAmount, 0);
  const pendingTotal = processedPayments.reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);
  const [qrModalPayment, setQrModalPayment] = useState<typeof brandPayments[0] | null>(null);

  const qrPayment = () => {
    if (!qrModalPayment) return;
    setLocalStatuses(prev => ({ ...prev, [qrModalPayment.id]: 'paid' }));
    setQrModalPayment(null);
  };

  return (
    <div className="space-y-4">
      {/* ── Header bar: financial context ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
        <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Quản lý thanh toán: kiểm tra KPI đã đạt chưa, quyết định thanh toán đầy đủ, một phần hoặc giữ tạm.
        </p>
      </div>

      {/* ── Financial Summary: big money numbers ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Cần thanh toán</span>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{(pendingTotal / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-500 mt-0.5">VND</p>
        </div>
        <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Đã thanh toán</span>
            <CheckCircle2 className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{(paidTotal / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-gray-500 mt-0.5">VND</p>
        </div>
        <div className="col-span-1 bg-gray-50 dark:bg-gray-800 rounded p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Tổng chiến dịch</span>
            <CreditCard className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{brandPayments.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">KOL/KOC</p>
        </div>
      </div>

      {/* ── Pending payments: actionable cards, NOT a table ── */}
      {(() => {
        const pending = processedPayments.filter(p => p._status !== 'paid');
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Cần xử lý thanh toán</h3>
              <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Tất cả thanh toán đã được xử lý.</p>
              </div>
            ) : (
              pending.map(payment => {
                const task = tasks.find(t => t.id === payment.taskId);
                const m = task?.metrics;
                const viewsOk = m ? m.views >= (task?.kpiTarget?.views || 0) : null;
                const erOk = m ? m.engagementRate >= (task?.kpiTarget?.engagementRate || 0) : null;
                const remaining = payment.totalAmount - payment.paidAmount;
                return (
                  <div key={payment.id} className="bg-white dark:bg-gray-800 rounded border border-amber-200 dark:border-amber-800/40 p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: KOL + campaign info */}
                      <div className="flex items-start gap-4">
                        <Avatar initials={payment.kolAvatar} size="lg" image={getKolImage(payment.kolAvatar)} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{payment.kolName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{payment.campaignName} · {payment.kolPlatform}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{remaining.toLocaleString()} VND</span>
                            <span className="text-xs text-slate-400">cần trả</span>
                          </div>
                          {/* KPI check */}
                          {m && viewsOk !== null ? (
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${viewsOk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                Views {viewsOk ? '✓' : '✗'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${erOk ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                                ER {erOk ? '✓' : '✗'}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      {/* Right: Action buttons */}
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setPaymentAction({ paymentId: payment.id, action: 'approve' })}>
                            <DollarSign className="w-3 h-3 mr-1" />Duyệt
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setQrModalPayment(payment)}>
                            QR
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setPaymentAction({ paymentId: payment.id, action: 'partial' })} className="!text-xs !px-2 !py-1 text-blue-600">
                            Một phần
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setPaymentAction({ paymentId: payment.id, action: 'hold' })} className="!text-xs !px-2 !py-1 text-gray-500">
                            Giữ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })()}

      {/* ── Payment History Timeline ── */}
      {brandPayments.filter(p => p.status === 'paid').length > 0 && (
        <div className="bg-gray-900 rounded border border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-brand-500/20 rounded-xl">
              <History className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Lịch sử thanh toán</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brandPayments
              .filter(p => p.status === 'paid')
              .sort((a, b) => new Date(b.paidDate || 0).getTime() - new Date(a.paidDate || 0).getTime())
              .map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.kolName}</p>
                      <p className="text-[11px] text-gray-400">{p.kolPlatform} · {p.campaignName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{p.paidAmount.toLocaleString()} VND</p>
                    <p className="text-[10px] text-gray-500">{p.paidDate ? new Date(p.paidDate).toLocaleDateString('vi-VN') : '-'}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAYMENTS VIEW
// ═══════════════════════════════════════════════════════════════════════

function PaymentsView({ selectedProject }: { selectedProject: string }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [paymentAction, setPaymentAction] = useState<{ paymentId: string; action: 'approve' | 'partial' | 'hold' | 'reject' } | null>(null);
  const { brandPayments } = useBrandData(selectedProject);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const getStatus = (p: typeof brandPayments[0]) => localStatuses[p.id] || p.status;
  const processedPayments = brandPayments.map(p => ({ ...p, _status: getStatus(p) as typeof p.status }));
  const filtered = filterStatus === 'all' ? processedPayments : processedPayments.filter(p => p._status === filterStatus);
  const [qrModalPayment, setQrModalPayment] = useState<typeof brandPayments[0] | null>(null);

  const qrPayment = () => {
    if (!qrModalPayment) return;
    setLocalStatuses(prev => ({ ...prev, [qrModalPayment.id]: 'paid' }));
    setQrModalPayment(null);
  };

  const handleApprove = () => {
    if (!paymentAction) return;
    setLocalStatuses(prev => ({ ...prev, [paymentAction.paymentId]: paymentAction.action === 'hold' ? 'hold' : 'paid' }));
    setPaymentAction(null);
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Quản lý thanh toán" subtitle="Xem, phê duyệt và xử lý thanh toán cho KOL/KOC" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIWidget label="Tổng cần thanh toán" value={(processedPayments.reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0) / 1000000).toFixed(1) + 'M VND'} icon={<DollarSign className="w-5 h-5" />} />
        <KPIWidget label="Đã thanh toán" value={(processedPayments.filter(p => p._status === 'paid').reduce((s, p) => s + p.paidAmount, 0) / 1000000).toFixed(1) + 'M VND'} icon={<CheckCircle2 className="w-5 h-5" />} accent="from-emerald-500/10 to-emerald-600/5" />
        <KPIWidget label="Đang chờ" value={processedPayments.filter(p => p._status === 'pending').length.toString()} icon={<Clock className="w-5 h-5" />} accent="from-amber-500/10 to-amber-600/5" />
        <KPIWidget label="Thanh toán một phần" value={processedPayments.filter(p => p._status === 'partial_paid').length.toString()} icon={<CreditCard className="w-5 h-5" />} accent="from-blue-500/10 to-blue-600/5" />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Đang chờ</option>
          <option value="paid">Đã thanh toán</option>
          <option value="partial_paid">Thanh toán một phần</option>
          <option value="hold">Tạm giữ</option>
        </select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Dùng bảng này để xử lý hóa đơn sau khi metrics đã được xác nhận.</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100/60">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">KOL/KOC</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Chiến dịch</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nhiệm vụ</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Tổng tiền</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Đã trả</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(payment => (
                <tr key={payment.id} className="border-b border-slate-100/60 hover:bg-slate-50/50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar initials={payment.kolAvatar} size="sm" image={getKolImage(payment.kolAvatar)} /><div><p className="text-sm font-medium text-slate-900 dark:text-white">{payment.kolName}</p><p className="text-xs text-slate-500">{payment.kolPlatform}</p></div></div></td>
                  <td className="px-6 py-4 text-sm text-slate-300 dark:text-slate-300">{payment.campaignName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{payment.taskId ? `Task #${payment.taskId.replace('t', '')}` : '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{payment.totalAmount.toLocaleString()} VND</td>
                  <td className="px-6 py-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{payment.paidAmount.toLocaleString()} VND</td>
                  <td className="px-6 py-4"><Badge label={paymentStatusLabels[payment._status]} colorClass={
                    payment._status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      payment._status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        payment._status === 'partial_paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                          payment._status === 'hold' ? 'bg-slate-100/60 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                            'bg-slate-100/60 text-slate-300 dark:bg-slate-700 dark:text-slate-300'
                  } /></td>
                  <td className="px-6 py-4">
                    {payment._status !== 'paid' ? (
                      <div className="flex gap-1 flex-wrap">
                        <Button size="sm" variant="secondary" onClick={() => setQrModalPayment(payment)} className="!px-2 !py-1 !text-xs"><CreditCard className="w-3 h-3 mr-1" />QR</Button>
                        <Button size="sm" variant="secondary" onClick={() => setPaymentAction({ paymentId: payment.id, action: 'approve' })} className="!text-xs">Duyệt</Button>
                        <Button size="sm" variant="secondary" onClick={() => setPaymentAction({ paymentId: payment.id, action: 'partial' })} className="!text-xs">Một phần</Button>
                        <Button size="sm" variant="ghost" onClick={() => setPaymentAction({ paymentId: payment.id, action: 'hold' })} className="!text-xs">Giữ</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium">✓ Đã thanh toán</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Payment Demo Modal */}
      <Modal isOpen={!!qrModalPayment} onClose={() => setQrModalPayment(null)} title="QR Thanh toán" width="max-w-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-700/40 rounded-xl">
            <Avatar initials={qrModalPayment?.kolAvatar} size="md" image={getKolImage(qrModalPayment?.kolAvatar || '')} />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{qrModalPayment?.kolName}</p>
              <p className="text-xs text-slate-500">{qrModalPayment?.kolPlatform}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="p-3 bg-white rounded-2xl border-4 border-slate-900 dark:border-white shadow-lg">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <rect width="180" height="180" fill="white" />
                <rect x="10" y="10" width="40" height="40" fill="black" />
                <rect x="130" y="10" width="40" height="40" fill="black" />
                <rect x="10" y="130" width="40" height="40" fill="black" />
                <rect x="20" y="20" width="20" height="20" fill="white" />
                <rect x="140" y="20" width="20" height="20" fill="white" />
                <rect x="20" y="140" width="20" height="20" fill="white" />
                <rect x="30" y="30" width="20" height="20" fill="black" />
                <rect x="150" y="30" width="20" height="20" fill="black" />
                <rect x="30" y="150" width="20" height="20" fill="black" />
                {[0, 1, 2, 3, 4, 5, 6].flatMap(i =>
                  [0, 1, 2, 3, 4, 5, 6].map(j =>
                    (i + j) % 2 === 0 && i > 1 && i < 5 && j > 1 && j < 5 ? null :
                      (i >= 6 || j >= 6) ? null :
                        <rect key={`${i}-${j}`} x={60 + i * 10} y={60 + j * 10} width="10" height="10" fill={(i * 7 + j * 13) % 2 === 0 ? 'black' : 'white'} />
                  )
                )}
                {[0, 1, 2, 3, 4].flatMap(i =>
                  [0, 1, 2, 3, 4].map(j =>
                    <rect key={`r2-${i}-${j}`} x={60 + i * 10} y={60 + j * 10} width="10" height="10" fill={(i + j) % 3 === 0 ? 'black' : 'white'} />
                  )
                )}
                <rect x="60" y="60" width="50" height="50" fill="white" />
                {[[70, 70], [70, 80], [70, 90], [80, 70], [80, 80], [80, 90], [90, 70], [90, 80], [90, 90]].map(([rx, ry], idx) =>
                  <rect key={idx} x={rx} y={ry} width="10" height="10" fill="black" />
                )}
                <rect x="60" y="60" width="50" height="50" fill="none" stroke="black" strokeWidth="5" />
                <rect x="65" y="65" width="40" height="40" fill="black" />
                <rect x="70" y="70" width="30" height="30" fill="white" />
                <rect x="75" y="75" width="20" height="20" fill="black" />
              </svg>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-xs text-slate-500">Số tiền thanh toán</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{qrModalPayment?.totalAmount.toLocaleString()} VND</p>
            <p className="text-xs text-slate-500">{qrModalPayment?.invoiceNumber}</p>
          </div>
          <div className="p-3 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-700 dark:text-amber-300">
            ⚠️ Đây là QR thanh toán demo ảo. Không quét thực.
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setQrModalPayment(null)}>Đóng</Button>
            <Button className="flex-1" onClick={qrPayment}><CheckCircle2 className="w-4 h-4 mr-2" />Xác nhận thanh toán</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!paymentAction} onClose={() => setPaymentAction(null)} title={
        paymentAction?.action === 'approve' ? 'Duyệt thanh toán' :
          paymentAction?.action === 'partial' ? 'Thanh toán một phần' :
            paymentAction?.action === 'hold' ? 'Giữ tạm thanh toán' : 'Từ chối thanh toán'
      }>
        <div className="space-y-4">
          {paymentAction && (() => {
            const p = brandPayments.find(x => x.id === paymentAction.paymentId);
            const task = p ? tasks.find(t => t.id === p.taskId) : null;
            return (
              <>
                {p && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-700/40 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar initials={p.kolAvatar} size="sm" image={getKolImage(p.kolAvatar)} />
                      <div><p className="text-sm font-medium text-slate-900 dark:text-white">{p.kolName}</p><p className="text-xs text-slate-500">{p.campaignName}</p></div>
                    </div>
                    {task && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-white dark:bg-slate-600 rounded-lg"><p className="text-slate-500">KPI Views</p><p className="font-medium text-slate-900 dark:text-white">{task.kpiTarget.views.toLocaleString()}</p></div>
                        <div className="p-2 bg-white dark:bg-slate-600 rounded-lg"><p className="text-slate-500">KPI ER</p><p className="font-medium text-slate-900 dark:text-white">{task.kpiTarget.engagementRate}%</p></div>
                        <div className="p-2 bg-white dark:bg-slate-600 rounded-lg"><p className="text-slate-500">Metrics Approved</p><p className="font-medium text-brand-600">{task.metrics ? '✓ Đã xác nhận' : '—'}</p></div>
                        <div className="p-2 bg-white dark:bg-slate-600 rounded-lg"><p className="text-slate-500">Conversion</p><p className="font-medium text-slate-900 dark:text-white">{task.conversion ? `Đơn: ${task.conversion.orders}` : '—'}</p></div>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-700/40 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {paymentAction.action === 'approve' ? 'Xác nhận thanh toán đầy đủ?' :
                      paymentAction.action === 'partial' ? 'Nhập số tiền thanh toán một phần:' :
                        paymentAction.action === 'hold' ? 'Nhập lý do giữ tạm thanh toán:' :
                          'Từ chối thanh toán.'}
                  </p>
                </div>
                {paymentAction.action === 'partial' && (
                  <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Số tiền (VND)</label>
                    <input type="number" placeholder="VD: 5000000" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" />
                  </div>
                )}
                {paymentAction.action === 'hold' && (
                  <div><label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1">Lý do giữ tạm</label>
                    <textarea rows={2} placeholder="VD: Số liệu metrics chưa được xác nhận..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none" />
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setPaymentAction(null)}>Hủy</Button>
                  <Button onClick={handleApprove}>
                    {paymentAction.action === 'approve' ? 'Xác nhận thanh toán' :
                      paymentAction.action === 'partial' ? 'Thanh toán một phần' :
                        paymentAction.action === 'hold' ? 'Giữ tạm' : 'Từ chối'}
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// RANKINGS VIEW
// ═══════════════════════════════════════════════════════════════════════

function RankingsView({ selectedProject }: { selectedProject: string }) {
  const { brandKOLs, brandCampaigns } = useBrandData(selectedProject);
  const { campaigns, campaignRankings } = useBrandContext();
  const brandKOLRankings = kolRankings.filter(r => brandKOLs.some(k => k.id === r.kolId));
  const brandCampaignRankings = campaignRankings.filter(r => brandCampaigns.some(c => c.id === r.campaignId));

  const totalViews = brandCampaigns.reduce((s, c) => s + c.totalViews, 0);
  const totalEngagement = brandCampaigns.reduce((s, c) => s + Math.round(c.totalViews * (c.avgEngagementRate / 100)), 0);
  const engagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : '0.0';
  const totalConversions = brandCampaigns.reduce((s, c) => s + (c.totalConversions || 0), 0);
  const conversionRate = totalViews > 0 ? (totalConversions / totalViews * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* ── Header bar: ranking context ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 rounded border border-violet-200 dark:border-violet-800/40">
        <Award className="w-5 h-5 text-violet-600 flex-shrink-0" />
        <p className="text-sm text-violet-800 dark:text-violet-200">
          Báo cáo & Xếp hạng: tổng hợp hiệu suất toàn bộ chiến dịch và xếp hạng KOL/KOC dựa trên điểm số.
        </p>
      </div>

      {/* ── Aggregate Stats: horizontal bar strip ── */}
      <div className="bg-gray-900 rounded border border-gray-700 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-700">
          {[
            { label: 'Total Views', value: totalViews >= 1000000 ? `${(totalViews / 1000000).toFixed(1)}M` : `${Math.round(totalViews / 1000)}K`, color: 'text-violet-400' },
            { label: 'Engagement', value: totalEngagement >= 1000000 ? `${(totalEngagement / 1000000).toFixed(1)}M` : `${Math.round(totalEngagement / 1000)}K`, color: 'text-gray-400' },
            { label: 'ER', value: `${engagementRate}%`, color: 'text-amber-400' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, color: 'text-emerald-400' },
          ].map(item => (
            <div key={item.label} className="px-6 first:pl-0 text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── KOL Leaderboard ── */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Top KOL/KOC</h2>
        </div>
        {brandKOLRankings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-8 text-center">
            <p className="text-sm text-slate-500">Chưa có dữ liệu xếp hạng.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 podium */}
            {brandKOLRankings.slice(0, 3).map((r, i) => {
              const kol = kols.find(k => k.id === r.kolId);
              const podiumColors = ['from-amber-400 to-yellow-500', 'from-slate-400 to-slate-300', 'from-amber-600 to-orange-700'];
              return (
                <div key={r.kolId} className="flex items-center gap-4">
                  {/* Podium rank */}
                  <div className={`w-16 h-32 rounded bg-gray-400 dark:bg-gray-700 flex flex-col items-center justify-end pb-4 flex-shrink-0`}>
                    <span className="text-2xl font-black text-white/90 drop-shadow">{i + 1}</span>
                    <span className="text-[10px] font-bold text-white/70 uppercase">Top</span>
                  </div>
                  {/* KOL info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Avatar initials={kol?.avatar || 'K'} size="md" image={getKolImage(kol?.avatar || 'K')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{kol?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{kol?.platform} · {kol?.niche}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{r.score}</p>
                        <p className="text-[10px] text-slate-500">điểm</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-xs text-slate-500">{r.totalViews >= 1000000 ? `${(r.totalViews / 1000000).toFixed(1)}M` : `${Math.round(r.totalViews / 1000)}K`} views</span>
                      <span className="text-xs text-brand-500 dark:text-brand-400">ER {r.avgEngagementRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Rest of rankings: compact list */}
            {brandKOLRankings.length > 3 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden divide-y divide-slate-100/80">
                {brandKOLRankings.slice(3).map((r, i) => {
                  const kol = kols.find(k => k.id === r.kolId);
                  const rank = i + 4;
                  return (
                    <div key={r.kolId} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <div className="w-8 h-8 rounded-full bg-slate-100/60 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                        {rank}
                      </div>
                      <Avatar initials={kol?.avatar || 'K'} size="sm" image={getKolImage(kol?.avatar || 'K')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{kol?.name}</p>
                        <p className="text-xs text-slate-500">{kol?.platform}</p>
                      </div>
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <span className="text-xs text-slate-500">{r.totalViews >= 1000000 ? `${(r.totalViews / 1000000).toFixed(1)}M` : `${Math.round(r.totalViews / 1000)}K`}</span>
                        <span className="text-xs text-brand-500 dark:text-brand-400">{r.avgEngagementRate}%</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-right">{r.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Campaign Leaderboard ── */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Top Chiến dịch</h2>
        </div>
        {brandCampaignRankings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-8 text-center">
            <p className="text-sm text-slate-500">Chưa có dữ liệu xếp hạng chiến dịch.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {brandCampaignRankings.slice(0, 3).map((r, i) => {
              const campaign = campaigns.find(c => c.id === r.campaignId);
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={r.campaignId} className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft p-4">
                  {showTaskModal && (

                    <div className="
fixed inset-0
bg-black/40
flex
items-center
justify-center
z-50
">


                      <div className="
bg-white
rounded-2xl
p-6
w-[500px]
">


                        <h2 className="
text-xl
font-bold
mb-4
">
                          Giao nhiệm vụ cho KOL
                        </h2>


                        <select
                          id="kolSelect"
                          className="
border
p-2
rounded
w-full
mb-3
"
                        >


                          <option>
                            Chọn KOL
                          </option>


                          {
                            kols.map(k => (

                              <option
                                key={k.id}
                                value={k.id}
                              >

                                {k.users.full_name}

                              </option>

                            ))

                          }


                        </select>


                        <input
                          id="contentType"
                          placeholder="Loại content"
                          className="
border
p-2
rounded
w-full
mb-3
"
                        />



                        <textarea
                          id="requirement"
                          placeholder="Yêu cầu content"
                          className="
border
p-2
rounded
w-full
mb-3
"
                        />


                        <input
                          id="payment"
                          placeholder="Payment"
                          className="
border
p-2
rounded
w-full
mb-3
"
                        />



                        <button

                          onClick={async () => {


                            const kolId =
                              Number(
                                (document.getElementById(
                                  "kolSelect"
                                ) as HTMLSelectElement).value
                              );



                            await taskService.createTask({

                              campaign_id:
                                selectedCampaign.id,


                              kol_profile_id:
                                kolId,


                              content_type:
                                (document.getElementById(
                                  "contentType"
                                ) as HTMLInputElement
                                ).value,


                              content_requirement:
                                (document.getElementById(
                                  "requirement"
                                ) as HTMLTextAreaElement
                                ).value,


                              payment_amount:
                                Number(
                                  (document.getElementById(
                                    "payment"
                                  ) as HTMLInputElement
                                  ).value
                                )


                            });


                            alert(
                              "Giao task thành công"
                            );


                            setShowTaskModal(false);


                          }}

                          className="
bg-teal-600
text-white
px-4
py-2
rounded-xl
"

                        >

                          Giao task

                        </button>


                      </div>

                    </div>

                  )}
                  <span className="text-2xl w-8 text-center flex-shrink-0">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{campaign?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{campaign?.productName}</p>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-violet-600 dark:text-violet-400">{r.totalViews >= 1000000 ? `${(r.totalViews / 1000000).toFixed(1)}M` : `${Math.round(r.totalViews / 1000)}K`} views</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-500 dark:text-brand-400">{r.avgEngagementRate}% ER</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{r.score} điểm</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Rest */}
            {brandCampaignRankings.length > 3 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-soft overflow-hidden divide-y divide-slate-100/80">
                {brandCampaignRankings.slice(3).map((r, i) => {
                  const campaign = campaigns.find(c => c.id === r.campaignId);
                  return (
                    <div key={r.campaignId} className="flex items-center gap-4 px-5 py-3">
                      <span className="text-sm font-bold text-slate-400 w-6 text-center flex-shrink-0">{i + 4}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{campaign?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{campaign?.productName}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-xs text-slate-500">{r.totalViews >= 1000000 ? `${(r.totalViews / 1000000).toFixed(1)}M` : `${Math.round(r.totalViews / 1000)}K`}</span>
                        <span className="text-xs text-brand-600">{r.avgEngagementRate}%</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-right">{r.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}