'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleDisplayNames, canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { Star, Search, Check, X, Eye, ThumbsUp } from 'lucide-react';

const MOCK_REVIEWS = [
  { id: '1', authorName: 'Nguyễn Văn A', service: 'Tư vấn pháp lý', rating: 5, comment: 'Dịch vụ rất tốt, luật sư tư vấn nhiệt tình', status: 'pending', createdAt: '09/07/2026' },
  { id: '2', authorName: 'Trần Thị B', service: 'Luật hôn nhân', rating: 4, comment: 'Hài lòng với dịch vụ', status: 'approved', createdAt: '08/07/2026' },
  { id: '3', authorName: 'Lê Văn C', service: 'Thủ tục đất đai', rating: 5, comment: 'Quy trình nhanh chóng, chuyên nghiệp', status: 'pending', createdAt: '09/07/2026' },
  { id: '4', authorName: 'Phạm Thị D', service: 'Hợp đồng', rating: 3, comment: 'Dịch vụ tạm được', status: 'rejected', createdAt: '07/07/2026' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= rating ? '#F59E0B' : 'none'}
          stroke={star <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  );
}

export default function StaffReviewsPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  if (!canAccessNav(userRole, 'reviews')) {
    return (
      <div className="admin-view">
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Bạn không có quyền truy cập trang này
        </div>
      </div>
    );
  }

  const filteredReviews = MOCK_REVIEWS.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (search && !r.authorName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = MOCK_REVIEWS.filter(r => r.status === 'pending').length;

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Đánh giá khách hàng</h1>
          <p className="admin-page-header__sub">
            {pendingCount > 0 ? `Có ${pendingCount} đánh giá chờ duyệt` : 'Không có đánh giá chờ duyệt'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 8
        }}>
          <Search size={16} style={{ color: 'var(--gray-400)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm đánh giá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.88rem' }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            fontSize: '0.88rem',
            background: 'white'
          }}
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            style={{
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 12,
              padding: 20
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{review.authorName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{review.service}</div>
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 600,
                background: review.status === 'pending' ? '#FEF3C7' : review.status === 'approved' ? '#ECFDF5' : '#FEE2E2',
                color: review.status === 'pending' ? '#B45309' : review.status === 'approved' ? '#059669' : '#DC2626'
              }}>
                {review.status === 'pending' ? 'Chờ duyệt' : review.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <StarRating rating={review.rating} />
            </div>

            <div style={{
              fontSize: '0.88rem',
              color: 'var(--gray-700)',
              marginBottom: 12,
              lineHeight: 1.5
            }}>
              "{review.comment}"
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 12,
              borderTop: '1px solid var(--gray-100)'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                {review.createdAt}
              </div>

              {review.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="action-btn"
                    style={{ background: '#ECFDF5', color: '#059669', border: 'none' }}
                    onClick={() => alert(`Duyệt đánh giá #${review.id}`)}
                  >
                    <Check size={12} /> Duyệt
                  </button>
                  <button
                    className="action-btn"
                    style={{ background: '#FEE2E2', color: '#DC2626', border: 'none' }}
                    onClick={() => alert(`Từ chối đánh giá #${review.id}`)}
                  >
                    <X size={12} /> Từ chối
                  </button>
                </div>
              )}

              {review.status !== 'pending' && (
                <button className="action-btn">
                  <Eye size={12} /> Chi tiết
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
          <Star size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>Không có đánh giá nào</div>
        </div>
      )}
    </div>
  );
}
