export type NewsCategory =
  | 'tin-tuc'
  | 'nghi-dinh'
  | 'blog'
  | 'case-study'
  | 'huong-dan';

export interface NewsAuthor {
  name: string;
  initials: string;
  avatarColor: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  author: NewsAuthor;
  thumbnail?: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  isHot?: boolean;
  isFeatured?: boolean;
  toc?: Array<{ id: string; text: string }>;
}

export interface NewsCategoryFilter {
  id: 'all' | NewsCategory;
  label: string;
  count: number;
  slug: string;
}

export interface PopularPost {
  id: string;
  title: string;
  publishedAt: string;
}

export interface NewsletterPayload {
  email: string;
}
