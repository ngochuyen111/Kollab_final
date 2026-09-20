export type Role = 'admin' | 'brand' | 'kol';

export type TaskStatus = 
  | 'assigned'
  | 'draft_submitted'
  | 'revision_required'
  | 'approved_to_publish'
  | 'published'
  | 'tracking'
  | 'metrics_submitted'
  | 'metrics_approved'
  | 'completed'
  | 'payment_pending'
  | 'paid';

export type CampaignStatus = 'draft' | 'active' | 'tracking' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending' | 'partial_paid' | 'paid' | 'hold' | 'rejected';

export const taskStatusLabels: Record<TaskStatus, string> = {
  assigned: 'Đã phân công',
  draft_submitted: 'Đã nộp bản nháp',
  revision_required: 'Yêu cầu chỉnh sửa',
  approved_to_publish: 'Được phép đăng',
  published: 'Đã đăng bài',
  tracking: 'Đang theo dõi',
  metrics_submitted: 'Đã gửi metrics',
  metrics_approved: 'Đã xác nhận metrics',
  completed: 'Hoàn thành',
  payment_pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  draft_submitted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  revision_required: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  approved_to_publish: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  published: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  tracking: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  metrics_submitted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  metrics_approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  payment_pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Bản nháp',
  active: 'Đang chạy',
  tracking: 'Theo dõi',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  pending: 'Đang chờ',
  partial_paid: 'Thanh toán một phần',
  paid: 'Đã thanh toán',
  hold: 'Tạm giữ',
  rejected: 'Bị từ chối',
};

// ─── BRANDS ─────────────────────────────────────────────────────────
export interface Brand {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  plan: 'Starter' | 'Agency' | 'Enterprise';
  status: 'active' | 'suspended';
  campaignCount: number;
  kolCount: number;
  productCount: number;
  totalViews: number;
  engagementRate: number;
  conversionRate: number;
  totalPayment: number;
  createdAt: string;
}

export const brands: Brand[] = [
  {
    id: 'b1',
    name: 'Glow Beauty',
    email: 'admin@glowbeauty.vn',
    phone: '028 1234 5678',
    industry: 'Cosmetics',
    plan: 'Agency',
    status: 'active',
    campaignCount: 3,
    kolCount: 8,
    productCount: 8,
    totalViews: 1250000,
    engagementRate: 6.2,
    conversionRate: 4.8,
    totalPayment: 185000000,
    createdAt: '2026-01-15',
  },
  {
    id: 'b2',
    name: 'SunRise Bakery',
    email: 'contact@sunrisebakery.vn',
    phone: '028 9876 5432',
    industry: 'Food & Beverage',
    plan: 'Starter',
    status: 'active',
    campaignCount: 2,
    kolCount: 5,
    productCount: 7,
    totalViews: 450000,
    engagementRate: 5.8,
    conversionRate: 6.2,
    totalPayment: 45000000,
    createdAt: '2026-02-20',
  },
  {
    id: 'b3',
    name: 'TechZone Vietnam',
    email: 'marketing@techzone.vn',
    phone: '028 5555 1234',
    industry: 'Technology',
    plan: 'Enterprise',
    status: 'active',
    campaignCount: 5,
    kolCount: 12,
    productCount: 9,
    totalViews: 2800000,
    engagementRate: 5.4,
    conversionRate: 3.9,
    totalPayment: 420000000,
    createdAt: '2025-11-10',
  },
  {
    id: 'b4',
    name: 'FitLife Sports',
    email: 'hello@fitlife.vn',
    phone: '028 3333 9999',
    industry: 'Fitness',
    plan: 'Agency',
    status: 'active',
    campaignCount: 4,
    kolCount: 10,
    productCount: 9,
    totalViews: 980000,
    engagementRate: 7.1,
    conversionRate: 5.5,
    totalPayment: 125000000,
    createdAt: '2026-03-01',
  },
];

// ─── PRODUCTS ────────────────────────────────────────────────────────
export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  category: string;
  price: string;
  productLink: string;
  status: 'active' | 'inactive';
  image: string;
  description: string;
  campaignCount: number;
}

