/**
 * Seed data cho MockDB — chạy lần đầu khi localStorage rỗng.
 * Mỗi collection có ≥30 record đa dạng để demo và test.
 */

import type { SeedData } from './db';

const isoDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const LEAD_NAMES = [
  'Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Hoàng D', 'Hoàng Lan E',
  'Đặng Quốc F', 'Bùi Thị G', 'Vũ Đức H', 'Ngô Đình E', 'Trần Văn I',
  'Hoàng Corp', 'Nguyễn Thị K', 'Phạm Thị Dung', 'Công ty XYZ', 'Lý Gia H',
  'Vũ Thị F', 'Đỗ Quang M', 'Bùi Văn N', 'Lê Thị O', 'Trịnh Văn P',
  'Đào Thị Q', 'Mai Văn R', 'Hồ Thị S', 'Tô Văn T', 'Lưu Thị U',
  'Đinh Công V', 'Chu Thị W', 'Kiều Văn X', 'Tống Thị Y', 'Hà Văn Z',
  'Phan Thị AA', 'Võ Văn BB', 'Đặng Thị CC', 'Nguyễn Văn DD', 'Trương Thị EE',
  'Lê Văn FF', 'Bùi Thị GG', 'Phạm Văn HH', 'Trần Thị II', 'Lý Văn JJ',
];

const SERVICES_CATALOG = [
  { id: 'svc-1', name: 'Thành lập doanh nghiệp', category: 'doanh-nghiep' },
  { id: 'svc-2', name: 'Tư vấn hợp đồng', category: 'doanh-nghiep' },
  { id: 'svc-3', name: 'M&A — Mua bán & sáp nhập', category: 'doanh-nghiep' },
  { id: 'svc-4', name: 'FDI — Đầu tư nước ngoài', category: 'doanh-nghiep' },
  { id: 'svc-5', name: 'Luật dân sự', category: 'dan-su' },
  { id: 'svc-6', name: 'Ly hôn & tranh chấp gia đình', category: 'dan-su' },
  { id: 'svc-7', name: 'Đất đai & BĐS', category: 'dat-dai' },
  { id: 'svc-8', name: 'Luật lao động', category: 'lao-dong' },
  { id: 'svc-9', name: 'Luật hình sự', category: 'hinh-su' },
  { id: 'svc-10', name: 'Sở hữu trí tuệ', category: 'so-huu-tri-tue' },
  { id: 'svc-11', name: 'Giấy phép kinh doanh', category: 'doanh-nghiep' },
  { id: 'svc-12', name: 'Tư vấn đầu tư', category: 'doanh-nghiep' },
];

const LAWYER_NAMES = [
  { id: 'ls-1', name: 'LS. Hùng', title: 'Luật sư cao cấp', specialties: ['doanh-nghiep', 'fdi'] },
  { id: 'ls-2', name: 'LS. Mai', title: 'Luật sư', specialties: ['dat-dai', 'lao-dong'] },
  { id: 'ls-3', name: 'LS. Sơn', title: 'Luật sư cao cấp', specialties: ['ma', 'doanh-nghiep'] },
  { id: 'ls-4', name: 'LS. Hương', title: 'Luật sư', specialties: ['ly-hon', 'dan-su'] },
  { id: 'ls-5', name: 'LS. Đức', title: 'Luật sư', specialties: ['hinh-su'] },
  { id: 'ls-6', name: 'LS. Thu Hà', title: 'Luật sư', specialties: ['so-huu-tri-tue'] },
  { id: 'ls-7', name: 'LS. Quang', title: 'Luật sư', specialties: ['doanh-nghiep'] },
  { id: 'ls-8', name: 'LS. Thảo', title: 'Luật sư', specialties: ['dat-dai', 'dan-su'] },
];

const SOURCES = ['facebook', 'google_ads', 'organic', 'chatbot', 'referral', 'other'] as const;
const LEAD_STATUSES = ['new', 'contacted', 'progress', 'converted', 'lost'] as const;
const SERVICE_NAMES = SERVICES_CATALOG.map((s) => s.name);

