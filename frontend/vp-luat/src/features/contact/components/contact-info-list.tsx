import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { OFFICE_INFOS } from '../lib/data/contact-data';
import type { OfficeInfo } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  'fa-solid fa-location-dot': <MapPin size={18} />,
  'fa-solid fa-phone': <Phone size={18} />,
  'fa-solid fa-envelope': <Mail size={18} />,
  'fa-solid fa-clock': <Clock size={18} />,
};

interface ContactInfoListProps {
  items?: OfficeInfo[];
}

export function ContactInfoList({ items = OFFICE_INFOS }: ContactInfoListProps) {
  return (
    <div className="info-list">
      {items.map((item) => (
        <div key={item.type} className="info-card">
          <div className="info-card__icon">{ICON_MAP[item.icon]}</div>
          <div className="info-card__content">
            <div className="info-card__label">{item.label}</div>
            <div className="info-card__value">{item.value}</div>
            {item.sub && <div className="info-card__sub">{item.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