export const products: Product[] = [
  {
    id: 'p1',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Serum Cấp Ẩm Chuyên Sâu',
    category: 'Skincare',
    price: '299.000 VND',
    productLink: 'https://glowbeauty.vn/serum-cam-am',
    status: 'active',
    image: 'serum',
    description: 'Serum cấp ẩm với Hyaluronic Acid và Vitamin B5, phù hợp mọi loại da.',
    campaignCount: 2,
  },
  {
    id: 'p2',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Sữa Rửa Mặt Nhẹ Nhàng',
    category: 'Skincare',
    price: '159.000 VND',
    productLink: 'https://glowbeauty.vn/sua-rua-mat',
    status: 'active',
    image: 'cleanser',
    description: 'Sữa rửa mặt dịu nhẹ, không gây khô da, phù hợp da nhạy cảm.',
    campaignCount: 1,
  },
  {
    id: 'p3',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Kem Chống Nắng SPF 50+',
    category: 'Skincare',
    price: '349.000 VND',
    productLink: 'https://glowbeauty.vn/kem-chong-nang',
    status: 'active',
    image: 'sunscreen',
    description: 'Kem chống nắng SPF 50+, chống tia UVA/UVB, không để lại vệt trắng.',
    campaignCount: 1,
  },
  {
    id: 'p1-4',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Kem Dưỡng Mắt Collagen',
    category: 'Skincare',
    price: '450.000 VND',
    productLink: 'https://glowbeauty.vn/kem-duong-mat',
    status: 'active',
    image: 'eyecream',
    description: 'Kem dưỡng mắt collagen giảm quầng thâm, phù hợp mọi loại da.',
    campaignCount: 1,
  },
  {
    id: 'p1-5',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Toner Cân Bằng 5in1',
    category: 'Skincare',
    price: '219.000 VND',
    productLink: 'https://glowbeauty.vn/toner-5in1',
    status: 'active',
    image: 'toner',
    description: 'Toner cân bằng 5in1: se khít lỗ chân lông, cấp ẩm, làm sáng, chống oxy hóa.',
    campaignCount: 1,
  },
  {
    id: 'p1-6',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Mặt Nạ Ngủ Vitamin C',
    category: 'Skincare',
    price: '389.000 VND',
    productLink: 'https://glowbeauty.vn/mat-na-ngu-vitc',
    status: 'active',
    image: 'sleepmask',
    description: 'Mặt nạ ngủ Vitamin C 50ml, làm sáng da qua đêm, giảm thâm nám.',
    campaignCount: 1,
  },
  {
    id: 'p1-7',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Dầu Tẩy Trang Hoa Hồng',
    category: 'Skincare',
    price: '269.000 VND',
    productLink: 'https://glowbeauty.vn/dau-tay-trang',
    status: 'active',
    image: 'cleansingoil',
    description: 'Dầu tẩy trang hoa hồng 150ml, loại bỏ makeup và bụi mịn hiệu quả.',
    campaignCount: 1,
  },
  {
    id: 'p1-8',
    brandId: 'b1',
    brandName: 'Glow Beauty',
    name: 'Glow Tinh Chất Retinol 0.5%',
    category: 'Skincare',
    price: '520.000 VND',
    productLink: 'https://glowbeauty.vn/tinh-chat-retinol',
    status: 'active',
    image: 'retinol',
    description: 'Tinh chất Retinol 0.5% chống lão hóa, giảm nếp nhăn, phục hồi da ban đêm.',
    campaignCount: 1,
  },
  {
    id: 'p4',
    brandId: 'b2',
    brandName: 'SunRise Bakery',
    name: 'Bánh Bao Gà Nướng Phô Mai',
    category: 'Food',
    price: '19.000 VND',
    productLink: 'https://sunrisebakery.vn/banh-bao-ga-nuong',
    status: 'active',
    image: 'baobao',
    description: 'Bánh bao nhân gà nướng phô mai, hương vị thơm ngon, tiện lợi.',
    campaignCount: 1,
  },
  {
    id: 'p5',
    brandId: 'b2',
    brandName: 'SunRise Bakery',
    name: 'Bánh Mì Que Pate',
    category: 'Food',
    price: '15.000 VND',
    productLink: 'https://sunrisebakery.vn/banh-mi-que',
    status: 'active',
    image: 'banhmi',
    description: 'Bánh mì que pate thơm phức, bữa ăn nhanh hoàn hảo.',
    campaignCount: 1,
  },
  {
    id: 'p2-3',
    brandId: 'b2',
    brandName: 'SunRise Bakery',
    name: 'Bánh Croissant Bơ Tươi',
    category: 'Food',
    price: '28.000 VND',
    productLink: 'https://sunrisebakery.vn/croissant',
    status: 'active',
    image: 'croissant',
    description: 'Bánh Croissant bơ tươi Pháp, giòn ngoài mềm trong, 100g/tất.',
    campaignCount: 1,
  },
  {
    id: 'p2-4',
    brandId: 'b2',
    brandName: 'SunRise Bakery',
    name: 'Bánh Muffin Việt Quất',
    category: 'Food',
    price: '22.000 VND',
    productLink: 'https://sunrisebakery.vn/muffin-vietquat',
    status: 'active',
    image: 'muffin',
    description: 'Bánh muffin việt quất tươi, 70g/tất, vị chua ngọt hài hòa.',
    campaignCount: 1,
  },
  {
    id: 'p2-5',
    brandId: 'b2',
    brandName: 'SunRise Bakery',
    name: 'Bánh Tart Trứng Thiên Đường',
    category: 'Food',
    price: '18.000 VND',
    productLink: 'https://sunrisebakery.vn/tart-trung',
    status: 'active',
    image: 'tart',
    description: 'Bánh tart trứng thiên đường, nhân custard mịn màng, vỏ bánh giòn tan.',
    campaignCount: 1,
  },
  {
    id: 'p2-6',
    brandId: 'b2',
    brandName: 'SunRise Bakery',
    name: 'Bánh Mì Gối Nguyên Cám',
    category: 'Food',
    price: '25.000 VND',
    productLink: 'https://sunrisebakery.vn/banh-mi-goi',
    status: 'active',
    image: 'bread',
    description: 'Bánh mì gối nguyên cám 200g, giàu fiber, phù hợp bữa sáng lành mạnh.',
    campaignCount: 1,
  },
  {
    id: 'p2-7',
    brandId: 'b2',
    brandName: 'SunRise Bakery',
    name: 'Combo Bữa Sáng SunRise 2026',
    category: 'Food',
    price: '65.000 VND',
    productLink: 'https://sunrisebakery.vn/combo-sang-2026',
    status: 'active',
    image: 'combo',
    description: 'Combo bữa sáng gồm: 1 bánh mì que + 1 bánh bao + 1 ly sữa đậu.',
    campaignCount: 1,
  },
  {
    id: 'p6',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Tai Nghe Không Dây ProMax',
    category: 'Electronics',
    price: '1.990.000 VND',
    productLink: 'https://techzone.vn/tai-nghe-promax',
    status: 'active',
    image: 'headphone',
    description: 'Tai nghe không dây chống ồn, thời lượng pin 30 giờ.',
    campaignCount: 2,
  },
  {
    id: 'p3-2',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Bàn Phím Cơ RGB Gaming X1',
    category: 'Electronics',
    price: '1.250.000 VND',
    productLink: 'https://techzone.vn/ban-phim-co-rgb-x1',
    status: 'active',
    image: 'keyboard',
    description: 'Bàn phím cơ RGB Gaming switch blue, chống nước, tuổi thọ 50 triệu lần nhấn.',
    campaignCount: 1,
  },
  {
    id: 'p3-3',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Chuột Gaming không dây X3',
    category: 'Electronics',
    price: '890.000 VND',
    productLink: 'https://techzone.vn/chuot-gaming-x3',
    status: 'active',
    image: 'mouse',
    description: 'Chuột gaming không dây 12000 DPI, pin 70h, trọng lượng chỉ 85g.',
    campaignCount: 1,
  },
  {
    id: 'p3-4',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Màn Hình cong UltraWide 34"',
    category: 'Electronics',
    price: '8.990.000 VND',
    productLink: 'https://techzone.vn/man-hinh-uw34',
    status: 'active',
    image: 'monitor',
    description: 'Màn hình cong UltraWide 34 inch, 3440x1440, 144Hz, tấm nền VA.',
    campaignCount: 1,
  },
  {
    id: 'p3-5',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Webcam 4K ProStream AI',
    category: 'Electronics',
    price: '2.490.000 VND',
    productLink: 'https://techzone.vn/webcam-4k-pro',
    status: 'active',
    image: 'webcam',
    description: 'Webcam 4K với AI tracking, tự động lấy nét, giảm ồn kỹ thuật số.',
    campaignCount: 1,
  },
  {
    id: 'p3-6',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Giá Đỡ Laptop铝合金 X2',
    category: 'Electronics',
    price: '350.000 VND',
    productLink: 'https://techzone.vn/gia-do-laptop-x2',
    status: 'active',
    image: 'stand',
    description: 'Giá đỡ laptop nhôm 6 mức cao, tản nhiệt tốt, gập gọn, nhẹ 280g.',
    campaignCount: 1,
  },
  {
    id: 'p3-7',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Hub USB-C 10in1 MultiPort',
    category: 'Electronics',
    price: '1.100.000 VND',
    productLink: 'https://techzone.vn/hub-usbc-10in1',
    status: 'active',
    image: 'hub',
    description: 'Hub USB-C 10in1: HDMI 4K, USB-A 3.0 x3, SD/TF, PD 100W, audio jack.',
    campaignCount: 1,
  },
  {
    id: 'p3-8',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Loa Bluetooth Mini Bass X5',
    category: 'Electronics',
    price: '650.000 VND',
    productLink: 'https://techzone.vn/loa-bluetooth-x5',
    status: 'active',
    image: 'speaker',
    description: 'Loa bluetooth mini bass X5, 360° sound, chống nước IPX7, pin 24h.',
    campaignCount: 1,
  },
  {
    id: 'p3-9',
    brandId: 'b3',
    brandName: 'TechZone Vietnam',
    name: 'Miếng Lót Chuột Gaming XL',
    category: 'Electronics',
    price: '199.000 VND',
    productLink: 'https://techzone.vn/mieng-lot-chuot-xl',
    status: 'active',
    image: 'pad',
    description: 'Miếng lót chuột gaming XL 900x400mm, vải micro-texture, đế cao su chống trượt.',
    campaignCount: 1,
  },
  {
    id: 'p7',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Bình Nước Thể Thao 1L',
    category: 'Sports',
    price: '199.000 VND',
    productLink: 'https://fitlife.vn/binh-nuoc-1l',
    status: 'active',
    image: 'bottle',
    description: 'Bình nước thể thao chất liệu an toàn, không chất BPA.',
    campaignCount: 1,
  },
  {
    id: 'p4-2',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Thảm Yoga Cao Cấp 6mm',
    category: 'Sports',
    price: '450.000 VND',
    productLink: 'https://fitlife.vn/tham-yoga-6mm',
    status: 'active',
    image: 'yogamat',
    description: 'Thảm yoga TPE cao cấp 6mm, chống trượt, không mùi, 183x61cm.',
    campaignCount: 1,
  },
  {
    id: 'p4-3',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Dây Kháng Lực Set 5 Cây',
    category: 'Sports',
    price: '320.000 VND',
    productLink: 'https://fitlife.vn/day-khang-luc-set5',
    status: 'active',
    image: 'band',
    description: 'Set 5 dây kháng lực các mức: 10-50 lbs, phù hợp tập gym tại nhà.',
    campaignCount: 1,
  },
  {
    id: 'p4-4',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Balo Gym Training Pro 30L',
    category: 'Sports',
    price: '780.000 VND',
    productLink: 'https://fitlife.vn/balo-gym-pro',
    status: 'active',
    image: 'bag',
    description: 'Balo gym 30L phân chia nhiều ngăn, chống thấm, quai đeo bản rộng êm vai.',
    campaignCount: 1,
  },
  {
    id: 'p4-5',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Găng Tay Tập Gym掌心Pad',
    category: 'Sports',
    price: '180.000 VND',
    productLink: 'https://fitlife.vn/gang-tay-gym',
    status: 'active',
    image: 'gloves',
    description: 'Găng tay tập gym lòng bàn tay đệm gel, chống chai, thoáng khí.',
    campaignCount: 1,
  },
  {
    id: 'p4-6',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Banded Squat Loop 3 Mức',
    category: 'Sports',
    price: '120.000 VND',
    productLink: 'https://fitlife.vn/banded-squat',
    status: 'active',
    image: 'loopband',
    description: 'Banded squat loop latex cao cấp, 3 mức lực trong 1 set, đa năng.',
    campaignCount: 1,
  },
  {
    id: 'p4-7',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Bộ Tạ Tay Đôi Adjustable 2x5kg',
    category: 'Sports',
    price: '1.200.000 VND',
    productLink: 'https://fitlife.vn/ta-tay-doi-adjustable',
    status: 'active',
    image: 'dumbbell',
    description: 'Bộ tạ tay đôi adjustable 2x5kg, thay đổi được trọng lượng 1-10kg/mỗi quả.',
    campaignCount: 1,
  },
  {
    id: 'p4-8',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Đai Lưng H� Trợ Thắt Lưng Gym',
    category: 'Sports',
    price: '350.000 VND',
    productLink: 'https://fitlife.vn/dai-lung-gym',
    status: 'active',
    image: 'belt',
    description: 'Đai lưng gym hỗ trợ thắt lưng, neoprene co giãn 4 chiều, size S-XXL.',
    campaignCount: 1,
  },
  {
    id: 'p4-9',
    brandId: 'b4',
    brandName: 'FitLife Sports',
    name: 'Máy Đo Nhịp Tim Đeo Tay FitBand',
    category: 'Sports',
    price: '890.000 VND',
    productLink: 'https://fitlife.vn/may-do-nhip-tim-fitband',
    status: 'active',
    image: 'fitband',
    description: 'Vòng đeo tay đo nhịp tim, bước chân, calo, IP68 chống nước, pin 14 ngày.',
    campaignCount: 1,
  },
];

