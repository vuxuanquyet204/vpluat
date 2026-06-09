import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout';
import {
  getLandingPageBySlug,
  pickLandingPageVariant,
  publicPageSlugs,
  resolveLandingPageVariant,
} from '@/features/landing-pages';
import { PublicPageRenderer } from '@/features/landing-pages/components';
import { buildAbsoluteUrl, getSiteUrl } from '@/lib/site';

interface PublicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateStaticParams() {
  return publicPageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Pick<PublicPageProps, 'params'>): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);

  if (!page) {
    return {
      title: 'Không tìm thấy trang',
    };
  }

  const pageUrl = buildAbsoluteUrl(page.slug);

  return {
    title: page.seoTitle ?? page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: page.seoTitle ?? page.title,
      description: page.description,
      type: 'website',
      url: pageUrl,
      images: [
        {
          url: buildAbsoluteUrl('og-default.jpg'),
          width: 1200,
          height: 630,
          alt: 'VP Luật Hùng & Cộng sự',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle ?? page.title,
      description: page.description,
      images: [buildAbsoluteUrl('og-default.jpg')],
    },
  };
}

export default async function PublicPage({ params, searchParams }: PublicPageProps) {
  const { slug } = await params;
  const { variant } = await searchParams;
  const page = getLandingPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const safeVariant = typeof variant === 'string' && /^[a-zA-Z0-9_-]+$/.test(variant) ? variant : undefined;
  const selectedVariantKey = pickLandingPageVariant(page, safeVariant);
  const selectedVariant = resolveLandingPageVariant(page, selectedVariantKey);
  const faqBlock = page.blocks.find((block) => block.type === 'faq');
  const pageUrl = buildAbsoluteUrl(page.slug);
  const structuredData: Array<Record<string, unknown>> = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.seoTitle ?? page.title,
      description: page.description,
      url: pageUrl,
      inLanguage: 'vi-VN',
      isPartOf: {
        '@type': 'WebSite',
        name: 'VP Luật Hùng & Cộng sự',
        url: getSiteUrl(),
      },
    },
  ];

  if (faqBlock && faqBlock.type === 'faq') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqBlock.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  return (
    <>
      <Navbar />
      <main className="public-page-shell" lang="vi">
        <PublicPageRenderer page={page} variant={selectedVariant} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </main>
    </>
  );
}