// ─── LEADS (40 records) ──────────────────────────────────────────────────────
const leads = Array.from({ length: 40 }, (_, i) => {
  const status = LEAD_STATUSES[i % LEAD_STATUSES.length];
  const source = SOURCES[i % SOURCES.length];
  const service = SERVICE_NAMES[i % SERVICE_NAMES.length];
  const lawyer = LAWYER_NAMES[i % LAWYER_NAMES.length].name;
  const daysAgo = (i % 30) + 1;
  return {
    id: `lead-${i + 1}`,
    name: LEAD_NAMES[i] ?? `Lead #${i + 1}`,
    phone: `090${String(1000000 + i).slice(0, 7)}`,
    email: `lead${i + 1}@example.com`,
    service,
    source,
    status,
    assignedTo: lawyer.replace('LS. ', ''),
    notes: i % 3 === 0 ? 'Khách quan tâm gói tư vấn dài hạn' : undefined,
    createdAt: isoDaysAgo(daysAgo),
    updatedAt: isoDaysAgo(Math.max(0, daysAgo - (i % 5))),
  };
});

// ─── LEAD TIMELINE (60 records) ───────────────────────────────────────────────
const timelineTypes = ['note', 'call', 'email', 'status_change', 'booking_created', 'assignment_change'] as const;
const leadTimeline = leads.flatMap((lead, i) =>
  [0, 1, 2].map((k) => ({
    id: `tl-${lead.id}-${k}`,
    leadId: lead.id,
    type: timelineTypes[(i + k) % timelineTypes.length],
    content:
      k === 0
        ? 'Lead mới được tạo từ ' + lead.source
        : k === 1
        ? `Đã liên hệ qua điện thoại lần ${k}`
        : 'Cập nhật trạng thái → ' + lead.status,
    authorId: 'user-1',
    authorName: 'Lan',
    createdAt: isoDaysAgo(Math.max(0, parseInt(lead.id.split('-')[1] ?? '0') - k)),
  })),
);

// ─── LEAD NOTES (20 records) ──────────────────────────────────────────────────
const leadNotes = leads.slice(0, 20).map((lead, i) => ({
  id: `note-${i + 1}`,
  leadId: lead.id,
  content:
    i % 3 === 0
      ? 'Khách hàng cần tư vấn gấp trong tuần này'
      : i % 3 === 1
      ? 'Đã gửi báo giá qua email, chờ phản hồi'
      : 'Quan tâm dịch vụ dài hạn, cần báo giá combo',
  authorId: 'user-1',
  authorName: i % 2 === 0 ? 'Lan' : 'Minh',
  createdAt: isoDaysAgo(parseInt(lead.id.split('-')[1] ?? '0') % 20),
  updatedAt: isoDaysAgo(parseInt(lead.id.split('-')[1] ?? '0') % 20),
}));

// ─── BOOKINGS (30 records) ────────────────────────────────────────────────────
const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
const bookingMethods = ['office', 'online', 'phone'] as const;
const bookings = Array.from({ length: 30 }, (_, i) => {
  const lead = leads[i % leads.length];
  const lawyer = LAWYER_NAMES[i % LAWYER_NAMES.length].name;
  const status = bookingStatuses[i % bookingStatuses.length];
  const method = bookingMethods[i % bookingMethods.length];
  const dayOffset = (i % 14) - 7; // -7..+6
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const date = d.toISOString().slice(0, 10);
  const hour = 8 + (i % 9);
  const time = `${String(hour).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`;
  return {
    id: `bk-${i + 1}`,
    leadId: lead.id,
    customerName: lead.name,
    customerEmail: lead.email,
    customerPhone: lead.phone,
    service: lead.service,
    lawyer,
    method,
    date,
    time,
    durationMinutes: 30,
    status,
    notes: i % 4 === 0 ? 'Khách yêu cầu hóa đơn VAT' : undefined,
    reminders: [
      { type: '24h', scheduledAt: isoDaysAgo(-dayOffset - 1), sent: dayOffset < 0, channel: 'email' },
      { type: '2h', scheduledAt: isoDaysAgo(-dayOffset), sent: dayOffset < 0, channel: 'sms' },
    ],
    cancelledReason: status === 'cancelled' ? 'Khách bận đột xuất' : undefined,
    createdAt: isoDaysAgo(Math.max(1, dayOffset > 0 ? 5 : -dayOffset + 1)),
    updatedAt: isoDaysAgo(Math.max(0, dayOffset > 0 ? 1 : -dayOffset)),
  };
});