// ─── KOL/KOC ────────────────────────────────────────────────────────
export interface KOL {
  id: string;
  brandId: string;
  name: string;
  email: string;
  password?: string;
  handle: string;
  platform: 'TikTok' | 'Instagram' | 'YouTube' | 'Facebook';
  role: 'KOL' | 'KOC';
  followers: number;
  followersDisplay: string;
  engagementRate: number;
  niche: string;
  contentCategory: string;
  socialLinks: {
    tiktok?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  bookingPrice: number;
  status: 'active' | 'inactive' | 'on_hold';
  avatar: string;
  avatarUrl?: string;
  qrPaymentUrl?: string;
  bio?: string;
  experience: Array<{
    campaign: string;
    brand: string;
    rating: number;
    note: string;
    date: string;
  }>;
  currentRank?: number;
  totalEarned?: number;
  pendingPayment?: number;
}

export const kols: KOL[] = [
  {
    id: 'k1',
    brandId: 'b1',
    name: 'Linh Beauty',
    email: 'linhbeauty@gmail.com',
    handle: '@linhbeauty.official',
    platform: 'TikTok',
    role: 'KOL',
    followers: 1200000,
    followersDisplay: '1.2M',
    engagementRate: 6.8,
    niche: 'Skincare',
    contentCategory: 'Chăm sóc da',
    socialLinks: {
      tiktok: 'https://tiktok.com/@linhbeauty.official',
      instagram: 'https://instagram.com/linhbeauty',
    },
    bookingPrice: 8500000,
    status: 'active',
    avatar: 'LB',
    bio: 'Beauty Blogger | Skincare Enthusiast | 1.2M followers on TikTok',
    currentRank: 1,
    totalEarned: 127500000,
    pendingPayment: 17000000,
    experience: [
      { campaign: 'Glow Serum Launch', brand: 'Glow Beauty', rating: 5, note: 'Nội dung sáng tạo, đúng deadline, giao tiếp tốt', date: '2026-05' },
      { campaign: 'Summer Skincare Fest', brand: 'Glow Beauty', rating: 5, note: 'Vượt chỉ tiêu lượt xem 150%', date: '2026-03' },
    ],
  },
  {
    id: 'k2',
    brandId: 'b1',
    name: 'Minh Food Review',
    email: 'minhfoodreview@gmail.com',
    handle: '@minhfoodreview.vn',
    platform: 'Facebook',
    role: 'KOC',
    followers: 35000,
    followersDisplay: '35K',
    engagementRate: 8.2,
    niche: 'Food & Lifestyle',
    contentCategory: 'Review đồ ăn',
    socialLinks: {
      facebook: 'https://facebook.com/minhfoodreview',
    },
    bookingPrice: 2500000,
    status: 'active',
    avatar: 'MF',
    bio: 'Food Reviewer | Đi Ăn Là Chạy',
    currentRank: 3,
    totalEarned: 32500000,
    pendingPayment: 5000000,
    experience: [
      { campaign: 'SunRise Breakfast Combo', brand: 'SunRise Bakery', rating: 4, note: 'Review chân thật, đúng brief', date: '2026-04' },
    ],
  },
  {
    id: 'k3',
    brandId: 'b1',
    name: 'Tuấn Tech Review',
    email: 'tuantech@gmail.com',
    handle: '@tuantechreview',
    platform: 'YouTube',
    role: 'KOL',
    followers: 850000,
    followersDisplay: '850K',
    engagementRate: 5.4,
    niche: 'Tech',
    contentCategory: 'Review công nghệ',
    socialLinks: {
      youtube: 'https://youtube.com/@tuantechreview',
      tiktok: 'https://tiktok.com/@tuantechreview',
    },
    bookingPrice: 12000000,
    status: 'active',
    avatar: 'TT',
    bio: 'Tech Reviewer | Unboxing & Review | Collaborations: Samsung, Apple, Xiaomi',
    currentRank: 2,
    totalEarned: 96000000,
    pendingPayment: 24000000,
    experience: [
      { campaign: 'Tai Nghe ProMax Launch', brand: 'TechZone Vietnam', rating: 5, note: 'Review chi tiết, chuyên nghiệp', date: '2026-05' },
    ],
  },
  {
    id: 'k4',
    brandId: 'b1',
    name: 'Hà Fitness',
    email: 'hafitness@gmail.com',
    handle: '@hafitness.life',
    platform: 'TikTok',
    role: 'KOL',
    followers: 680000,
    followersDisplay: '680K',
    engagementRate: 7.5,
    niche: 'Fitness',
    contentCategory: 'Thể hình & Sức khỏe',
    socialLinks: {
      tiktok: 'https://tiktok.com/@hafitness.life',
      instagram: 'https://instagram.com/hafitness',
    },
    bookingPrice: 6500000,
    status: 'active',
    avatar: 'HF',
    bio: 'Fitness Coach | Home Workout | Protein Lover 💪',
    currentRank: 4,
    totalEarned: 71500000,
    pendingPayment: 13000000,
    experience: [
      { campaign: 'FitLife Water Bottle Promo', brand: 'FitLife Sports', rating: 5, note: 'Nội dung năng động, phù hợp target', date: '2026-04' },
    ],
  },
  {
    id: 'k5',
    brandId: 'b1',
    name: 'Phương Makeup',
    email: 'phuongmakeup@gmail.com',
    handle: '@phuongmakeup.studio',
    platform: 'Instagram',
    role: 'KOC',
    followers: 45000,
    followersDisplay: '45K',
    engagementRate: 9.1,
    niche: 'Beauty',
    contentCategory: 'Trang điểm',
    socialLinks: {
      instagram: 'https://instagram.com/phuongmakeup.studio',
    },
    bookingPrice: 3500000,
    status: 'active',
    avatar: 'PM',
    bio: 'Makeup Artist | Tutorial & Review',
    currentRank: 5,
    totalEarned: 42000000,
    pendingPayment: 7000000,
    experience: [],
  },
  {
    id: 'k6',
    brandId: 'b1',
    name: 'Anh Khoa Fitness',
    email: 'anhkhoafit@gmail.com',
    handle: '@anhkhoafit_official',
    platform: 'YouTube',
    role: 'KOL',
    followers: 420000,
    followersDisplay: '420K',
    engagementRate: 6.2,
    niche: 'Fitness',
    contentCategory: 'Thể hình',
    socialLinks: {
      youtube: 'https://youtube.com/@anhkhoafit',
    },
    bookingPrice: 5500000,
    status: 'active',
    avatar: 'AK',
    bio: 'Bodybuilding Coach | YouTube Fitness Partner',
    currentRank: 6,
    totalEarned: 55000000,
    pendingPayment: 11000000,
    experience: [],
  },
  {
    id: 'k7',
    brandId: 'b2',
    name: 'Loan Bakery',
    email: 'loanbakery@gmail.com',
    handle: '@loanbakery.official',
    platform: 'TikTok',
    role: 'KOC',
    followers: 28000,
    followersDisplay: '28K',
    engagementRate: 10.2,
    niche: 'Food & Lifestyle',
    contentCategory: 'Ẩm thực',
    socialLinks: {
      tiktok: 'https://tiktok.com/@loanbakery.official',
    },
    bookingPrice: 1800000,
    status: 'active',
    avatar: 'LBK',
    bio: 'Food Creator | Bakery & Desserts',
    currentRank: 1,
    totalEarned: 18000000,
    pendingPayment: 3600000,
    experience: [],
  },
  {
    id: 'k8',
    brandId: 'b2',
    name: 'Long Foodie',
    email: 'longfoodie@gmail.com',
    handle: '@longfoodie.sg',
    platform: 'Instagram',
    role: 'KOL',
    followers: 95000,
    followersDisplay: '95K',
    engagementRate: 7.8,
    niche: 'Food & Lifestyle',
    contentCategory: 'Foodie',
    socialLinks: {
      instagram: 'https://instagram.com/longfoodie.sg',
    },
    bookingPrice: 5500000,
    status: 'active',
    avatar: 'LF',
    bio: 'Food Blogger | Street Food Hunter | Vietnam 🇻🇳',
    currentRank: 2,
    totalEarned: 38500000,
    pendingPayment: 11000000,
    experience: [],
  },
];

// ─── CAMPAIGNS ───────────────────────────────────────────────────────
export interface Campaign {
  id: string;
  brandId: string;
  productId: string;
  productName: string;
  brandName: string;
  name: string;
  objective: string;
  brief: string;
  kpiTarget: {
    views: number;
    engagementRate: number;
    conversions: number;
  };
  timeline: string;
  deadline: string;
  paymentRule: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  assignedKOLs: string[];
  totalViews: number;
  avgEngagementRate: number;
  totalConversions: number;
  createdAt: string;
}

export const campaigns: Campaign[] = [
  {
    id: 'c1',
    brandId: 'b1',
    productId: 'p1',
    productName: 'Glow Serum Cấp Ẩm Chuyên Sâu',
    brandName: 'Glow Beauty',
    name: 'Glow Serum Launch - Spring 2026',
    objective: 'Increase awareness and drive conversions for new Glow Serum product',
    brief: 'Tạo nội dung giới thiệu serum cấp ẩm với USPs: Hyaluronic Acid, Vitamin B5, phù hợp mọi loại da. Nhấn mạnh cảm giác dùng, kết quả sau 7 ngày, và giá trị sản phẩm.',
    kpiTarget: { views: 100000, engagementRate: 6, conversions: 50 },
    timeline: '2026-04-01 đến 2026-06-30',
    deadline: '2026-06-30',
    paymentRule: 'Base fee + Performance bonus: 5% extra nếu vượt 120% KPI views',
    status: 'tracking',
    budget: 85000000,
    spent: 52000000,
    assignedKOLs: ['k1', 'k5'],
    totalViews: 78500,
    avgEngagementRate: 7.2,
    totalConversions: 42,
    createdAt: '2026-03-15',
  },
  {
    id: 'c2',
    brandId: 'b2',
    productId: 'p4',
    productName: 'Bánh Bao Gà Nướng Phô Mai',
    brandName: 'SunRise Bakery',
    name: 'SunRise Breakfast Combo - Summer Edition',
    objective: 'Promote breakfast combo and drive foot traffic to stores',
    brief: 'Review/taste test bánh bao gà nướng phô mai, nhấn mạnh: hương vị, giá cả, sự tiện lợi. Kêu gọi ghé store với promo code.',
    kpiTarget: { views: 50000, engagementRate: 5, conversions: 30 },
    timeline: '2026-05-01 đến 2026-07-31',
    deadline: '2026-07-31',
    paymentRule: 'Fixed fee per content piece',
    status: 'active',
    budget: 35000000,
    spent: 15000000,
    assignedKOLs: ['k2', 'k7', 'k8'],
    totalViews: 32000,
    avgEngagementRate: 5.8,
    totalConversions: 18,
    createdAt: '2026-04-20',
  },
  {
    id: 'c3',
    brandId: 'b3',
    productId: 'p6',
    productName: 'Tai Nghe Không Dây ProMax',
    brandName: 'TechZone Vietnam',
    name: 'ProMax Headphone Launch Campaign',
    objective: 'Generate awareness and drive pre-orders for ProMax headphones',
    brief: 'Unboxing và review chi tiết tai nghe ProMax, nhấn mạnh: chống ồn, pin 30h, thiết kế, giá. So sánh với competitors.',
    kpiTarget: { views: 200000, engagementRate: 5, conversions: 100 },
    timeline: '2026-05-15 đến 2026-08-15',
    deadline: '2026-08-15',
    paymentRule: 'Base fee + 3% bonus per 10K views above target',
    status: 'active',
    budget: 150000000,
    spent: 45000000,
    assignedKOLs: ['k3'],
    totalViews: 125000,
    avgEngagementRate: 5.6,
    totalConversions: 68,
    createdAt: '2026-05-01',
  },
  {
    id: 'c4',
    brandId: 'b4',
    productId: 'p7',
    productName: 'Bình Nước Thể Thao 1L',
    brandName: 'FitLife Sports',
    name: 'FitLife Water Bottle Summer Promo',
    objective: 'Drive sales for new water bottle product line',
    brief: 'Content về lợi ích của việc uống đủ nước, kết hợp giới thiệu bình nước FitLife. Nhấn mạnh chất liệu BPA-free, thiết kế ergonomic.',
    kpiTarget: { views: 80000, engagementRate: 6, conversions: 40 },
    timeline: '2026-04-15 đến 2026-06-30',
    deadline: '2026-06-30',
    paymentRule: 'Fixed fee per content piece + 2% conversion bonus',
    status: 'tracking',
    budget: 45000000,
    spent: 38000000,
    assignedKOLs: ['k4', 'k6'],
    totalViews: 72000,
    avgEngagementRate: 6.8,
    totalConversions: 35,
    createdAt: '2026-04-01',
  },
  {
    id: 'c5',
    brandId: 'b1',
    productId: 'p3',
    productName: 'Glow Kem Chống Nắng SPF 50+',
    brandName: 'Glow Beauty',
    name: 'Glow Sunscreen Summer Protection',
    objective: 'Educate about sun protection and promote SPF 50+ product',
    brief: 'Content giáo dục về tầm quan trọng của chống nắng, kết hợp review kem chống nắng Glow SPF 50+. Nhấn mạnh: không để lại vệt trắng, chống UVA/UVB.',
    kpiTarget: { views: 60000, engagementRate: 5.5, conversions: 35 },
    timeline: '2026-05-01 đến 2026-08-31',
    deadline: '2026-08-31',
    paymentRule: 'Base fee + performance bonus',
    status: 'active',
    budget: 55000000,
    spent: 12000000,
    assignedKOLs: ['k1', 'k5'],
    totalViews: 28000,
    avgEngagementRate: 6.1,
    totalConversions: 15,
    createdAt: '2026-04-25',
  },
  {
    id: 'c6',
    brandId: 'b1',
    productId: 'p1',
    productName: 'Glow Serum Cấp Ẩm Chuyên Sâu',
    brandName: 'Glow Beauty',
    name: 'Glow Serum - Customer Review Series',
    objective: 'Generate user testimonials and social proof',
    brief: 'Series video review từ khách hàng thật về serum, kết hợp before/after. Authenticity is key.',
    kpiTarget: { views: 40000, engagementRate: 7, conversions: 25 },
    timeline: '2026-06-01 đến 2026-08-31',
    deadline: '2026-08-31',
    paymentRule: 'Per video flat fee',
    status: 'draft',
    budget: 25000000,
    spent: 0,
    assignedKOLs: [],
    totalViews: 0,
    avgEngagementRate: 0,
    totalConversions: 0,
    createdAt: '2026-05-20',
  },
];

// ─── TASKS ───────────────────────────────────────────────────────────
export interface Task {
  id: string;
  campaignId: string;
  campaignName: string;
  productName: string;
  kolId: string;
  kolName: string;
  kolPlatform: string;
  kolAvatar: string;
  brief: string;
  contentRequirements: string;
  kpiTarget: {
    views: number;
    engagementRate: number;
  };
  deadline: string;
  paymentAmount: number;
  status: TaskStatus;
  draftContent?: {
    contentUrl?: string;
    caption?: string;
    submittedAt: string;
    version: number;
    feedback?: string;
  }[];
  publishedContent?: {
    postUrl?: string;
    publishedAt?: string;
    screenshotUrl?: string;
  };
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagementRate: number;
    snapshots: {
      time: '24h' | '72h' | '7d' | 'final';
      date: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    }[];
    screenshotUrl?: string;
    brandConfirmed: boolean;
  };
  conversion?: {
    orders: number;
    leads: number;
    couponUsage: number;
    revenue: number;
    brandEnteredAt: string;
    brandConfirmed: boolean;
  };
  createdAt: string;
}

