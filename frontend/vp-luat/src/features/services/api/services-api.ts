// features/services/api/services-api.ts
// API client for public services endpoints

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import { getDisplayLabel } from '@/lib/display-labels';

export interface ServiceDTO {
  id: string;
  parentId?: string;
  slug?: string;
  name?: string;
  icon?: string;
  title?: string;
  titleEn?: string;
  excerpt?: string;
  excerptEn?: string;
  content?: string;
  contentEn?: string;
  metaTitle?: string;
  metaTitleEn?: string;
  metaDesc?: string;
  metaDescEn?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  parentName?: string;
  description?: string;
  price?: number | string;
  duration?: number | string;
  category?: string;
}

export interface ServiceApiResponse {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  price?: number;
  duration?: string;
  icon: string;
  color?: string;
  features?: string[];
  lawyerId?: string;
  lawyerIds?: string[];
  benefits?: string[];
  popular?: boolean;
  isFeatured?: boolean;
  parentName?: string;
}

interface EnglishServiceContent {
  name: string;
  shortDescription: string;
  description: string;
  duration: string;
  features: string[];
}

const ENGLISH_SERVICE_CONTENT: Record<string, EnglishServiceContent> = {
  'thanh-lap-doanh-nghiep': {
    name: 'Business Formation',
    shortDescription: 'Full-service advice and support for establishing a company or business.',
    description: 'From choosing the right business structure and name to preparing filings and obtaining the business registration certificate.',
    duration: '7-10 days',
    features: ['Business structure advice', 'Name and trademark search', 'Company charter drafting', 'Filing and license collection', 'Initial tax advice'],
  },
  'tu-van-hop-dong': {
    name: 'Contract Advice and Drafting',
    shortDescription: 'Review, advice, and drafting for civil, commercial, and employment contracts.',
    description: 'Our experienced lawyers help you create clear, enforceable contracts that protect your interests and reduce legal risk.',
    duration: '3-5 days',
    features: ['Contract clause review', 'Legal risk assessment', 'Bilingual drafting', 'Partner negotiation', 'Signing and record support'],
  },
  'ly-hon-tranh-chap': {
    name: 'Divorce and Family Disputes',
    shortDescription: 'Advice on divorce procedures, asset division, and child custody.',
    description: 'Comprehensive legal support for mutual and unilateral divorce matters, with a focus on protecting your lawful interests.',
    duration: '30-90 days',
    features: ['Divorce procedure advice', 'Marital asset division', 'Custody and support', 'Court representation', 'Confidential handling'],
  },
  'tranh-chap-dat-dai': {
    name: 'Land and Real Estate Disputes',
    shortDescription: 'Support for land disputes, property transactions, and transfers of land-use rights.',
    description: 'Legal advice and representation for complex land disputes, helping protect your lawful ownership and use rights.',
    duration: '60-180 days',
    features: ['Planning information search', 'Land origin verification', 'Sale contract drafting', 'Court representation', 'Work with government agencies'],
  },
  'dang-ky-nhan-hieu': {
    name: 'Trademark and Intellectual Property Registration',
    shortDescription: 'Protection for trademarks, logos, inventions, and copyrights in Vietnam and internationally.',
    description: 'Protect your business intellectual property with a professional, efficient trademark registration service.',
    duration: '12-18 months',
    features: ['Registrability search', 'Application preparation', 'Examination tracking', 'Vietnam and international protection', 'Infringement prevention advice'],
  },
  'tu-van-lao-dong': {
    name: 'Employment and Social Insurance Law',
    shortDescription: 'Advice on employment contracts, social insurance, dismissal, and labor disputes.',
    description: 'Support for businesses and employees dealing with employment law issues and compliance requirements.',
    duration: '5-15 days',
    features: ['Employment contract drafting', 'Termination advice', 'Labor dispute resolution', 'Social insurance advice', 'Mediation representation'],
  },
  'tu-van-thuong-mai': {
    name: 'Commercial and Investment Advice',
    shortDescription: 'Legal advice for businesses across commercial transactions, investment, and M&A.',
    description: 'We support important commercial transactions while helping your business comply with the law and maximize value.',
    duration: '15-60 days',
    features: ['M&A and restructuring advice', 'Domestic and international investment', 'Commercial contract drafting', 'Competition compliance', 'Business dispute resolution'],
  },
  'bao-chua-hinh-su': {
    name: 'Criminal Defense and Advice',
    shortDescription: 'Defense for suspects and defendants, with legal advice for people under investigation.',
    description: 'Protecting your lawful rights throughout criminal investigation, prosecution, and trial proceedings.',
    duration: 'Case-dependent',
    features: ['Detention and custody advice', 'Trial representation', 'Family representation', 'Appeal advice', 'Strict confidentiality'],
  },
  'tu-van-thue': {
    name: 'Tax and Legal Accounting Advice',
    shortDescription: 'Advice on tax and legal accounting matters for businesses and individuals.',
    description: 'Support for complex tax issues, disputes with tax authorities, and lawful tax optimization.',
    duration: '7-30 days',
    features: ['Personal and corporate tax advice', 'Tax finalization', 'Tax authority disputes', 'Transfer pricing advice', 'VAT refunds'],
  },
};

