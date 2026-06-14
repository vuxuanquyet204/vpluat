'use client';

import { useState } from 'react';
import { Search, MessageSquare, Phone, User } from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  Pagination,
} from '@/features/admin/shared';
import type { ChatbotSession } from '@/features/admin/types';

const MOCK_SESSIONS: ChatbotSession[] = [
  { id: '1', sessionId: 'sess_001', userName: 'Nguyễn Văn A', userPhone: '0901 234 567', intent: 'thành lập công ty', startedAt: '2025-05-26T09:00:00Z', endedAt: '2025-05-26T09:05:00Z', messages: [{ from: 'user', content: 'Tôi muốn thành lập công ty', timestamp: '2025-05-26T09:00:00Z' }, { from: 'bot', content: 'Xin chào A, tôi sẽ giúp bạn về thành lập công ty.', timestamp: '2025-05-26T09:00:10Z' }] },
  { id: '2', sessionId: 'sess_002', userName: 'Trần Thị B', userPhone: '0902 345 678', intent: 'tư vấn luật', startedAt: '2025-05-26T08:30:00Z', endedAt: '2025-05-26T08:40:00Z', messages: [{ from: 'user', content: 'Cần tư vấn pháp luật', timestamp: '2025-05-26T08:30:00Z' }, { from: 'bot', content: 'Xin chào B, bạn cần tư vấn về vấn đề gì ạ?', timestamp: '2025-05-26T08:30:10Z' }] },
  { id: '3', sessionId: 'sess_003', userName: undefined, userPhone: undefined, intent: 'hợp đồng thuê', startedAt: '2025-05-25T14:00:00Z', endedAt: '2025-05-25T14:10:00Z', messages: [{ from: 'user', content: 'Hợp đồng thuê nhà thế nào?', timestamp: '2025-05-25T14:00:00Z' }] },
  { id: '4', sessionId: 'sess_004', userName: 'Lê Minh C', userPhone: '0903 456 789', intent: 'ly hôn', startedAt: '2025-05-25T10:00:00Z', endedAt: '2025-05-25T10:15:00Z', messages: [{ from: 'user', content: 'Ly hôn cần làm gì?', timestamp: '2025-05-25T10:00:00Z' }, { from: 'bot', content: 'Xin chào C, ly hôn là thủ tục phức tạp...', timestamp: '2025-05-25T10:00:15Z' }, { from: 'user', content: 'Cảm ơn bạn', timestamp: '2025-05-25T10:10:00Z' }] },
];

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatDuration(start: string, end?: string) {
  if (!end) return 'Đang diễn ra';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  return `${mins} phút`;
}

export default function ChatbotPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<ChatbotSession | null>(null);
  const LIMIT = 10;

  const filtered = MOCK_SESSIONS.filter(
    (s) =>
      (s.userName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.userPhone ?? '').includes(search) ||
      (s.intent ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Chatbot Logs"
        subtitle="Xem lịch sử cuộc trò chuyện chatbot"
      />

      <div style={{ display: 'grid', gridTemplateColumns: selectedSession ? '1fr 1fr' : '1fr', gap: '16px' }}>
        {/* Session list */}
        <div className="admin-card">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Tìm theo tên, số điện thoại, intent..."
          />

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Intent</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr
                    key={s.id}
                    style={{ cursor: 'pointer', background: selectedSession?.id === s.id ? 'var(--gray-50)' : undefined }}
                    onClick={() => setSelectedSession(s)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-faint, #EFF3F8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.82rem' }}>
                            {s.userName ?? 'Khách vãng lai'}
                          </div>
                          {s.userPhone && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{s.userPhone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-600)', fontSize: '0.82rem' }}>{s.intent}</td>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>
                      <div>{formatTime(s.startedAt)}</div>
                      <div>{formatDuration(s.startedAt, s.endedAt ?? undefined)}</div>
                    </td>
                    <td>
                      <button type="button" className="action-btn" onClick={(e) => { e.stopPropagation(); setSelectedSession(s); }}>
                        <MessageSquare size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} limit={LIMIT} total={filtered.length} onPageChange={setPage} />
        </div>

        {/* Chat detail */}
        {selectedSession && (
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {selectedSession.userName ?? 'Khách vãng lai'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                  {selectedSession.userPhone ?? 'Không có SĐT'} · {selectedSession.intent}
                </div>
              </div>
              <button type="button" className="action-btn" onClick={() => setSelectedSession(null)}>
                Đóng
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {selectedSession.messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      background: msg.from === 'user' ? 'var(--primary)' : 'var(--gray-100)',
                      color: msg.from === 'user' ? 'white' : 'var(--gray-700)',
                    }}
                  >
                    {msg.content}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '2px' }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