export const tasks: Task[] = [
  // Glow Serum Launch Tasks
  {
    id: 't1',
    campaignId: 'c1',
    campaignName: 'Glow Serum Launch - Spring 2026',
    productName: 'Glow Serum Cấp Ẩm Chuyên Sâu',
    kolId: 'k1',
    kolName: 'Linh Beauty',
    kolPlatform: 'TikTok',
    kolAvatar: 'LB',
    brief: 'Tạo video TikTok 30-60s giới thiệu Glow Serum với các điểm chính: (1) Texture serum mỏng nhẹ, (2) Cảm giác sau khi apply, (3) Kết quả sau 7 ngày sử dụng, (4) Call-to-action mua hàng',
    contentRequirements: 'Video vertical, có voiceover, include product demo, mention promo code GLOW20 cho 20% off',
    kpiTarget: { views: 100000, engagementRate: 6 },
    deadline: '2026-06-25',
    paymentAmount: 8500000,
    status: 'metrics_submitted',
    draftContent: [
      { contentUrl: 'draft_v1.mp4', caption: 'Serum mới của Glow Beauty 🌟', submittedAt: '2026-06-10 14:30', version: 1, feedback: 'Cần thêm logo brand ở đầu video, âm thanh cần clear hơn' },
      { contentUrl: 'draft_v2.mp4', caption: 'Serum cấp ẩm cực xịn! ✨', submittedAt: '2026-06-12 09:15', version: 2, feedback: 'Đã tốt hơn, nhưng cần thu ngắn phần giới thiệu xuống 10s' },
      { contentUrl: 'draft_v3.mp4', caption: 'Dưỡng ẩm đỉnh cao với Glow Serum 💧', submittedAt: '2026-06-15 16:45', version: 3 },
    ],
    publishedContent: {
      postUrl: 'https://tiktok.com/@linhbeauty.official/video/7284910234',
      publishedAt: '2026-06-16 10:00',
    },
    metrics: {
      views: 145000,
      likes: 8500,
      comments: 1200,
      shares: 680,
      saves: 420,
      engagementRate: 7.5,
      snapshots: [
        { time: '24h', date: '2026-06-17', views: 45000, likes: 2800, comments: 350, shares: 180, saves: 120 },
        { time: '72h', date: '2026-06-19', views: 98000, likes: 5900, comments: 820, shares: 450, saves: 280 },
        { time: '7d', date: '2026-06-23', views: 135000, likes: 7800, comments: 1100, shares: 620, saves: 390 },
        { time: 'final', date: '2026-06-30', views: 145000, likes: 8500, comments: 1200, shares: 680, saves: 420 },
      ],
      brandConfirmed: false,
    },
    createdAt: '2026-03-20',
  },
  {
    id: 't2',
    campaignId: 'c1',
    campaignName: 'Glow Serum Launch - Spring 2026',
    productName: 'Glow Serum Cấp Ẩm Chuyên Sâu',
    kolId: 'k5',
    kolName: 'Phương Makeup',
    kolPlatform: 'Instagram',
    kolAvatar: 'PM',
    brief: 'Tạo carousel 5-7 slides giới thiệu Glow Serum, bao gồm: before/after, ingredients, how to use, customer reviews, CTA',
    contentRequirements: 'Carousel images (1080x1350), soft lighting, aesthetic brand-aligned',
    kpiTarget: { views: 30000, engagementRate: 5 },
    deadline: '2026-06-28',
    paymentAmount: 3500000,
    status: 'tracking',
    draftContent: [
      { contentUrl: 'carousel_v1.jpg', caption: 'Đã thử serum mới! Kết quả bất ngờ 😍', submittedAt: '2026-06-18 11:00', version: 1, feedback: 'Filter hơi tối, cần chỉnh sáng hơn và thêm swipe indicator' },
      { contentUrl: 'carousel_v2.jpg', caption: 'Glow Serum - Bí quyết da căng bóng ✨', submittedAt: '2026-06-20 15:30', version: 2 },
    ],
    publishedContent: {
      postUrl: 'https://instagram.com/p/Ct8hJkLKh2',
      publishedAt: '2026-06-21 09:00',
    },
    metrics: {
      views: 42000,
      likes: 3200,
      comments: 450,
      shares: 120,
      saves: 280,
      engagementRate: 9.4,
      snapshots: [
        { time: '24h', date: '2026-06-22', views: 18000, likes: 1400, comments: 180, shares: 50, saves: 110 },
        { time: '72h', date: '2026-06-24', views: 35000, likes: 2700, comments: 380, shares: 100, saves: 230 },
        { time: 'final', date: '2026-06-30', views: 42000, likes: 3200, comments: 450, shares: 120, saves: 280 },
      ],
      brandConfirmed: false,
    },
    createdAt: '2026-03-20',
  },
  // SunRise Breakfast Combo Tasks
  {
    id: 't3',
    campaignId: 'c2',
    campaignName: 'SunRise Breakfast Combo - Summer Edition',
    productName: 'Bánh Bao Gà Nướng Phô Mai',
    kolId: 'k2',
    kolName: 'Minh Food Review',
    kolPlatform: 'Facebook',
    kolAvatar: 'MF',
    brief: 'Review video bánh bao gà nướng phô mai, trải nghiệm thật, honest opinion về taste, texture, value for money',
    contentRequirements: 'Video 2-3 phút, có taste test thật, mention price và where to buy',
    kpiTarget: { views: 20000, engagementRate: 5 },
    deadline: '2026-07-15',
    paymentAmount: 2500000,
    status: 'approved_to_publish',
    draftContent: [
      { contentUrl: 'review_v1.mp4', caption: 'Review bánh bao mới!', submittedAt: '2026-06-25 14:00', version: 1 },
    ],
    createdAt: '2026-05-01',
  },
  {
    id: 't4',
    campaignId: 'c2',
    campaignName: 'SunRise Breakfast Combo - Summer Edition',
    productName: 'Bánh Bao Gà Nướng Phô Mai',
    kolId: 'k7',
    kolName: 'Loan Bakery',
    kolPlatform: 'TikTok',
    kolAvatar: 'LBK',
    brief: 'TikTok video giới thiệu bánh bao với format: unboxing → taste test → rating',
    contentRequirements: 'TikTok format, catchy music, under 60s, viral potential',
    kpiTarget: { views: 15000, engagementRate: 6 },
    deadline: '2026-07-20',
    paymentAmount: 1800000,
    status: 'draft_submitted',
    draftContent: [
      { contentUrl: 'tiktok_v1.mp4', caption: 'Bánh bao phô mai ngon quá! 😋', submittedAt: '2026-06-28 16:00', version: 1 },
    ],
    createdAt: '2026-05-01',
  },
  // TechZone ProMax Tasks
  {
    id: 't5',
    campaignId: 'c3',
    campaignName: 'ProMax Headphone Launch Campaign',
    productName: 'Tai Nghe Không Dây ProMax',
    kolId: 'k3',
    kolName: 'Tuấn Tech Review',
    kolPlatform: 'YouTube',
    kolAvatar: 'TT',
    brief: 'Unboxing và review chi tiết tai nghe ProMax, bao gồm: unboxing experience, design, comfort, sound quality, ANC performance, battery life, comparison with competitors',
    contentRequirements: 'Video 10-15 phút, professional setup, detailed honest review, include timestamps',
    kpiTarget: { views: 100000, engagementRate: 5 },
    deadline: '2026-07-15',
    paymentAmount: 12000000,
    status: 'revision_required',
    draftContent: [
      { contentUrl: 'review_v1.mp4', caption: 'ProMax Headphone Review', submittedAt: '2026-06-20 10:00', version: 1, feedback: 'Cần thêm comparison section với Sony WH-1000XM5, và section về call quality' },
      { contentUrl: 'review_v2.mp4', caption: 'ProMax - Best ANC Under $200?', submittedAt: '2026-06-23 14:30', version: 2, feedback: 'Tốt hơn rồi nhưng cần rút ngắn intro xuống 30s' },
    ],
    createdAt: '2026-05-05',
  },
  // FitLife Tasks
  {
    id: 't6',
    campaignId: 'c4',
    campaignName: 'FitLife Water Bottle Summer Promo',
    productName: 'Bình Nước Thể Thao 1L',
    kolId: 'k4',
    kolName: 'Hà Fitness',
    kolPlatform: 'TikTok',
    kolAvatar: 'HF',
    brief: 'TikTok video về lợi ích uống đủ nước + giới thiệu bình FitLife, kết hợp workout footage',
    contentRequirements: 'TikTok format, fitness aesthetic, motivational tone',
    kpiTarget: { views: 50000, engagementRate: 6 },
    deadline: '2026-06-25',
    paymentAmount: 6500000,
    status: 'metrics_approved',
    draftContent: [
      { contentUrl: 'fitness_v1.mp4', caption: 'Uống đủ nước = Kết quả tốt hơn! 💧', submittedAt: '2026-06-01 09:00', version: 1 },
    ],
    publishedContent: {
      postUrl: 'https://tiktok.com/@hafitness.life/video/7281234567',
      publishedAt: '2026-06-02 18:00',
    },
    metrics: {
      views: 72000,
      likes: 5200,
      comments: 680,
      shares: 420,
      saves: 350,
      engagementRate: 9.2,
      snapshots: [
        { time: '24h', date: '2026-06-03', views: 25000, likes: 1900, comments: 240, shares: 150, saves: 120 },
        { time: 'final', date: '2026-06-30', views: 72000, likes: 5200, comments: 680, shares: 420, saves: 350 },
      ],
      brandConfirmed: true,
    },
    conversion: {
      orders: 28,
      leads: 45,
      couponUsage: 22,
      revenue: 5600000,
      brandEnteredAt: '2026-06-28',
      brandConfirmed: true,
    },
    createdAt: '2026-04-10',
  },
  {
    id: 't7',
    campaignId: 'c4',
    campaignName: 'FitLife Water Bottle Summer Promo',
    productName: 'Bình Nước Thể Thao 1L',
    kolId: 'k6',
    kolName: 'Anh Khoa Fitness',
    kolPlatform: 'YouTube',
    kolAvatar: 'AK',
    brief: 'YouTube video về bình nước FitLife, kết hợp với workout routine content',
    contentRequirements: 'YouTube format, 5-8 phút, include product segment trong workout video',
    kpiTarget: { views: 30000, engagementRate: 5 },
    deadline: '2026-06-28',
    paymentAmount: 5500000,
    status: 'published',
    draftContent: [
      { contentUrl: 'workout_v1.mp4', caption: 'Morning Workout + FitLife Bottle', submittedAt: '2026-06-10 11:00', version: 1 },
    ],
    publishedContent: {
      postUrl: 'https://youtube.com/shorts/abc123',
      publishedAt: '2026-06-11 20:00',
    },
    metrics: {
      views: 38000,
      likes: 2100,
      comments: 320,
      shares: 180,
      saves: 220,
      engagementRate: 7.6,
      snapshots: [
        { time: '24h', date: '2026-06-12', views: 12000, likes: 700, comments: 100, shares: 60, saves: 70 },
        { time: 'final', date: '2026-06-30', views: 38000, likes: 2100, comments: 320, shares: 180, saves: 220 },
      ],
      brandConfirmed: false,
    },
    createdAt: '2026-04-10',
  },
];

