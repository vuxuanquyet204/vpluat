'use client';

import type { BookingServiceOption } from '../types';
import { ServiceCard } from './service-card';

export function ServiceGrid({
  services,
  selectedServiceId,
  onSelect,
}: {
  services: BookingServiceOption[];
  selectedServiceId: string | null;
  onSelect: (service: BookingServiceOption) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-[14px] xl:grid-cols-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          selected={service.id === selectedServiceId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