// ─── CATEGORIES & TAGS ────────────────────────────────────────────────────────
const categories = [
  { id: 'cat-1', name: 'FDI', slug: 'fdi', description: 'Đầu tư nước ngoài', postCount: 4, createdAt: isoDaysAgo(60) },
  { id: 'cat-2', name: 'Hợp đồng điện tử', slug: 'hop-dong-dien-tu', description: 'HĐĐT 2025', postCount: 6, createdAt: isoDaysAgo(60) },
  { id: 'cat-3', name: 'Doanh nghiệp', slug: 'doanh-nghiep', description: 'Tin tức doanh nghiệp', postCount: 8, createdAt: isoDaysAgo(60) },
  { id: 'cat-4', name: 'Đất đai & BĐS', slug: 'dat-dai', description: '', postCount: 5, createdAt: isoDaysAgo(60) },
  { id: 'cat-5', name: 'Ly hôn', slug: 'ly-hon', description: '', postCount: 3, createdAt: isoDaysAgo(60) },
  { id: 'cat-6', name: 'Hình sự', slug: 'hinh-su', description: '', postCount: 2, postCount_overridden: undefined as never, createdAt: isoDaysAgo(60) },
  { id: 'cat-7', name: 'Lao động', slug: 'lao-dong', description: '', postCount: 2, createdAt: isoDaysAgo(60) },
  { id: 'cat-8', name: 'Sở hữu trí tuệ', slug: 'so-huu-tri-tue', description: '', postCount: 1, createdAt: isoDaysAgo(60) },
];
const tagColors = ['#1E3A5F', '#C9A84C', '#2563EB', '#059669', '#7C3AED', '#DC2626'];
const tags = [
  { id: 'tag-1', name: 'FDI 2025', slug: 'fdi-2025', color: tagColors[0], postCount: 4 },
  { id: 'tag-2', name: 'HĐĐT', slug: 'hddt', color: tagColors[1], postCount: 6 },
  { id: 'tag-3', name: 'Thành lập CT', slug: 'thanh-lap-ct', color: tagColors[2], postCount: 3 },
  { id: 'tag-4', name: 'M&A', slug: 'ma', color: tagColors[3], postCount: 2 },
  { id: 'tag-5', name: 'Đất đai', slug: 'dat-dai', color: tagColors[4], postCount: 5 },
  { id: 'tag-6', name: 'Ly hôn', slug: 'ly-hon', color: tagColors[5], postCount: 3 },
];

// ─── POSTS (25 records) ──────────────────────────────────────────────────────
const postStatuses = ['draft', 'published', 'scheduled'] as const;
const posts = Array.from({ length: 25 }, (_, i) => {
  const cat = categories[i % categories.length];
  const status = i < 8 ? 'draft' : i < 22 ? 'published' : 'scheduled';
  const daysAgo = i % 60;
  const publishedAt = status === 'published' ? isoDaysAgo(daysAgo) : undefined;
  const scheduledAt = status === 'scheduled' ? isoDaysAgo(-(i + 1)) : undefined;
  return {
    id: `post-${i + 1}`,
    title: `Bài viết #${i + 1}: Hướng dẫn ${SERVICES_CATALOG[i % SERVICES_CATALOG.length].name}`,
    slug: `bai-viet-${i + 1}`,
    excerpt: 'Tóm tắt ngắn gọn về ' + cat.name,
    content: '<p>Nội dung chi tiết của bài viết...</p>',
    category: cat.id,
    tags: [tags[i % tags.length].id],
    status,
    author: LAWYER_NAMES[i % LAWYER_NAMES.length].name,
    thumbnail: undefined,
    seo: {
      metaTitle: `Bài viết #${i + 1}`,
      metaDescription: 'Mô tả ngắn SEO',
      noindex: false,
    },
    publishedAt,
    scheduledAt,
    createdAt: isoDaysAgo(daysAgo + 2),
    updatedAt: isoDaysAgo(daysAgo),
  };
});

// ─── SERVICES (12 records) ───────────────────────────────────────────────────
const services = SERVICES_CATALOG.map((s, i) => ({
  id: s.id,
  name: s.name,
  slug: s.id,
  description: `Dịch vụ ${s.name} chuyên nghiệp, đội ngũ luật sư giàu kinh nghiệm.`,
  price: 5_000_000 + (i % 6) * 1_500_000,
  duration: 60 + (i % 3) * 30,
  category: s.category,
  isActive: i % 7 !== 6,
  lawyerIds: LAWYER_NAMES.filter((_, idx) => idx % 3 === i % 3).map((l) => l.id),
  createdAt: isoDaysAgo(30 + i),
}));

