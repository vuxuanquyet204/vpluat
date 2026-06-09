'use client';

import { Bolt, Lock, ShieldCheck } from 'lucide-react';
import { BOOKING_TRUST_ITEMS } from '../lib';

const trustIcons = [ShieldCheck, Bolt, Lock];

export function BookingHero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-dark)_100%)] px-6 py-10 text-center">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h1 className="mb-1.5 font-heading text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-white">
          Đặt Lịch Tư Vấn Pháp Lý
        </h1>
        <p className="mb-4 text-[0.9rem] text-white/65">
          Chọn dịch vụ, luật sư và thời gian phù hợp với bạn trong 2 phút.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 max-[480px]:gap-x-4">
          {BOOKING_TRUST_ITEMS.map((item, index) => {
            const Icon = trustIcons[index] ?? ShieldCheck;
            return (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-[0.8rem] text-white/70"
              >
                <Icon className="h-3 w-3 text-[var(--accent)]" />
                <span>{item}</span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
