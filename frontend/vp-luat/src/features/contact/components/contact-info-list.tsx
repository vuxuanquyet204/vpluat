'use client';

import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { PublicSiteContent } from '@/features/home/api/site-content-api';
import { useTranslations } from 'next-intl';

export function ContactInfoList({ contact }: { contact: PublicSiteContent['contact'] }) {
  const t = useTranslations('contactPage.info');
  const items = [
    { icon: MapPin, label: t('address'), value: contact.address, sub: t('addressSub') },
    { icon: Phone, label: t('phone'), value: contact.hotline, sub: t('phoneSub') },
    { icon: Mail, label: t('emailSub'), value: contact.email, sub: t('emailSub') },
    { icon: Clock, label: t('hours'), value: contact.workingHours, sub: t('hoursSub') },
  ];

  return <div className="contact-info-list">{items.filter((item) => item.value).map(({ icon: Icon, label, value, sub }) => <div className="contact-info-item" key={label}><Icon size={20} /><div><strong>{label}</strong><span>{value}</span><small>{sub}</small></div></div>)}</div>;
}
