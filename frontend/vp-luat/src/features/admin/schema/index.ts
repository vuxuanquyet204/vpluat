/**
 * Zod schemas for all admin forms.
 */

export { leadSchema, type LeadFormValues } from './lead.schema';
export { leadNoteSchema, type LeadNoteFormValues } from './lead-note.schema';
export {
  bookingSchema,
  rescheduleSchema,
  cancelSchema,
  type BookingFormValues,
} from './booking.schema';
export {
  postSchema,
  categorySchema,
  tagSchema,
  seoSchema,
  type PostFormValues,
  type CategoryFormValues,
  type TagFormValues,
} from './post.schema';
export {
  serviceSchema,
  lawyerSchema,
  type ServiceFormValues,
  type LawyerFormValues,
} from './services.schema';
export {
  replySchema,
  resolveReportSchema,
  type ReplyFormValues,
  type ResolveReportFormValues,
} from './review.schema';
export {
  subscriberSchema,
  campaignSchema,
  templateSchema,
  type SubscriberFormValues,
  type CampaignFormValues,
  type TemplateFormValues,
  type ImportedRow,
} from './newsletter.schema';
export {
  userFormSchema,
  roleFormSchema,
  type UserFormValues,
  type RoleFormValues,
} from './user.schema';
export {
  generalSettingsSchema,
  bookingSettingsSchema,
  smtpSettingsSchema,
  themeSettingsSchema,
  integrationsSettingsSchema,
  auditFilterSchema,
  ALL_DAYS,
  FONT_OPTIONS,
  TIMEZONES,
  LANGUAGES,
  SLOT_DURATIONS,
  type GeneralSettingsValues,
  type BookingSettingsValues,
  type SmtpSettingsValues,
  type ThemeSettingsValues,
  type IntegrationsSettingsValues,
  type AuditFilterValues,
} from './settings.schema';
export {
  landingPageFormSchema,
  landingSeoSchema,
  heroPropsSchema,
  textPropsSchema,
  imagePropsSchema,
  ctaPropsSchema,
  leadFormPropsSchema,
  testimonialsPropsSchema,
  pricingPropsSchema,
  reviewsPropsSchema,
  faqPropsSchema,
  newsPropsSchema,
  lawyersPropsSchema,
  mapPropsSchema,
  contactPropsSchema,
  type LandingPageFormValues,
  type HeroFormValues,
  type TextFormValues,
  type ImageFormValues,
  type CtaFormValues,
  type LeadFormBlockFormValues,
  type TestimonialsFormValues,
  type PricingFormValues,
  type ReviewsFormValues,
  type FaqFormValues,
  type NewsFormValues,
  type LawyersFormValues,
  type MapFormValues,
  type ContactFormValues,
} from './landing-page.schema';
export { intentSchema, type IntentFormValues } from './intent.schema';