// ─── LAWYERS (8 records) ─────────────────────────────────────────────────────
const lawyers = LAWYER_NAMES.map((l, i) => ({
  id: l.id,
  name: l.name,
  title: l.title,
  bio: `${l.name} có hơn ${5 + i} năm kinh nghiệm trong lĩnh vực ${l.specialties.join(', ')}.`,
  avatar: undefined,
  specialties: l.specialties,
  email: `${l.name.replace(/[^a-z]/gi, '').toLowerCase() || 'lawyer'}@vpluat.vn`,
  phone: `090${String(2000000 + i).slice(0, 7)}`,
  experience: 5 + i,
  isActive: i !== 7,
  serviceIds: SERVICES_CATALOG.filter((_, idx) => idx % 3 === i % 3).map((s) => s.id),
  rating: 4 + (i % 2) * 0.5,
  reviewCount: 12 + i * 3,
  createdAt: isoDaysAgo(60 + i * 5),
}));

// ─── LAWYER SCHEDULES (8 × 7 days) ──────────────────────────────────────────
const lawyerSchedules = lawyers.flatMap((lawyer) =>
  [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    id: `sched-${lawyer.id}-${dayOfWeek}`,
    lawyerId: lawyer.id,
    dayOfWeek,
    isOff: dayOfWeek === 0,
    slots: dayOfWeek === 0 ? [] : [
      { start: '08:00', end: '12:00' },
      { start: '13:30', end: '17:30' },
    ],
    effectiveFrom: isoDaysAgo(60),
    effectiveTo: undefined,
  })),
);

// ─── REVIEWS (30 records) ────────────────────────────────────────────────────
const reviewStatuses = ['pending', 'approved', 'rejected'] as const;
const reviews = Array.from({ length: 30 }, (_, i) => {
  const rating = ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5;
  const status = reviewStatuses[i % reviewStatuses.length];
  const reply = status === 'approved' && i % 2 === 0 ? 'Cảm ơn quý khách đã tin tưởng Văn Phòng Luật!' : undefined;
  return {
    id: `rv-${i + 1}`,
    authorName: LEAD_NAMES[i] ?? `Khách #${i + 1}`,
    authorEmail: `reviewer${i + 1}@gmail.com`,
    rating,
    content: `Đánh giá ${rating} sao cho dịch vụ ${SERVICES_CATALOG[i % SERVICES_CATALOG.length].name}.`,
    service: SERVICES_CATALOG[i % SERVICES_CATALOG.length].name,
    lawyer: LAWYER_NAMES[i % LAWYER_NAMES.length].name,
    status,
    reply,
    repliedByName: reply ? 'Admin' : undefined,
    repliedAt: reply ? isoDaysAgo((i % 10) + 1) : undefined,
    createdAt: isoDaysAgo((i % 20) + 1),
  };
});

// ─── REVIEW REPORTS (3 records) ──────────────────────────────────────────────
const reviewReports = [
  { id: 'rr-1', reviewId: 'rv-2', reason: 'spam', description: 'Nội dung quảng cáo', reportedByName: 'Ẩn danh', status: 'pending', createdAt: isoDaysAgo(2) },
  { id: 'rr-2', reviewId: 'rv-5', reason: 'inappropriate', reportedByName: 'Nguyễn X', status: 'pending', createdAt: isoDaysAgo(1) },
  { id: 'rr-3', reviewId: 'rv-8', reason: 'fake', reportedByName: 'Trần Y', status: 'pending', createdAt: isoDaysAgo(3) },
];

// ─── CHATBOT SESSIONS (20 records) ──────────────────────────────────────────
const intents = ['Tư vấn FDI', 'Phí dịch vụ', 'Đặt lịch hẹn', 'Hỏi về thủ tục', 'Khác'];
const chatbotSessions = Array.from({ length: 20 }, (_, i) => {
  const lead = leads[i % leads.length];
  const intent = intents[i % intents.length];
  const startedAt = isoDaysAgo((i % 15) + 1);
  const endedAt = i % 3 === 0 ? undefined : isoDaysAgo((i % 15) + 1);
  return {
    id: `cs-${i + 1}`,
    sessionId: `sess-${1000 + i}`,
    userName: lead.name,
    userPhone: lead.phone,
    intent,
    startedAt,
    endedAt,
    status: i % 3 === 0 ? 'active' : 'ended',
    messageCount: 5 + (i % 10),
    handoff: i % 4 === 0 ? { to: 'LS. Hùng', at: endedAt ?? startedAt } : null,
    messages: [
      { from: 'user', content: 'Tôi muốn hỏi về ' + intent, timestamp: startedAt },
      { from: 'bot', content: 'Chào anh/chị! Văn Phòng Luật hỗ trợ tư vấn...', timestamp: startedAt },
      { from: 'user', content: 'Phí tư vấn bao nhiêu?', timestamp: startedAt },
      { from: 'bot', content: 'Phí tư vấn từ 5 triệu đồng...', timestamp: startedAt },
    ],
  };
});

