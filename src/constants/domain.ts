import type { CampaignStatus, DraftStatus, MetricStatus, PaymentStatus, TaskStatus } from '../types/database';

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  DRAFT: 'Bản nháp', ACTIVE: 'Đang chạy', PAUSED: 'Tạm dừng', TRACKING: 'Theo dõi',
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  ASSIGNED: 'Đã phân công', DRAFT_SUBMITTED: 'Đã nộp bản nháp', REVISION_REQUIRED: 'Yêu cầu chỉnh sửa',
  APPROVED_TO_PUBLISH: 'Được phép đăng', PUBLISHED: 'Đã đăng bài', TRACKING: 'Đang theo dõi',
  METRICS_SUBMITTED: 'Đã gửi metrics', METRICS_APPROVED: 'Đã duyệt metrics', COMPLETED: 'Hoàn thành',
  PAYMENT_PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán', CANCELLED: 'Đã hủy',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán', PENDING: 'Đang chờ', PARTIAL_PAID: 'Thanh toán một phần',
  PAID: 'Đã thanh toán', HOLD: 'Tạm giữ', REJECTED: 'Bị từ chối',
};

export const draftStatusLabels: Record<DraftStatus, string> = {
  SUBMITTED: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Cần chỉnh sửa',
};

export const metricStatusLabels: Record<MetricStatus, string> = {
  SUBMITTED: 'Chờ xác minh', APPROVED: 'Đã xác minh', REJECTED: 'Bị từ chối',
};

export const statusBadgeClass = (status: string) => {
  if (['ACTIVE', 'APPROVED', 'COMPLETED', 'PAID', 'METRICS_APPROVED'].includes(status)) return 'badge-success';
  if (['REJECTED', 'CANCELLED', 'REVISION_REQUIRED'].includes(status)) return 'badge-danger';
  if (['PENDING', 'PAUSED', 'HOLD', 'PAYMENT_PENDING'].includes(status)) return 'badge-warning';
  if (['DRAFT', 'ASSIGNED', 'SUBMITTED', 'DRAFT_SUBMITTED', 'PUBLISHED', 'TRACKING', 'METRICS_SUBMITTED'].includes(status)) return 'badge-info';
  return 'badge-neutral';
};

export const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value ?? 0);

export const formatDate = (value: string | null | undefined) => value
  ? new Intl.DateTimeFormat('vi-VN').format(new Date(value))
  : '—';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
};
