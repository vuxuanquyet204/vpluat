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
  AppointmentSummary,
} from './admin-dashboard';

export { leadApi, reviewApi, serviceApi, lawyerApi, chatbotApi, newsletterApi } from './admin-crm';
export type {
  Lead,
  Review,
  LeadTimelineEntry,
  Service,
  Lawyer,
  ChatbotSession,
  Subscriber,
  Campaign,
  Booking,
} from './admin-crm';

export { bookingApi, lawyerScheduleApi } from './admin-booking';
export type {
  Appointment,
  BookingStats,
  LawyerSchedule,
} from './admin-booking';

export { postApi, documentApi, auditLogApi, reportsApi, landingPageApi, notificationApi, leadPipelineApi, categoryApi, tagApi } from './admin-content';
export type {
  Post,
  LandingPage,
  Notification,
  LeadPipelineStats,
  Category,
  CategoryCreateRequest,
  Tag,
} from './admin-content';

export { userApi, roleApi, settingsApi, meApi, auditApi } from './admin-core';
export type {
  AdminUser,
  Role,
  SystemSettings,
  AuditLogEntry,
} from './admin-core';
