import { SOCIAL_LINKS, OFFICE_LOCATIONS } from '../lib/data/contact-data';

export function ContactOffices() {
  return (
    <section className="contact-offices-section">
      <div className="container">
        <div className="section__header">
          <div className="section__label">Văn phòng</div>
          <h2 className="section__title">Hệ thống 3 chi nhánh</h2>
        </div>

        <div className="contact-offices-grid">
          {OFFICE_LOCATIONS.map((office) => (
            <div key={office.city} className={`office-card ${office.isMain ? 'office-card--main' : ''}`}>
              {office.isMain && <span className="office-card__badge">Trụ sở chính</span>}
              <h3 className="office-card__city">
                <i className="fa-solid fa-building" aria-hidden="true" /> {office.city}
              </h3>
              <ul className="office-card__list">
                <li>
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  <span>{office.address}</span>
                </li>
                <li>
                  <i className="fa-solid fa-phone" aria-hidden="true" />
                  <a href={`tel:${office.phone.replace(/\s/g, '')}`}>{office.phone}</a>
                </li>
                <li>
                  <i className="fa-solid fa-envelope" aria-hidden="true" />
                  <a href={`mailto:${office.email}`}>{office.email}</a>
                </li>
                <li>
                  <i className="fa-solid fa-clock" aria-hidden="true" />
                  <span>{office.workingHours}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="contact-social">
          <span>Theo dõi chúng tôi:</span>
          <div className="contact-social__list">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} className="contact-social__link" aria-label={s.label}>
                <i className={s.icon} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