// ─── CHATBOT INTENTS (8 records) ─────────────────────────────────────────────
const chatbotIntents = intents.map((name, i) => ({
  id: `intent-${i + 1}`,
  name,
  description: `Intent cho câu hỏi về ${name}`,
  sampleUtterances: [
    `Tôi muốn hỏi về ${name}`,
    `Cho tôi biết thêm về ${name}`,
    `Phí cho ${name} bao nhiêu?`,
  ],
  responseTemplate: `Chào anh/chị! Về ${name}, Văn Phòng Luật hỗ trợ...`,
  handoffToLawyerId: i < 4 ? LAWYER_NAMES[i].id : undefined,
  handoffToLawyerName: i < 4 ? LAWYER_NAMES[i].name : undefined,
  isActive: true,
  matchCount: 20 + i * 5,
  createdAt: isoDaysAgo(30),
  updatedAt: isoDaysAgo(5),
}));

// ─── SUBSCRIBERS (50 records) ───────────────────────────────────────────────
const subscriberDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'vpluat.vn'];
const subscribers = Array.from({ length: 50 }, (_, i) => ({
  id: `sub-${i + 1}`,
  email: `subscriber${i + 1}@${subscriberDomains[i % subscriberDomains.length]}`,
  subscribedAt: isoDaysAgo((i % 90) + 1),
  status: i % 10 === 9 ? 'unsubscribed' : 'active',
}));

// ─── CAMPAIGNS (8 records) ───────────────────────────────────────────────────
const campaignStatuses = ['draft', 'sent', 'scheduled'] as const;
const campaigns = Array.from({ length: 8 }, (_, i) => {
  const status = campaignStatuses[i % campaignStatuses.length];
  const sentAt = status === 'sent' ? isoDaysAgo((i % 20) + 1) : undefined;
  const scheduledAt = status === 'scheduled' ? isoDaysAgo(-(i + 1)) : undefined;
  return {
    id: `camp-${i + 1}`,
    subject: `Bản tin #${i + 1} — Cập nhật pháp luật`,
    body: '<p>Nội dung bản tin...</p>',
    status,
    sentAt,
    scheduledAt,
    recipientCount: 1000 + i * 50,
    openRate: 0.25 + (i % 5) * 0.05,
    clickRate: 0.05 + (i % 3) * 0.02,
    bounceRate: 0.01,
    unsubRate: 0.005,
    createdAt: isoDaysAgo((i % 30) + 2),
  };
});

// ─── NEWSLETTER TEMPLATES (3 records) ────────────────────────────────────────
const newsletterTemplates = [
  { id: 'tpl-1', name: 'Standard Header', subject: '{{subject}}', body: '<header>...</header><main>{{content}}</main>', isDefault: true, createdAt: isoDaysAgo(60) },
  { id: 'tpl-2', name: 'Promo', subject: '[Ưu đãi] {{subject}}', body: '<div class="promo">{{content}}</div>', isDefault: false, createdAt: isoDaysAgo(30) },
  { id: 'tpl-3', name: 'Plain Text', subject: '{{subject}}', body: '<pre>{{content}}</pre>', isDefault: false, createdAt: isoDaysAgo(15) },
];

