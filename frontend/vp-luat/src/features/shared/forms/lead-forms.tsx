'use client';

import { useState, useEffect } from 'react';
import { Modal, Drawer } from '@/features/shared/ui/modal';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import { leadApi, type Lead } from '@/lib/api/admin-crm';
import { notifySuccess, notifyError } from '@/features/admin/lib';
import { Save, Loader2 } from 'lucide-react';

interface LeadCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function LeadCreateModal({ open, onClose, onCreated }: LeadCreateModalProps) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    source: 'STAFF',
  });

  useEffect(() => {
    if (open) {
      setForm({ name: '', phone: '', email: '', message: '', source: 'STAFF' });
    }
  }, [open]);

  const createMutation = useApiMutation<Lead, Partial<Lead>>(
    'POST',
    '/crm/leads',
    {
      onSuccess: () => {
        notifySuccess('Đã tạo lead mới');
        onCreated?.();
        onClose();
      },
      onError: (err) => {
        notifyError('Lỗi tạo lead', err.message);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      notifyError('Vui lòng nhập họ tên');
      return;
    }
    createMutation.mutate(form);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid var(--gray-200)',
    borderRadius: 6,
    fontSize: '0.88rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--gray-700)',
    marginBottom: 6,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thêm Lead mới"
      width={520}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--gray-200)',
              background: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="lead-create-form"
            disabled={createMutation.isPending}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--primary, #1E3A5F)',
              color: 'white',
              borderRadius: 6,
              cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: createMutation.isPending ? 0.7 : 1,
            }}
          >
            {createMutation.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            Lưu
          </button>
        </>
      }
    >
      <form id="lead-create-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Họ tên *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={inputStyle}
                placeholder="0901234567"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nguồn lead</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              style={inputStyle}
            >
              <option value="STAFF">Thêm trực tiếp bởi nhân viên</option>
              <option value="WEBSITE">Website</option>
              <option value="PHONE">Điện thoại</option>
              <option value="REFERRAL">Giới thiệu</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ghi chú</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Thông tin ban đầu về lead..."
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

interface LeadDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  onUpdated?: () => void;
}

export function LeadDetailDrawer({ open, onClose, leadId, onUpdated }: LeadDetailDrawerProps) {
  const { data: lead, isLoading, refetch } = useApiQuery<Lead>(
    ['staff-lead-detail', leadId],
    `/crm/leads/${leadId}`,
    {},
    { enabled: open && !!leadId }
  );

  const { data: timeline } = useApiQuery<Array<{ id: string; action: string; summary: string; createdAt: string }>>(
    ['staff-lead-timeline', leadId],
    `/crm/leads/${leadId}/timeline`,
    {},
    { enabled: open && !!leadId }
  );

  const { data: notes } = useApiQuery<Array<{ createdAt: string; content: string }>>(
    ['staff-lead-notes', leadId],
    `/crm/leads/${leadId}/notes`,
    {},
    { enabled: open && !!leadId }
  );

  const [newNote, setNewNote] = useState('');

  const addNoteMutation = useApiMutation<Lead, { note: string }>(
    'POST',
    (vars) => `/crm/leads/${leadId}/notes`,
    {
      onSuccess: () => {
        notifySuccess('Đã thêm ghi chú');
        setNewNote('');
        refetch();
      },
    }
  );

  const updateStatusMutation = useApiMutation<Lead, { status: string; notes?: string }>(
    'PATCH',
    (vars) => `/crm/leads/${leadId}`,
    {
      onSuccess: () => {
        notifySuccess('Đã cập nhật trạng thái');
        onUpdated?.();
        refetch();
      },
    }
  );

  const STATUS_OPTIONS = [
    { value: 'NEW', label: 'Mới' },
    { value: 'CONTACTED', label: 'Đã liên hệ' },
    { value: 'QUALIFIED', label: 'Đang tư vấn' },
    { value: 'PROPOSAL', label: 'Đã gửi báo giá' },
    { value: 'NEGOTIATION', label: 'Đang đàm phán' },
    { value: 'WON', label: 'Đã chuyển đổi' },
    { value: 'LOST', label: 'Mất lead' },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Chi tiết Lead" width={520}>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>
          Đang tải...
        </div>
      ) : !lead ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>
          Không tìm thấy lead
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              padding: 16,
              background: 'var(--gray-50)',
              borderRadius: 8,
              border: '1px solid var(--gray-200)',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{lead.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' }}>
              {lead.phone && <div>📞 {lead.phone}</div>}
              {lead.email && <div>✉️ {lead.email}</div>}
              {lead.serviceName && <div>📋 Dịch vụ: {lead.serviceName}</div>}
              <div>🏷️ Nguồn: {lead.source}</div>
              <div>👤 Phụ trách: {lead.assignedTo?.fullName ?? 'Chưa phân công'}</div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
              Trạng thái
            </label>
            <select
              value={lead.status}
              onChange={(e) => updateStatusMutation.mutate({ status: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--gray-200)',
                borderRadius: 6,
                fontSize: '0.88rem',
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {lead.message && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                Ghi chú ban đầu
              </label>
              <div
                style={{
                  padding: 12,
                  background: 'var(--gray-50)',
                  borderRadius: 6,
                  fontSize: '0.88rem',
                  color: 'var(--gray-700)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {lead.message}
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
              Thêm ghi chú
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ghi chú nội bộ..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 6,
                  fontSize: '0.88rem',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newNote.trim()) {
                    addNoteMutation.mutate({ note: newNote });
                  }
                }}
              />
              <button
                type="button"
                onClick={() => newNote.trim() && addNoteMutation.mutate({ note: newNote })}
                disabled={addNoteMutation.isPending}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  background: 'var(--primary, #1E3A5F)',
                  color: 'white',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Thêm
              </button>
            </div>
          </div>

          {notes && notes.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                Lịch sử ghi chú ({notes.length})
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {notes.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 10,
                      background: 'var(--gray-50)',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      borderLeft: '3px solid var(--primary, #1E3A5F)',
                    }}
                  >
                    <div style={{ color: 'var(--gray-700)' }}>{n.content}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {timeline && timeline.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                Hoạt động ({timeline.length})
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {timeline.slice(0, 10).map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '8px 12px',
                      background: 'white',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 6,
                      fontSize: '0.82rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ color: 'var(--gray-700)' }}>{t.summary || t.action}</span>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.72rem' }}>
                      {new Date(t.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}