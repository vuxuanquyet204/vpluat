import type { LandingTemplateDraft } from '@/features/landing-pages/admin';
import { buildLandingTemplateDraft } from '@/features/landing-pages/admin';
import { getLandingPageBySlug } from '@/features/landing-pages/lib';

export default function LandingBuilderPage() {
  const servicePage = getLandingPageBySlug('dich-vu');
  const lawyerPage = getLandingPageBySlug('luat-su');

  const starterTemplates: LandingTemplateDraft[] = [
    servicePage ? buildLandingTemplateDraft('Mẫu dịch vụ pháp lý', servicePage.blocks) : null,
    lawyerPage ? buildLandingTemplateDraft('Mẫu đội ngũ luật sư', lawyerPage.blocks) : null,
  ].filter((template): template is LandingTemplateDraft => Boolean(template));

  return (
    <main className="section section--gray">
      <div className="container public-richtext">
        <div className="section__header">
          <span className="section__label">Landing Builder</span>
          <h1 className="section__title">Khung dựng landing page cho chiến dịch marketing</h1>
          <p className="section__subtitle">
            Builder hiện ở mức practical MVP: khởi tạo template từ block config hiện có để tái sử dụng nội dung và A/B variant.
          </p>
        </div>

        <div className="public-feature-grid">
          {starterTemplates.map((template) => (
            <article key={template.name} className="public-feature-card">
              <h2 className="public-feature-card__title">{template.name}</h2>
              <p className="public-feature-card__description">
                Số block khởi tạo: {template.blocks.length}. Dùng làm điểm bắt đầu cho các landing page chiến dịch.
              </p>
              <span className="public-feature-card__meta">Block-based · Reusable · Variant-ready</span>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
