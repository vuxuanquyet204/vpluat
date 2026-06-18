'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LawyersHero } from '@/features/lawyers/components/lawyers-hero';
import { LawyersFilterChips } from '@/features/lawyers/components/lawyers-filter-chips';
import { LawyerCard } from '@/features/lawyers/components/lawyer-card';
import { LawyerProfileModal } from '@/features/lawyers/components/lawyer-profile-modal';
import { LAWYERS } from '@/features/lawyers/lib/data/lawyers-data';
import type { Lawyer, LawyerSpecialty } from '@/features/lawyers/types';

export default function LawyersPage() {
  const router = useRouter();
  const [active, setActive] = useState<'all' | LawyerSpecialty>('all');
  const [profileLawyer, setProfileLawyer] = useState<Lawyer | null>(null);

  const filtered = useMemo(() => {
    if (active === 'all') return LAWYERS;
    return LAWYERS.filter((l) => l.specialties.includes(active));
  }, [active]);

  const handleViewProfile = (lawyer: Lawyer) => setProfileLawyer(lawyer);
  const handleBook = (lawyer: Lawyer) => {
    router.push(`/booking?lawyer=${lawyer.id}`);
  };

  return (
    <>
      <LawyersHero totalCount={LAWYERS.length} />
      <LawyersFilterChips active={active} onChange={setActive} />

      <section className="lawyers-section">
        <div className="container">
          <div className="lawyers-grid">
            {filtered.map((l) => (
              <LawyerCard
                key={l.id}
                lawyer={l}
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
