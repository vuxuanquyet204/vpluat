'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function NewsPagination({ page, totalPages, onPageChange }: NewsPaginationProps) {
  if (totalPages <= 1) return null;

  const pages: Array<number | '...'> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="pagination" role="navigation" aria-label="Phân trang">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="pagination__ellipsis">···</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pagination__btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