// ─── PAYMENTS ────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  taskId: string;
  campaignId: string;
  campaignName: string;
  productName: string;
  kolId: string;
  kolName: string;
  kolAvatar: string;
  kolPlatform: string;
  amount: number;
  bonus?: number;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  qrPaymentUrl?: string;
  dueDate: string;
  paidDate?: string;
  invoiceNumber?: string;
  brandEnteredConversions?: boolean;
}

export const payments: Payment[] = [
  {
    id: 'pay1',
    taskId: 't6',
    campaignId: 'c4',
    campaignName: 'FitLife Water Bottle Summer Promo',
    productName: 'Bình Nước Thể Thao 1L',
    kolId: 'k4',
    kolName: 'Hà Fitness',
    kolAvatar: 'HF',
    kolPlatform: 'TikTok',
    amount: 6500000,
    bonus: 112000,
    totalAmount: 6612000,
    paidAmount: 0,
    status: 'pending',
    qrPaymentUrl: 'qr_hafitness.png',
    dueDate: '2026-07-05',
    brandEnteredConversions: true,
  },
  {
    id: 'pay2',
    taskId: 't2',
    campaignId: 'c1',
    campaignName: 'Glow Serum Launch - Spring 2026',
    productName: 'Glow Serum Cấp Ẩm Chuyên Sâu',
    kolId: 'k5',
    kolName: 'Phương Makeup',
    kolAvatar: 'PM',
    kolPlatform: 'Instagram',
    amount: 3500000,
    totalAmount: 3500000,
    paidAmount: 0,
    status: 'pending',
    qrPaymentUrl: 'qr_phuongmakeup.png',
    dueDate: '2026-07-10',
    brandEnteredConversions: false,
  },
  {
    id: 'pay3',
    taskId: 't1',
    campaignId: 'c1',
    campaignName: 'Glow Serum Launch - Spring 2026',
    productName: 'Glow Serum Cấp Ẩm Chuyên Sâu',
    kolId: 'k1',
    kolName: 'Linh Beauty',
    kolAvatar: 'LB',
    kolPlatform: 'TikTok',
    amount: 8500000,
    bonus: 2975000,
    totalAmount: 11475000,
    paidAmount: 11475000,
    status: 'paid',
    qrPaymentUrl: 'qr_linhbeauty.png',
    dueDate: '2026-07-01',
    paidDate: '2026-06-28',
    invoiceNumber: 'INV-2026-0089',
    brandEnteredConversions: true,
  },
  {
    id: 'pay4',
    taskId: 't7',
    campaignId: 'c4',
    campaignName: 'FitLife Water Bottle Summer Promo',
    productName: 'Bình Nước Thể Thao 1L',
    kolId: 'k6',
    kolName: 'Anh Khoa Fitness',
    kolAvatar: 'AK',
    kolPlatform: 'YouTube',
    amount: 5500000,
    totalAmount: 5500000,
    paidAmount: 0,
    status: 'pending',
    qrPaymentUrl: 'qr_anhkhoafit.png',
    dueDate: '2026-07-15',
    brandEnteredConversions: false,
  },
  {
    id: 'pay5',
    taskId: 't5',
    campaignId: 'c3',
    campaignName: 'ProMax Headphone Launch Campaign',
    productName: 'Tai Nghe Không Dây ProMax',
    kolId: 'k3',
    kolName: 'Tuấn Tech Review',
    kolAvatar: 'TT',
    kolPlatform: 'YouTube',
    amount: 12000000,
    totalAmount: 12000000,
    paidAmount: 0,
    status: 'pending',
    qrPaymentUrl: 'qr_tuantech.png',
    dueDate: '2026-07-20',
    brandEnteredConversions: false,
  },
];