// ─── LANDING PAGES (5 records) ──────────────────────────────────────────────
const landingPages = [
  {
    id: 'lp-1',
    title: 'Tư vấn FDI 2025',
    slug: 'fdi-2025',
    description: 'Landing page tư vấn đầu tư nước ngoài',
    targetAudience: 'fdi',
    status: 'published',
    isVariant: false,
    parentPageId: undefined,
    variantLabel: undefined,
    blocks: [
      { id: 'b1', type: 'hero', order: 0, props: { headline: 'Tư vấn FDI chuyên sâu 2025', subheadline: 'Đội ngũ luật sư hàng đầu', ctaText: 'Tư vấn ngay', ctaLink: '/booking' } },
      { id: 'b2', type: 'services', order: 1, props: { serviceIds: ['svc-4', 'svc-3'] } },
      { id: 'b3', type: 'lead-form', order: 2, props: { submitText: 'Gửi yêu cầu' } },
    ],
    seo: { metaTitle: 'Tư vấn FDI 2025', metaDescription: 'Tư vấn đầu tư nước ngoài chuyên sâu', noindex: false },
    publishedAt: isoDaysAgo(7),
    createdAt: isoDaysAgo(14),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: 'lp-2',
    title: 'Ly hôn & Tranh chấp',
    slug: 'ly-hon',
    description: 'Landing page dịch vụ ly hôn',
    targetAudience: 'individual',
    status: 'published',
    isVariant: false,
    parentPageId: undefined,
    variantLabel: undefined,
    blocks: [
      { id: 'b4', type: 'hero', order: 0, props: { headline: 'Tư vấn ly hôn thấu tình đạt lý', ctaText: 'Đặt lịch tư vấn', ctaLink: '/booking' } },
      { id: 'b5', type: 'testimonials', order: 1, props: { limit: 6 } },
    ],
    seo: { metaTitle: 'Tư vấn ly hôn', metaDescription: '', noindex: false },
    publishedAt: isoDaysAgo(14),
    createdAt: isoDaysAgo(30),
    updatedAt: isoDaysAgo(5),
  },
  {
    id: 'lp-3',
    title: 'Doanh nghiệp Mới',
    slug: 'doanh-nghiep-moi',
    description: 'Dịch vụ thành lập doanh nghiệp',
    targetAudience: 'enterprise',
    status: 'draft',
    isVariant: false,
    parentPageId: undefined,
    variantLabel: undefined,
    blocks: [],
    seo: { metaTitle: '', metaDescription: '', noindex: false },
    publishedAt: undefined,
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: 'lp-4',
    title: 'Sở hữu trí tuệ',
    slug: 'so-huu-tri-tue',
    description: 'Đăng ký bảo hộ',
    targetAudience: 'enterprise',
    status: 'published',
    isVariant: false,
    parentPageId: undefined,
    variantLabel: undefined,
    blocks: [{ id: 'b6', type: 'hero', order: 0, props: { headline: 'SHTT toàn diện', ctaText: 'Tư vấn', ctaLink: '/booking' } }],
    seo: { metaTitle: 'SHTT', metaDescription: '', noindex: false },
    publishedAt: isoDaysAgo(30),
    createdAt: isoDaysAgo(45),
    updatedAt: isoDaysAgo(10),
  },
  {
    id: 'lp-5',
    title: 'FDI Variant B',
    slug: 'fdi-2025-b',
    description: 'A/B test cho FDI',
    targetAudience: 'fdi',
    status: 'published',
    isVariant: true,
    parentPageId: 'lp-1',
    variantLabel: 'B' as const,
    blocks: [
      { id: 'b7', type: 'hero', order: 0, props: { headline: 'Đầu tư FDI — An tâm pháp lý', ctaText: 'Bắt đầu', ctaLink: '/booking' } },
    ],
    seo: { metaTitle: 'FDI 2025 B', metaDescription: '', noindex: false },
    publishedAt: isoDaysAgo(5),
    createdAt: isoDaysAgo(10),
    updatedAt: isoDaysAgo(1),
  },
];

// ─── USERS (8 records) ──────────────────────────────────────────────────────
const userRoles = ['super_admin', 'admin', 'lawyer', 'staff'];
const users = [
  { id: 'user-1', name: 'Lan (Admin)', email: 'lan@vpluat.vn', role: 'admin', isActive: true, lastLoginAt: isoDaysAgo(0), createdAt: isoDaysAgo(180) },
  { id: 'user-2', name: 'Minh (CSKH)', email: 'minh@vpluat.vn', role: 'staff', isActive: true, lastLoginAt: isoDaysAgo(1), createdAt: isoDaysAgo(120) },
  { id: 'user-3', name: 'LS. Hùng', email: 'hung@vpluat.vn', role: 'lawyer', isActive: true, lastLoginAt: isoDaysAgo(0), createdAt: isoDaysAgo(150) },
  { id: 'user-4', name: 'LS. Mai', email: 'mai@vpluat.vn', role: 'lawyer', isActive: true, lastLoginAt: isoDaysAgo(2), createdAt: isoDaysAgo(150) },
  { id: 'user-5', name: 'LS. Sơn', email: 'son@vpluat.vn', role: 'lawyer', isActive: true, lastLoginAt: isoDaysAgo(3), createdAt: isoDaysAgo(150) },
  { id: 'user-6', name: 'LS. Hương', email: 'huong@vpluat.vn', role: 'lawyer', isActive: true, lastLoginAt: isoDaysAgo(5), createdAt: isoDaysAgo(150) },
  { id: 'user-7', name: 'Super Admin', email: 'admin@vpluat.vn', role: 'super_admin', isActive: true, lastLoginAt: isoDaysAgo(0), createdAt: isoDaysAgo(365) },
  { id: 'user-8', name: 'Cựu Staff', email: 'old@vpluat.vn', role: 'staff', isActive: false, lastLoginAt: isoDaysAgo(60), createdAt: isoDaysAgo(200) },
];

