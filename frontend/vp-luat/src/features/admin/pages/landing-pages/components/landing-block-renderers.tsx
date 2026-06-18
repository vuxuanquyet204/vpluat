'use client';

import type {
  HeroBlockProps,
  TextBlockProps,
  ImageBlockProps,
  CtaBlockProps,
  LeadFormBlockProps,
  TestimonialsBlockProps,
  PricingBlockProps,
  ReviewsBlockProps,
  FaqBlockProps,
  NewsBlockProps,
  LawyersBlockProps,
  MapBlockProps,
  ContactBlockProps,
} from '@/features/admin/types';

export function HeroBlock({ p }: { p: HeroBlockProps }) {
  const align = p.align ?? 'left';
  return (
    <section
      style={{
        padding: '60px 24px',
        background: p.backgroundImage
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${p.backgroundImage}) center/cover`
          : 'var(--primary-faint, #EFF3F8)',
        color: p.backgroundImage ? 'white' : 'var(--gray-800)',
        textAlign: align,
        borderRadius: 8,
      }}
    >
      {p.eyebrow && (
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: 1,
            opacity: 0.8,
            marginBottom: 8,
          }}
        >
          {p.eyebrow}
        </div>
      )}
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0, marginBottom: 12 }}>{p.headline}</h1>
      {p.subheadline && (
        <p
          style={{
            fontSize: '1.1rem',
            margin: 0,
            marginBottom: 24,
            opacity: 0.9,
            maxWidth: 700,
            marginLeft: align === 'center' ? 'auto' : 0,
            marginRight: align === 'center' ? 'auto' : 0,
          }}
        >
          {p.subheadline}
        </p>
      )}
      {p.ctaText && p.ctaLink && (
        <a
          href={p.ctaLink}
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: p.backgroundImage ? 'white' : 'var(--primary, #1E3A5F)',
            color: p.backgroundImage ? 'var(--primary)' : 'white',
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {p.ctaText}
        </a>
      )}
    </section>
  );
}

export function TextBlock({ p }: { p: TextBlockProps }) {
  return (
    <div
      style={{
        maxWidth: p.maxWidth ?? 800,
        margin: '0 auto',
        padding: '24px 16px',
        textAlign: p.align ?? 'left',
      }}
    >
      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{p.content}</p>
    </div>
  );
}

export function ImageBlock({ p }: { p: ImageBlockProps }) {
  return (
    <div style={{ padding: '16px 0', textAlign: 'center' }}>
      <img
        src={p.src}
        alt={p.alt}
        style={{
          maxWidth: p.width ?? '100%',
          height: 'auto',
          borderRadius: p.rounded ? 12 : 4,
        }}
      />
      {p.caption && (
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--gray-500)',
            marginTop: 8,
            fontStyle: 'italic',
          }}
        >
          {p.caption}
        </div>
      )}
    </div>
  );
}

export function CtaBlock({ p }: { p: CtaBlockProps }) {
  const variant = p.variant ?? 'primary';
  const styles: Record<typeof variant, React.CSSProperties> = {
    primary: { background: 'var(--primary, #1E3A5F)', color: 'white' },
    secondary: { background: 'var(--gray-800)', color: 'white' },
    outline: {
      background: 'transparent',
      color: 'var(--primary, #1E3A5F)',
      border: '2px solid var(--primary, #1E3A5F)',
    },
  };
  return (
    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
      <a
        href={p.link}
        style={{
          display: 'inline-block',
          padding: '14px 40px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '1rem',
          textDecoration: 'none',
          ...styles[variant],
        }}
      >
        {p.icon && <span style={{ marginRight: 6 }}>{p.icon}</span>}
        {p.text}
      </a>
    </div>
  );
}

export function LeadFormBlock({ p }: { p: LeadFormBlockProps }) {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 24,
        background: 'var(--gray-50)',
        borderRadius: 12,
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 16, textAlign: 'center' }}>
        Nhận tư vấn miễn phí
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert(p.successMessage ?? 'Đã gửi yêu cầu!');
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {p.fields.map((field) => (
          <input
            key={field}
            type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
            placeholder={fieldLabel(field)}
            required
            style={{
              padding: '10px 14px',
              border: '1px solid var(--gray-200)',
              borderRadius: 6,
              fontSize: '0.9rem',
            }}
          />
        ))}
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            background: 'var(--primary, #1E3A5F)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {p.submitText}
        </button>
      </form>
    </div>
  );
}

function fieldLabel(f: string) {
  const map: Record<string, string> = {
    name: 'Họ và tên',
    phone: 'Số điện thoại',
    email: 'Email',
    note: 'Ghi chú',
    service: 'Dịch vụ quan tâm',
  };
  return map[f] ?? f;
}

export function TestimonialsBlock({ p }: { p: TestimonialsBlockProps }) {
  const items = Array.from({ length: Math.min(p.limit, 6) }).map((_, i) => ({
    name: `Khách hàng ${i + 1}`,
    text: 'Dịch vụ tư vấn rất chuyên nghiệp, đội ngũ luật sư nhiệt tình.',
  }));
  return (
    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            padding: 16,
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ color: '#F59E0B', marginBottom: 8 }}>★★★★★</div>
          <p style={{ margin: 0, marginBottom: 8, fontSize: '0.85rem' }}>{it.text}</p>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 600 }}>
            {it.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PricingBlock({ p }: { p: PricingBlockProps }) {
  return (
    <div style={{ padding: 24 }}>
      {p.title && (
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>{p.title}</h3>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {p.serviceIds.length === 0 ? (
          <div style={{ color: 'var(--gray-500)', textAlign: 'center', fontSize: '0.85rem' }}>
            Chưa chọn dịch vụ nào
          </div>
        ) : (
          p.serviceIds.map((id) => (
            <div
              key={id}
              style={{
                padding: 16,
                background: 'var(--primary-faint, #EFF3F8)',
                borderRadius: 8,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)' }}>Dịch vụ {id}</div>
              {p.showButton && (
                <button
                  type="button"
                  style={{
                    marginTop: 8,
                    padding: '6px 16px',
                    background: 'var(--primary, #1E3A5F)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Đặt lịch
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function ReviewsBlock({ p }: { p: ReviewsBlockProps }) {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: p.layout === 'list' ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}
      >
        {Array.from({ length: Math.min(p.limit, 6) }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 6,
            }}
          >
            {p.showRating && (
              <div style={{ color: '#F59E0B', fontSize: '0.85rem', marginBottom: 4 }}>★★★★★</div>
            )}
            <div style={{ fontSize: '0.78rem' }}>Đánh giá #{i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FaqBlock({ p }: { p: FaqBlockProps }) {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      {p.title && <h3 style={{ textAlign: 'center', marginBottom: 16 }}>{p.title}</h3>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {p.items.map((it, i) => (
          <details
            key={i}
            style={{
              padding: 12,
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 6,
            }}
          >
            <summary
              style={{
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--gray-800)',
              }}
            >
              {it.question}
            </summary>
            <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--gray-600)' }}>
              {it.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function NewsBlock({ p }: { p: NewsBlockProps }) {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: p.layout === 'list' ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {Array.from({ length: Math.min(p.limit, 6) }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              background: 'var(--gray-50)',
              borderRadius: 6,
            }}
          >
            <div
              style={{
                width: '100%',
                height: 120,
                background: 'var(--gray-200, #E5E7EB)',
                borderRadius: 4,
                marginBottom: 8,
              }}
            />
            <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Bài viết #{i + 1}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Mô tả ngắn...</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LawyersBlock({ p }: { p: LawyersBlockProps }) {
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {Array.from({ length: Math.min(p.limit, 8) }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 8,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--primary-faint, #EFF3F8)',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              LS
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>LS. {i + 1}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Chuyên môn: ...</div>
            {p.showSchedule && (
              <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--primary)' }}>
                📅 Xem lịch
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MapBlock({ p }: { p: MapBlockProps }) {
  return (
    <div style={{ padding: 16 }}>
      {p.title && <h3 style={{ marginBottom: 8 }}>{p.title}</h3>}
      <iframe
        src={p.embedUrl}
        style={{
          width: '100%',
          height: p.height ?? 400,
          border: 0,
          borderRadius: 8,
        }}
        loading="lazy"
        title={p.title ?? 'Map'}
      />
    </div>
  );
}

export function ContactBlock({ p }: { p: ContactBlockProps }) {
  return (
    <div
      style={{
        padding: 24,
        display: 'grid',
        gridTemplateColumns: p.showMap ? '1fr 1fr' : '1fr',
        gap: 16,
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <div>
        <h3 style={{ marginTop: 0 }}>Thông tin liên hệ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
          <div>📍 {p.address}</div>
          <div>📞 {p.phone}</div>
          <div>✉ {p.email}</div>
          {p.workingHours && <div>🕐 {p.workingHours}</div>}
        </div>
      </div>
      {p.showMap && (
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5!2d106.7!3d10.78!"
          style={{ width: '100%', height: 240, border: 0, borderRadius: 8 }}
          loading="lazy"
          title="Map"
        />
      )}
    </div>
  );
}

export function renderBlock(block: {
  type: string;
  props: Record<string, unknown>;
}): React.ReactNode {
  const p = block.props as unknown as any;
  switch (block.type) {
    case 'hero':
      return <HeroBlock p={p} />;
    case 'text':
      return <TextBlock p={p} />;
    case 'image':
      return <ImageBlock p={p} />;
    case 'cta':
      return <CtaBlock p={p} />;
    case 'lead-form':
      return <LeadFormBlock p={p} />;
    case 'testimonials':
      return <TestimonialsBlock p={p} />;
    case 'pricing':
      return <PricingBlock p={p} />;
    case 'reviews':
      return <ReviewsBlock p={p} />;
    case 'faq':
      return <FaqBlock p={p} />;
    case 'news':
      return <NewsBlock p={p} />;
    case 'lawyers':
      return <LawyersBlock p={p} />;
    case 'map':
      return <MapBlock p={p} />;
    case 'contact':
      return <ContactBlock p={p} />;
    default:
      return (
        <div style={{ padding: 16, color: 'var(--danger, #DC2626)' }}>
          Unknown block type: {block.type}
        </div>
      );
  }
}