// ─── WORK HISTORY / ACTIVITY LOGS ───────────────────────────────────
export interface WorkHistoryItem {
  id: string;
  timestamp: string;
  actor: 'admin' | 'brand' | 'kol';
  actorName: string;
  action: string;
  target: string;
  targetType: 'brand' | 'campaign' | 'kol' | 'task' | 'product' | 'payment';
  details?: string;
}

export const workHistory: WorkHistoryItem[] = [
  { id: 'wh1', timestamp: '2026-06-29 10:30', actor: 'brand', actorName: 'Glow Beauty', action: 'Nhập dữ liệu conversion', target: 'FitLife Water Bottle - Hà Fitness', targetType: 'task', details: 'Orders: 28, Revenue: 5.6M VND' },
  { id: 'wh2', timestamp: '2026-06-29 09:15', actor: 'brand', actorName: 'Glow Beauty', action: 'Xác nhận metrics', target: 'Glow Serum - Hà Fitness', targetType: 'task', details: 'Views: 72K, ER: 9.2%' },
  { id: 'wh3', timestamp: '2026-06-28 16:45', actor: 'brand', actorName: 'Glow Beauty', action: 'Thanh toán', target: 'Linh Beauty', targetType: 'payment', details: '11.475.000 VND - INV-2026-0089' },
  { id: 'wh4', timestamp: '2026-06-28 14:20', actor: 'kol', actorName: 'Linh Beauty', action: 'Cập nhật metrics', target: 'Glow Serum Launch', targetType: 'task', details: 'Final snapshot: 145K views, 7.5% ER' },
  { id: 'wh5', timestamp: '2026-06-28 11:00', actor: 'brand', actorName: 'Glow Beauty', action: 'Gửi phản hồi chỉnh sửa', target: 'Tuấn Tech Review - ProMax', targetType: 'task', details: 'Cần rút ngắn intro xuống 30s' },
  { id: 'wh6', timestamp: '2026-06-27 15:30', actor: 'admin', actorName: 'Admin', action: 'Tạo tài khoản Brand', target: 'TechZone Vietnam', targetType: 'brand', details: 'Plan: Enterprise' },
  { id: 'wh7', timestamp: '2026-06-27 10:00', actor: 'brand', actorName: 'Glow Beauty', action: 'Tạo chiến dịch', target: 'Glow Sunscreen Summer Protection', targetType: 'campaign', details: 'Budget: 55M VND' },
  { id: 'wh8', timestamp: '2026-06-26 09:00', actor: 'brand', actorName: 'SunRise Bakery', action: 'Tạo tài khoản KOL', target: 'Loan Bakery', targetType: 'kol' },
  { id: 'wh9', timestamp: '2026-06-25 14:30', actor: 'kol', actorName: 'Minh Food Review', action: 'Nộp bản nháp', target: 'SunRise Breakfast Combo', targetType: 'task' },
  { id: 'wh10', timestamp: '2026-06-24 16:00', actor: 'brand', actorName: 'Glow Beauty', action: 'Phê duyệt nội dung', target: 'Glow Serum - Phương Makeup', targetType: 'task', details: 'Approved to publish' },
  { id: 'wh11', timestamp: '2026-06-23 11:00', actor: 'brand', actorName: 'FitLife Sports', action: 'Nhập dữ liệu conversion', target: 'FitLife Bottle - Anh Khoa', targetType: 'task' },
  { id: 'wh12', timestamp: '2026-06-22 08:45', actor: 'admin', actorName: 'Admin', action: 'Tạo sản phẩm', target: 'Tai Nghe Không Dây ProMax', targetType: 'product', details: 'Brand: TechZone Vietnam' },
];

