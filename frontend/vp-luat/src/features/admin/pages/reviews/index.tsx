'use client';

import { useState } from 'react';
import { Star, Check, X, Reply } from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  FilterTabs,
  Badge,
  ActionButtons,
  Pagination,
  Modal,
} from '@/features/admin/shared';
import type { Review, ReviewStatus } from '@/features/admin/types';

const REVIEW_STATUS_TABS = [
  { value: 'all', label: 'Tất cả', count: 24 },
  { value: 'pending', label: 'Chờ duyệt', count: 8 },
  { value: 'approved', label: 'Đã duyệt', count: 14 },
  { value: 'rejected', label: 'Từ chối', count: 2 },
];

const MOCK_REVIEWS: Review[] = [
  { id: '1', authorName: 'Nguyễn Văn A', authorEmail: 'nva@email.com', rating: 5, content: 'Dịch vụ tư vấn rất chuyên nghiệp, luật sư tận tình giải đáp mọi thắc mắc của tôi. Tôi rất hài lòng!', service: 'Thành lập công ty', status: 'pending', createdAt: '2025-05-25T10:00:00Z' },
  { id: '2', authorName: 'Trần Thị B', authorEmail: 'ttb@email.com', rating: 4, content: 'Quá trình tư vấn diễn ra nhanh chóng, nhân viên thân thiện. Thời gian chờ hơi lâu một chút.', service: 'Hợp đồng thuê', status: 'pending', createdAt: '2025-05-24T14:00:00Z' },
  { id: '3', authorName: 'Lê Minh C', authorEmail: 'lmc@email.com', rating: 5, content: 'Tôi đã sử dụng dịch vụ ly hôn, luật sư hỗ trợ rất chu đáo và giải quyết nhanh gọn.', service: 'Ly hôn', status: 'approved', reply: 'Cảm ơn bạn đã tin tưởng VP Luật!', createdAt: '2025-05-20T09:00:00Z' },
  { id: '4', authorName: 'Phạm Hoàng D', authorEmail: 'phd@email.com', rating: 3, content: 'Dịch vụ ổn định, nhưng thời gian phản hồi hơi chậm vào cuối tuần.', service: 'Tư vấn pháp luật', status: 'approved', createdAt: '2025-05-18T16:00:00Z' },
  { id: '5', authorName: 'Hoàng Lan E', authorEmail: 'hle@email.com', rating: 5, content: 'Đội ngũ luật sư giỏi, am hiểu pháp luật. Tôi sẽ giới thiệu cho bạn bè.', service: 'Sở hữu trí tuệ', status: 'pending', createdAt: '2025-05-26T11:00:00Z' },
  { id: '6', authorName: 'Đặng Quốc F', authorEmail: 'dqf@email.com', rating: 1, content: 'Rất thất vọng, không ai liên hệ lại sau khi đặt lịch.', service: 'Mua bán bất động sản', status: 'rejected', createdAt: '2025-05-15T08:00:00Z' },
];

const STATUS_MAP: Record<ReviewStatus, { label: string; variant: 'yellow' | 'green' | 'red' }> = {
  pending: { label: 'Chờ duyệt', variant: 'yellow' },
  approved: { label: 'Đã duyệt', variant: 'green' },
  rejected: { label: 'Từ chối', variant: 'red' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }} aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          fill={n <= rating ? '#F59E0B' : 'none'}
          stroke={n <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [replyModal, setReplyModal] = useState<Review | null>(null);
  const LIMIT = 10;

  const filtered = MOCK_REVIEWS.filter((r) => {
    const matchesSearch =
      r.authorName.toLowerCase().includes(search.toLowerCase()) ||
      r.service.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Đánh giá khách hàng"
        subtitle="Quản lý đánh giá và phản hồi từ khách hàng"
      />

      <div className="admin-card">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Tìm theo tên, dịch vụ, nội dung..."
        />

        <FilterTabs
          tabs={REVIEW_STATUS_TABS}
          activeValue={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Nội dung đánh giá</th>
                <th>Dịch vụ</th>
                <th>Sao</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => {
                const st = STATUS_MAP[r.status];
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{r.authorName}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{r.authorEmail}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: '0.82rem', lineHeight: 1.4 }}>
                          {r.content.length > 100 ? r.content.slice(0, 100) + '...' : r.content}
                        </p>
                        {r.reply && (
                          <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            Phản hồi: {r.reply}
                          </p>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-600)' }}>{r.service}</td>
                    <td><StarRating rating={r.rating} /></td>
                    <td><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td>
                      <ActionButtons
                        actions={[
                          ...(r.status === 'pending'
                            ? [
                                { label: 'Duyệt', variant: 'primary' as const, onClick: () => {} },
                                { label: 'Từ chối', variant: 'danger' as const, onClick: () => {} },
                              ]
                            : []),
                          { label: 'Trả lời', variant: 'default' as const, onClick: () => setReplyModal(r) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={LIMIT} total={filtered.length} onPageChange={setPage} />
      </div>

      <Modal
        isOpen={!!replyModal}
        onClose={() => setReplyModal(null)}
        title={`Phản hồi đánh giá của ${replyModal?.authorName}`}
        size="md"
        footer={
          <>
            <button type="button" className="action-btn" onClick={() => setReplyModal(null)}>Hủy</button>
            <button type="button" className="action-btn action-btn--primary">Gửi phản hồi</button>
          </>
        }
      >
        {replyModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '6px' }}>Đánh giá của khách hàng</div>
              <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: '0.85rem' }}>{replyModal.content}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
                Phản hồi của bạn
              </label>
              <textarea
                defaultValue={replyModal.reply ?? ''}
                placeholder="Viết phản hồi..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
