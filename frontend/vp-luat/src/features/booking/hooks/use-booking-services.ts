// features/booking/hooks/use-booking-services.ts
// Hook lấy danh sách dịch vụ cho booking từ BE, map về BookingServiceOption.

import { useMemo } from 'react';
import { useServices } from '@/features/services/hooks/use-services';
import type { BookingServiceOption } from '../types';

const ICON_FALLBACK_BY_SLUG: Record<string, string> = {
  'tu-van-phap-ly': 'scale',
  'dai-dien-phap-ly': 'gavel',
  'to-cao-khieu-nai': 'alert',
  'thu-tuc-hanh-chinh': 'file-text',
  'lao-dong': 'users',
  'doanh-nghiep': 'briefcase',
  'nha-dat': 'home',
  'so-huu-tri-tue': 'lightbulb',
  'fdi': 'globe',
  'hinh-su': 'shield',
};

export function useBookingServices(): { services: BookingServiceOption[]; isLoading: boolean } {
  const { data: apiServices = [], isLoading } = useServices();

  const services: BookingServiceOption[] = useMemo(
    () =>
      apiServices.map((s) => ({
        id: `service-${s.slug}`,
        slug: s.slug,
        name: s.name,
        icon: ICON_FALLBACK_BY_SLUG[s.slug] ?? 'scale',
      })),
    [apiServices],
  );

  return { services, isLoading };
}