// ─── ROLES (4 records) ──────────────────────────────────────────────────────
const allPermissions = [
  'crm.read', 'crm.write', 'crm.delete',
  'booking.read', 'booking.write', 'booking.delete',
  'blog.read', 'blog.write', 'blog.publish', 'blog.delete',
  'services.read', 'services.write',
  'lawyers.read', 'lawyers.write',
  'reviews.read', 'reviews.moderate', 'reviews.reply',
  'chatbot.read', 'chatbot.train',
  'newsletter.read', 'newsletter.send',
  'landing.read', 'landing.write', 'landing.publish',
  'users.read', 'users.write', 'users.impersonate',
  'settings.read', 'settings.write',
  'audit.read',
];
const roles = [
  { id: 'role-1', name: 'Super Admin', description: 'Toàn quyền', permissions: allPermissions, isSystem: true, memberCount: 1, createdAt: isoDaysAgo(365) },
  { id: 'role-2', name: 'Admin', description: 'Quản lý hầu hết module, trừ Users/Settings', permissions: allPermissions.filter((p) => !p.startsWith('users.') && p !== 'settings.write' && p !== 'users.impersonate'), isSystem: true, memberCount: 1, createdAt: isoDaysAgo(300) },
  { id: 'role-3', name: 'Lawyer', description: 'Luật sư, xem CRM, Bookings, Blog', permissions: ['crm.read', 'crm.write', 'booking.read', 'booking.write', 'blog.read', 'blog.write', 'reviews.read', 'reviews.reply', 'chatbot.read', 'chatbot.train'], isSystem: true, memberCount: 4, createdAt: isoDaysAgo(250) },
  { id: 'role-4', name: 'Staff', description: 'CSKH, xem + cập nhật', permissions: ['crm.read', 'crm.write', 'booking.read', 'booking.write', 'blog.read', 'reviews.read'], isSystem: true, memberCount: 2, createdAt: isoDaysAgo(200) },
];

// ─── AUDIT LOGS (50 records) ────────────────────────────────────────────────
const auditLogs = leads.slice(0, 30).map((lead, i) => ({
  id: `al-${i + 1}`,
  actorId: 'user-1',
  actorName: 'Lan',
  action: i % 4 === 0 ? 'create' : i % 4 === 1 ? 'update' : i % 4 === 2 ? 'status_change' : 'assign',
  entity: 'lead',
  entityId: lead.id,
  entityLabel: lead.name,
  diff: i % 2 === 0 ? { before: { status: 'new' }, after: { status: lead.status } } : undefined,
  createdAt: lead.updatedAt,
}));

