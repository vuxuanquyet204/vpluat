'use client';

import { useCallback } from 'react';
import { useMockQuery, ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type { Service, Lawyer } from '@/features/admin/types';

export function useAssignment() {
  const { data: services = [], refetch: refetchServices } = useMockQuery<Service>('services');
  const { data: lawyers = [], refetch: refetchLawyers } = useMockQuery<Lawyer>('lawyers');

  const isAssigned = useCallback(
    (serviceId: string, lawyerId: string): boolean => {
      const svc = services.find((s) => s.id === serviceId);
      return Boolean(svc?.lawyerIds.includes(lawyerId));
    },
    [services],
  );

  const toggle = useCallback(
    (serviceId: string, lawyerId: string) => {
      const svc = services.find((s) => s.id === serviceId);
      const lwy = lawyers.find((l) => l.id === lawyerId);
      if (!svc || !lwy) return;

      const isOn = svc.lawyerIds.includes(lawyerId);
      const newServiceLawyerIds = isOn
        ? svc.lawyerIds.filter((id) => id !== lawyerId)
        : [...svc.lawyerIds, lawyerId];
      const newLawyerServiceIds = isOn
        ? lwy.serviceIds.filter((id) => id !== serviceId)
        : [...lwy.serviceIds, serviceId];

      MockDB.update<Service>('services', serviceId, { lawyerIds: newServiceLawyerIds });
      MockDB.update<Lawyer>('lawyers', lawyerId, { serviceIds: newLawyerServiceIds });

      ghiAudit({
        action: 'assign',
        entity: 'service_assignment',
        entityId: `${serviceId}:${lawyerId}`,
        entityLabel: `${svc.name} ↔ ${lwy.name}`,
      });
    },
    [services, lawyers],
  );

  const saveBatch = useCallback(
    async (matrix: Record<string, string[]>) => {
      try {
        let changes = 0;
        for (const [serviceId, lawyerIds] of Object.entries(matrix)) {
          const svc = services.find((s) => s.id === serviceId);
          if (!svc) continue;
          const oldSet = new Set(svc.lawyerIds);
          const newSet = new Set(lawyerIds);
          if (
            oldSet.size === newSet.size &&
            [...oldSet].every((id) => newSet.has(id))
          ) {
            continue;
          }
          MockDB.update<Service>('services', serviceId, { lawyerIds });
          // sync lawyer.serviceIds
          for (const lid of lawyerIds) {
            const lwy = lawyers.find((l) => l.id === lid);
            if (lwy && !lwy.serviceIds.includes(serviceId)) {
              MockDB.update<Lawyer>('lawyers', lid, {
                serviceIds: [...lwy.serviceIds, serviceId],
              });
            }
          }
          for (const oldLid of oldSet) {
            if (!newSet.has(oldLid)) {
              const lwy = lawyers.find((l) => l.id === oldLid);
              if (lwy) {
                MockDB.update<Lawyer>('lawyers', oldLid, {
                  serviceIds: lwy.serviceIds.filter((id) => id !== serviceId),
                });
              }
            }
          }
          changes += 1;
        }
        if (changes > 0) {
          ghiAudit({
            action: 'update',
            entity: 'assignment_matrix',
            entityId: 'batch',
            entityLabel: `${changes} dịch vụ`,
          });
          notifySuccess(`Đã lưu phân công (${changes} dịch vụ thay đổi)`);
        } else {
          notifySuccess('Không có thay đổi');
        }
        refetchServices();
        refetchLawyers();
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
      }
    },
    [services, lawyers, refetchServices, refetchLawyers],
  );

  return {
    services: services.filter((s) => s.isActive),
    lawyers: lawyers.filter((l) => l.isActive),
    isAssigned,
    toggle,
    saveBatch,
  };
}