// ─── RANKINGS ────────────────────────────────────────────────────────
export interface KOLRanking {
  rank: number;
  kolId: string;
  kolName: string;
  kolAvatar: string;
  platform: string;
  totalViews: number;
  avgEngagementRate: number;
  conversionRate: number;
  tasksCompleted: number;
  totalTasks: number;
  score: number;
}

export const kolRankings: KOLRanking[] = [
  { rank: 1, kolId: 'k1', kolName: 'Linh Beauty', kolAvatar: 'LB', platform: 'TikTok', totalViews: 145000, avgEngagementRate: 7.5, conversionRate: 5.2, tasksCompleted: 1, totalTasks: 1, score: 92.5 },
  { rank: 2, kolId: 'k3', kolName: 'Tuấn Tech Review', kolAvatar: 'TT', platform: 'YouTube', totalViews: 125000, avgEngagementRate: 5.6, conversionRate: 4.8, tasksCompleted: 0, totalTasks: 1, score: 78.2 },
  { rank: 3, kolId: 'k4', kolName: 'Hà Fitness', kolAvatar: 'HF', platform: 'TikTok', totalViews: 72000, avgEngagementRate: 9.2, conversionRate: 6.1, tasksCompleted: 1, totalTasks: 1, score: 85.8 },
  { rank: 4, kolId: 'k6', kolName: 'Anh Khoa Fitness', kolAvatar: 'AK', platform: 'YouTube', totalViews: 38000, avgEngagementRate: 7.6, conversionRate: 4.5, tasksCompleted: 1, totalTasks: 1, score: 72.1 },
  { rank: 5, kolId: 'k5', kolName: 'Phương Makeup', kolAvatar: 'PM', platform: 'Instagram', totalViews: 42000, avgEngagementRate: 9.4, conversionRate: 4.2, tasksCompleted: 1, totalTasks: 1, score: 80.3 },
  { rank: 6, kolId: 'k2', kolName: 'Minh Food Review', kolAvatar: 'MF', platform: 'Facebook', totalViews: 0, avgEngagementRate: 0, conversionRate: 0, tasksCompleted: 0, totalTasks: 1, score: 0 },
  { rank: 7, kolId: 'k7', kolName: 'Loan Bakery', kolAvatar: 'LBK', platform: 'TikTok', totalViews: 0, avgEngagementRate: 0, conversionRate: 0, tasksCompleted: 0, totalTasks: 1, score: 0 },
  { rank: 8, kolId: 'k8', kolName: 'Long Foodie', kolAvatar: 'LF', platform: 'Instagram', totalViews: 0, avgEngagementRate: 0, conversionRate: 0, tasksCompleted: 0, totalTasks: 0, score: 0 },
];

