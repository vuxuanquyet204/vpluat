import { QUICK_CONTACTS } from '../lib/data/contact-data';

const VARIANT_CLASS: Record<string, string> = {
  phone: 'quick-btn--phone',
  zalo: 'quick-btn--zalo',
  messenger: 'quick-btn--messenger',
};

export function ContactQuickBtns() {
  return (
    <div className="quick-btns">
      {QUICK_CONTACTS.map((qc) => (
        <a
          key={qc.label}
          href={qc.href}
          className={`quick-btn ${VARIANT_CLASS[qc.variant] ?? ''}`}
          target={qc.href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
        >
          <i className={qc.icon} aria-hidden="true" />
          {qc.label}
        </a>
      ))}
    </div>
  );
}
