'use client';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, className = '', style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius,
        background:
          'linear-gradient(90deg, var(--gray-100, #F1F5F9) 0%, var(--gray-200, #E2E8F0) 50%, var(--gray-100, #F1F5F9) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3, lastWidth = '70%' }: { lines?: number; lastWidth?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? lastWidth : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Skeleton width={32} height={32} borderRadius={8} />
        <Skeleton width="40%" height={14} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={12} width={i === rows - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          padding: '12px 16px',
          background: 'var(--gray-50)',
          borderBottom: '2px solid var(--gray-200)',
          gap: 12,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={10} width="50%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            padding: '14px 16px',
            borderBottom: '1px solid var(--gray-100)',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height={11} width={c === 0 ? '60%' : '80%'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 10,
        marginBottom: 12,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Skeleton width="40%" height={10} />
          <Skeleton width="60%" height={22} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="admin-view">
        <div style={{ marginBottom: 16 }}>
          <Skeleton width={200} height={24} />
          <div style={{ marginTop: 8 }}>
            <Skeleton width={300} height={12} />
          </div>
        </div>
        <SkeletonStats count={4} />
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <Skeleton width="40%" height={32} borderRadius={6} />
        </div>
        <SkeletonTable rows={6} columns={5} />
      </div>
    </>
  );
}