const CATEGORY_ALIASES: Record<string, string> = {
  'dat-dai-va-bat-dong-san': 'dat-dai',
  'nha-dat': 'dat-dai',
  'dat-dai': 'dat-dai',
  'doanh-nghiep': 'doanh-nghiep',
  'dan-su': 'dan-su',
  'hon-nhan': 'hon-nhan',
  'hinh-su': 'hinh-su',
  'lao-dong': 'lao-dong',
  'so-huu-tri-tue': 'so-huu-tri-tue',
  'thuong-mai': 'thuong-mai',
};

function mapServiceDto(dto: ServiceDTO, locale = 'vi'): ServiceApiResponse {
  const isEnglish = locale === 'en';
  const slug = dto.slug || '';
  const englishContent = isEnglish ? ENGLISH_SERVICE_CONTENT[slug] : undefined;
  const name = englishContent?.name || (isEnglish ? (dto.titleEn || dto.name || dto.title || slug) : (dto.name || dto.title || slug));
  const detail = englishContent?.shortDescription || (isEnglish
    ? (dto.excerptEn || dto.contentEn || dto.description || '')
    : (dto.description || ''));
  const fallbackSummary = name || slug;
  const rawCategory = (dto.category || dto.parentName || 'other').toLowerCase().replace(/\s+/g, '-');
  const category = CATEGORY_ALIASES[rawCategory] || rawCategory;
  const duration = englishContent?.duration || (typeof dto.duration === 'number' || typeof dto.duration === 'string'
    ? String(dto.duration)
    : undefined);

  return {
    id: dto.id,
    slug,
    name: isEnglish ? name : getDisplayLabel(name),
    shortDescription: detail || fallbackSummary,
    description: englishContent?.description || detail || fallbackSummary,
    category,
    price: typeof dto.price === 'number' || typeof dto.price === 'string'
      ? Number(dto.price)
      : undefined,
    duration,
    icon: dto.icon ? `fa-solid fa-${dto.icon}` : 'fa-solid fa-gavel',
    features: englishContent?.features,
    popular: dto.isFeatured || false,
    isFeatured: dto.isFeatured || false,
    parentName: isEnglish ? category : getDisplayLabel(dto.parentName, 'Khác'),
  };
}

export async function getServices(locale = 'vi'): Promise<ServiceApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ServiceDTO[]>>('/public/services');
    if (data.success && data.data) {
      return data.data.map((dto) => mapServiceDto(dto, locale));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

export async function getFeaturedServices(locale = 'vi'): Promise<ServiceApiResponse[]> {
  try {
    const { data } = await apiClient.get<ApiResponse<ServiceDTO[]>>('/public/services/featured');
    if (data.success && data.data) {
      return data.data.map((dto) => mapServiceDto(dto, locale));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch featured services:', error);
    return [];
  }
}

export async function getServiceBySlug(slug: string, locale = 'vi'): Promise<ServiceApiResponse | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<ServiceDTO>>(`/public/services/${slug}`);
    if (data.success && data.data) {
      return mapServiceDto(data.data, locale);
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch service:', error);
    return null;
  }
}
