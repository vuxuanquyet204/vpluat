export type ServiceCategory =
  | 'doanh-nghiep'
  | 'dan-su'
  | 'hinh-su'
  | 'dat-dai'
  | 'hon-nhan'
  | 'so-huu-tri-tue'
  | 'lao-dong'
  | 'thuong-mai';

export type ServiceColor = 'primary' | 'accent' | 'green' | 'red' | 'blue' | 'purple';

// Flexible service type that accepts both strict types and API string responses
export interface Service {
  id: string;
  slug: string;
  name: string;
  title?: string;
  shortDescription: string;
  description: string;
  category: ServiceCategory | string;
  price?: number;
  duration?: string;
  fee?: string;
  icon?: string;
  color?: ServiceColor | string;
  features?: string[];
  lawyerId?: string;
  lawyerIds?: string[];
  benefits?: string[];
  faqIds?: string[];
  popular?: boolean;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceCategoryFilter {
  id: 'all' | ServiceCategory;
  label: string;
  icon: string;
}