export interface CampaignRanking {
  rank: number;
  campaignId: string;
  campaignName: string;
  productName: string;
  brandName: string;
  status: CampaignStatus;
  totalViews: number;
  avgEngagementRate: number;
  conversionRate: number;
  taskCompletion: number;
  kpiProgress: number;
  score: number;
}

export const campaignRankings: CampaignRanking[] = [
  { rank: 1, campaignId: 'c1', campaignName: 'Glow Serum Launch', productName: 'Glow Serum Cấp Ẩm', brandName: 'Glow Beauty', status: 'tracking', totalViews: 185500, avgEngagementRate: 8.35, conversionRate: 5.1, taskCompletion: 67, kpiProgress: 78, score: 88.2 },
  { rank: 2, campaignId: 'c3', campaignName: 'ProMax Headphone Launch', productName: 'Tai Nghe ProMax', brandName: 'TechZone Vietnam', status: 'active', totalViews: 125000, avgEngagementRate: 5.6, conversionRate: 4.8, taskCompletion: 0, kpiProgress: 62.5, score: 72.4 },
  { rank: 3, campaignId: 'c4', campaignName: 'FitLife Water Bottle', productName: 'Bình Nước 1L', brandName: 'FitLife Sports', status: 'tracking', totalViews: 110000, avgEngagementRate: 8.4, conversionRate: 5.3, taskCompletion: 100, kpiProgress: 90, score: 91.5 },
  { rank: 4, campaignId: 'c2', campaignName: 'SunRise Breakfast Combo', productName: 'Bánh Bao Gà', brandName: 'SunRise Bakery', status: 'active', totalViews: 32000, avgEngagementRate: 5.8, conversionRate: 4.2, taskCompletion: 0, kpiProgress: 64, score: 58.3 },
  { rank: 5, campaignId: 'c5', campaignName: 'Glow Sunscreen Summer', productName: 'Kem Chống Nắng SPF 50+', brandName: 'Glow Beauty', status: 'active', totalViews: 28000, avgEngagementRate: 6.1, conversionRate: 3.5, taskCompletion: 0, kpiProgress: 46.7, score: 52.1 },
  { rank: 6, campaignId: 'c6', campaignName: 'Glow Serum Review Series', productName: 'Glow Serum', brandName: 'Glow Beauty', status: 'draft', totalViews: 0, avgEngagementRate: 0, conversionRate: 0, taskCompletion: 0, kpiProgress: 0, score: 0 },
];

export interface BrandRanking {
  rank: number;
  brandId: string;
  brandName: string;
  industry: string;
  totalCampaigns: number;
  activeCampaigns: number;
  totalKOLs: number;
  totalViews: number;
  avgEngagementRate: number;
  avgConversionRate: number;
  totalPayment: number;
  score: number;
}

export const brandRankings: BrandRanking[] = [
  { rank: 1, brandId: 'b1', brandName: 'Glow Beauty', industry: 'Beauty & Skincare', totalCampaigns: 3, activeCampaigns: 2, totalKOLs: 5, totalViews: 240500, avgEngagementRate: 7.6, avgConversionRate: 4.9, totalPayment: 120000000, score: 92.5 },
  { rank: 2, brandId: 'b3', brandName: 'TechZone Vietnam', industry: 'Technology', totalCampaigns: 5, activeCampaigns: 2, totalKOLs: 12, totalViews: 185000, avgEngagementRate: 6.2, avgConversionRate: 5.4, totalPayment: 95000000, score: 85.8 },
  { rank: 3, brandId: 'b4', brandName: 'FitLife Sports', industry: 'Sports & Wellness', totalCampaigns: 2, activeCampaigns: 1, totalKOLs: 4, totalViews: 150000, avgEngagementRate: 8.1, avgConversionRate: 5.8, totalPayment: 75000000, score: 81.2 },
  { rank: 4, brandId: 'b2', brandName: 'SunRise Bakery', industry: 'Food & Beverage', totalCampaigns: 2, activeCampaigns: 1, totalKOLs: 5, totalViews: 45000, avgEngagementRate: 5.8, avgConversionRate: 6.2, totalPayment: 45000000, score: 68.5 },
];

// ─── HELPER DATA ─────────────────────────────────────────────────────
export const nicheColors: Record<string, string> = {
  'Skincare': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'Beauty': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  'Fitness': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'Food & Lifestyle': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Tech': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Sports': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'Electronics': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
};

export const nicheLabels: Record<string, string> = {
  'Skincare': 'Chăm sóc da',
  'Beauty': 'Làm đẹp',
  'Fitness': 'Thể hình',
  'Food & Lifestyle': 'Ẩm thực & Đời sống',
  'Tech': 'Công nghệ',
  'Sports': 'Thể thao',
  'Electronics': 'Điện tử',
};

export const productCategories = [
  'Skincare',
  'Beauty',
  'Food',
  'Fitness',
  'Tech',
  'Electronics',
  'Sports',
  'Fashion',
  'Travel',
  'Wellness',
];

export const saasPlans = [
  { name: 'Starter', price: 990000, maxKOLs: 10, maxCampaigns: 3, features: ['Quản lý 10 KOL/KOC', '3 chiến dịch', 'Báo cáo cơ bản', 'Hỗ trợ email'] },
  { name: 'Agency', price: 2990000, maxKOLs: 100, maxCampaigns: 25, features: ['Quản lý 100 KOL/KOC', '25 chiến dịch', 'Báo cáo nâng cao', 'Hỗ trợ ưu tiên', 'Multi-brand dashboard'] },
  { name: 'Enterprise', price: 7990000, maxKOLs: 'Unlimited', maxCampaigns: 'Unlimited', features: ['KOL/KOC không giới hạn', 'Chiến dịch không giới hạn', 'API access', 'SSO', 'Dedicated account manager', 'SLA commitment'] },
];

// ─── CALCULATIONS ────────────────────────────────────────────────────
export function calculateEngagementRate(likes: number, comments: number, shares: number, saves: number, views: number): number {
  if (views === 0) return 0;
  return ((likes + comments + shares + saves) / views) * 100;
}

export function calculateConversionRate(conversions: number, views: number): number {
  if (views === 0) return 0;
  return (conversions / views) * 100;
}

export function calculateAverageViews(totalViews: number, postCount: number): number {
  if (postCount === 0) return 0;
  return totalViews / postCount;
}

export function calculateTaskProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return (completedTasks / totalTasks) * 100;
}

export function calculateRankingScore(views: number, engagementRate: number, conversionRate: number, taskCompletion: number): number {
  // Score formula: views * 0.3 + engagement_rate * 0.3 + conversion_rate * 0.3 + task_completion * 0.1
  // Normalized views (in millions), rates as percentages
  return (views / 1000000) * 30 + engagementRate * 0.3 + conversionRate * 0.3 + taskCompletion * 10;
}

// ─── SYSTEM STATS (for Admin) ────────────────────────────────────────
export const systemStats = {
  totalBrands: brands.length,
  totalCampaigns: campaigns.length,
  totalKOLs: kols.length,
  totalProducts: products.length,
  totalViews: campaigns.reduce((sum, c) => sum + c.totalViews, 0),
  avgEngagementRate: campaigns.reduce((sum, c) => sum + c.avgEngagementRate, 0) / campaigns.length,
  avgConversionRate: campaigns.reduce((sum, c) => sum + c.totalConversions, 0) / campaigns.reduce((sum, c) => sum + c.totalViews, 0) * 100,
  totalPayment: payments.reduce((sum, p) => sum + p.totalAmount, 0),
  activeCampaigns: campaigns.filter(c => c.status === 'active' || c.status === 'tracking').length,
  pendingPayments: payments.filter(p => p.status === 'pending').length,
};
