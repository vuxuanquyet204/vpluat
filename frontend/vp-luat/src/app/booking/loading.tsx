export default function BookingLoading() {
  return (
    <main className="min-h-screen bg-[var(--off-white)]">
      <div className="h-[60px] bg-[var(--primary)]" />
      <section className="bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-dark)_100%)] px-6 py-10 text-center text-white">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mx-auto mb-4 h-10 w-72 rounded bg-white/10" />
          <div className="mx-auto h-4 w-96 max-w-full rounded bg-white/10" />
        </div>
      </section>
      <div className="border-b border-[var(--gray-100)] bg-white px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--gray-200)]" />
              <div className="h-3 w-20 animate-pulse rounded bg-[var(--gray-200)]" />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-10">
        <div className="mb-5 h-8 w-64 animate-pulse rounded bg-[var(--gray-200)]" />
        <div className="mb-8 h-4 w-96 max-w-full animate-pulse rounded bg-[var(--gray-200)]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[var(--radius-lg)] border border-[var(--gray-100)] bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
