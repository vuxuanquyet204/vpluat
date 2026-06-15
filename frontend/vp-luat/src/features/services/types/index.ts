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

export interface Service {
  id: string;
  slug: string;
  name: string;
  title?: string;
  shortDescription: string;
  description: string;
  category: ServiceCategory;
  price: number;
  duration: string;
  fee?: string;
  icon: string;
  color: ServiceColor;
  features: string[];
  lawyerId: string;
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
