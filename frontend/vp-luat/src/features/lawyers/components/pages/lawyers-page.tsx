'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LawyersHero } from '@/features/lawyers/components/lawyers-hero';
import { LawyersFilterChips } from '@/features/lawyers/components/lawyers-filter-chips';
import { LawyerCard } from '@/features/lawyers/components/lawyer-card';
import { LawyerProfileModal } from '@/features/lawyers/components/lawyer-profile-modal';
import { useLawyers } from '@/features/lawyers/hooks/use-lawyers';
import type { Lawyer, LawyerSpecialty } from '@/features/lawyers/types';

export default function LawyersPage() {
  const router = useRouter();
  const [active, setActive] = useState<'all' | LawyerSpecialty>('all');
  const [profileLawyer, setProfileLawyer] = useState<Lawyer | null>(null);

  const { data: lawyers = [], isLoading } = useLawyers();

  const filtered = useMemo(() => {
    if (active === 'all') return lawyers;
    return lawyers.filter((l) => l.specialties?.includes(active));
  }, [active, lawyers]);

  const handleViewProfile = (lawyer: Lawyer) => setProfileLawyer(lawyer);
  const handleBook = (lawyer: Lawyer) => {
    router.push(`/booking?lawyer=${lawyer.id}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Đang tải luật sư...</p>
      </div>
    );
  }

  return (
    <>
      <LawyersHero totalCount={lawyers.length || 0} />
      <LawyersFilterChips active={active} onChange={setActive} />

      <section className="lawyers-section">
        <div className="container">
          <div className="lawyers-grid">
            {filtered.map((l) => (
              <LawyerCard
                key={l.id}
                lawyer={l as Lawyer}
                onViewProfile={handleViewProfile}
                onBook={handleBook}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="lawyers-empty">
              <p>Chưa có luật sư nào thuộc chuyên môn này.</p>
            </div>
          )}
        </div>
      </section>

      <LawyerProfileModal lawyer={profileLawyer} onClose={() => setProfileLawyer(null)} />
    </>
  );
}