// ─── NOTIFICATIONS (12 records) ─────────────────────────────────────────────
const notifications = [
  { id: 'n-1', type: 'lead_new', title: 'Lead mới từ Facebook', message: 'Nguyễn Văn A vừa đăng ký tư vấn', link: '/admin/crm', icon: 'UserPlus', channels: ['in_app', 'email'], read: false, createdAt: isoDaysAgo(0) },
  { id: 'n-2', type: 'booking_upcoming', title: 'Booking sắp diễn ra', message: '14:30 LS. Hùng ↔ Trần B', link: '/admin/bookings', icon: 'CalendarCheck', channels: ['in_app'], read: false, createdAt: isoDaysAgo(0) },
  { id: 'n-3', type: 'review_new', title: 'Đánh giá mới 5⭐', message: 'Hoàng Minh đánh giá FDI', link: '/admin/reviews', icon: 'Star', channels: ['in_app'], read: false, createdAt: isoDaysAgo(1) },
  { id: 'n-4', type: 'system', title: 'Backup hoàn tất', message: 'DB đã được sao lưu lúc 03:00', link: undefined, icon: 'Database', channels: ['in_app'], read: true, createdAt: isoDaysAgo(1) },
  { id: 'n-5', type: 'lead_new', title: 'Lead mới từ Chatbot', message: 'Phạm Dung hỏi về FDI', link: '/admin/crm', icon: 'UserPlus', channels: ['in_app'], read: false, createdAt: isoDaysAgo(2) },
  { id: 'n-6', type: 'booking_cancelled', title: 'Booking bị hủy', message: 'Lê Văn C hủy lịch 15:30', link: '/admin/bookings', icon: 'CalendarX2', channels: ['in_app', 'email'], read: true, createdAt: isoDaysAgo(2) },
  { id: 'n-7', type: 'campaign_sent', title: 'Campaign đã gửi', message: '"Bản tin #1" gửi tới 1180 subscribers', link: '/admin/newsletter', icon: 'Mail', channels: ['in_app'], read: true, createdAt: isoDaysAgo(3) },
  { id: 'n-8', type: 'lead_new', title: 'Lead mới từ Google Ads', message: 'Công ty XYZ đăng ký', link: '/admin/crm', icon: 'UserPlus', channels: ['in_app', 'email'], read: true, createdAt: isoDaysAgo(3) },
  { id: 'n-9', type: 'review_new', title: 'Đánh giá 1⭐ cần duyệt', message: 'Đánh giá tiêu cực về ly hôn', link: '/admin/reviews', icon: 'Star', channels: ['in_app'], read: false, createdAt: isoDaysAgo(4) },
  { id: 'n-10', type: 'system', title: 'Cập nhật hệ thống', message: 'Phiên bản 1.2.0 đã sẵn sàng', link: undefined, icon: 'Settings', channels: ['in_app'], read: true, createdAt: isoDaysAgo(5) },
  { id: 'n-11', type: 'booking_upcoming', title: 'Reminder 24h', message: 'LS. Sơn ↔ Hoàng Corp ngày mai', link: '/admin/bookings', icon: 'CalendarCheck', channels: ['in_app', 'email', 'sms'], read: true, createdAt: isoDaysAgo(5) },
  { id: 'n-12', type: 'lead_new', title: 'Lead từ Referral', message: 'Vũ Đức H được giới thiệu', link: '/admin/crm', icon: 'UserPlus', channels: ['in_app'], read: true, createdAt: isoDaysAgo(7) },
];

// ─── SETTINGS (1 record) ────────────────────────────────────────────────────
const settings = [
  {
    id: 'singleton',
    siteName: 'Văn Phòng Luật',
    hotline: '+84 901 234 567',
    email: 'contact@vpluat.vn',
    address: 'Tầng 12, Tòa nhà X, Hà Nội',
    workingHours: { start: '08:00', end: '17:30', daysOff: ['0', '6'] },
    slotDuration: 30,
    bookingLeadTime: 2,
    maxBookingsPerDay: 20,
    allowOnline: true,
    allowPhone: true,
    autoConfirm: false,
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    emailSettings: {
      fromName: 'Văn Phòng Luật',
      fromEmail: 'news@vpluat.vn',
      replyTo: 'contact@vpluat.vn',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'news@vpluat.vn',
      smtpPassword: '••••••••',
      useTLS: true,
    },
    theme: {
      logoUrl: undefined,
      faviconUrl: undefined,
      primaryColor: '#1E3A5F',
      accentColor: '#C9A84C',
      fontFamily: 'plus-jakarta' as const,
    },
    integrations: {
      sentryDsn: '',
      posthogApiKey: '',
      posthogHost: 'https://app.posthog.com',
      gaTrackingId: '',
      chatbotWebhookUrl: '',
    },
  },
];

export const SEED_DATA: SeedData = {
  leads,
  lead_timeline: leadTimeline,
  lead_notes: leadNotes,
  bookings,
  posts,
  post_revisions: [],
  categories,
  tags,
  services,
  lawyers,
  lawyer_schedules: lawyerSchedules,
  reviews,
  review_reports: reviewReports,
  chatbot_sessions: chatbotSessions,
  chatbot_intents: chatbotIntents,
  subscribers,
  campaigns,
  newsletter_templates: newsletterTemplates,
  landing_pages: landingPages,
  users,
  roles,
  audit_logs: auditLogs,
  notifications,
  settings,
};
