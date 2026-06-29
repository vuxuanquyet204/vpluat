// Re-exports for the API layer.
export { apiClient } from './client';
export { serverFetch } from './server-client';
export { queryClient } from './query-client';
export { useApiQuery, useApiMutation, api } from './hooks';
export type { ApiEnvelope, PageResponse } from './hooks';

export { adminDashboardApi } from './admin-dashboard';
export type {
  DashboardStats,
  TimeSeriesPoint,
  DistributionSlice,
  LeadFunnel,
  ActivityLog,
} from './admin-dashboard';

export { leadApi, reviewApi } from './admin-crm';
export type { Lead, Review } from './admin-crm';

export { bookingApi, lawyerScheduleApi } from './admin-booking';
export type { Appointment, LawyerSchedule } from './admin-booking';

export { postApi, documentApi, auditLogApi, chatbotApi, reportsApi } from './admin-content';
export type { Post } from './admin-content';
