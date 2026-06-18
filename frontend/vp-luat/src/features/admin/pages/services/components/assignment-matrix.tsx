'use client';

import { useState, useMemo, useEffect } from 'react';
import { Save, RotateCcw, Check } from 'lucide-react';
import type { Service, Lawyer } from '@/features/admin/types';

interface AssignmentMatrixProps {
  services: Service[];
  lawyers: Lawyer[];
  isAssigned: (serviceId: string, lawyerId: string) => boolean;
  onToggle: (serviceId: string, lawyerId: string) => void;
  onSaveBatch: (matrix: Record<string, string[]>) => Promise<void>;
}

export function AssignmentMatrix({
  services,
  lawyers,
  isAssigned,
  onToggle,
  onSaveBatch,
}: AssignmentMatrixProps) {
  // Local state: serviceId → Set<lawyerId>
  const initial = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const s of services) {
      map[s.id] = new Set(s.lawyerIds.filter((id) => lawyers.some((l) => l.id === id)));
    }
    return map;
  }, [services, lawyers]);

  const [local, setLocal] = useState<Record<string, Set<string>>>(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocal(initial);
  }, [initial]);

  const isDirty = useMemo(() => {
    for (const sid of Object.keys(initial)) {
      const a = initial[sid];
      const b = local[sid];
      if (!b) return true;
      if (a.size !== b.size) return true;
      for (const lid of a) if (!b.has(lid)) return true;
    }
    for (const sid of Object.keys(local)) {
      if (!initial[sid]) return true;
    }
    return false;
  }, [initial, local]);

  const handleToggle = (serviceId: string, lawyerId: string) => {
    setLocal((prev) => {
      const next = { ...prev };
      const set = new Set(prev[serviceId] ?? []);
      if (set.has(lawyerId)) set.delete(lawyerId);
      else set.add(lawyerId);
      next[serviceId] = set;
      return next;
    });
  };

  const handleReset = () => setLocal(initial);

  const handleSave = async () => {
    setSaving(true);
    try {
      const matrix: Record<string, string[]> = {};
      for (const sid of Object.keys(local)) {
        matrix[sid] = Array.from(local[sid]);
      }
      await onSaveBatch(matrix);
    } finally {
      setSaving(false);
    }
  };

  // Row/col summary
  const colCount = (lawyerId: string): number => {
    let c = 0;
    for (const sid of Object.keys(local)) {
      if (local[sid]?.has(lawyerId)) c += 1;
    }
    return c;
  };

  const rowCount = (serviceId: string): number => local[serviceId]?.size ?? 0;

  if (services.length === 0 || lawyers.length === 0) {
    return (
      <div className="admin-card" style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
        Cần có ít nhất 1 dịch vụ và 1 luật sư đang hoạt động để thiết lập phân công.
      </div>
    );
  }

  return (
    <div className="admin-card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-800)' }}>
            Phân công dịch vụ × Luật sư
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: 2 }}>
            Tick vào ô tương ứng để gán luật sư cho dịch vụ. Nhấn Lưu để áp dụng tất cả thay đổi.
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {isDirty && (
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--warning, #D97706)',
              fontWeight: 600,
            }}
          >
            ● Có thay đổi chưa lưu
          </span>
        )}
        <button
          type="button"
          className="action-btn"
          onClick={handleReset}
          disabled={!isDirty || saving}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <RotateCcw size={12} /> Khôi phục
        </button>
        <button
          type="button"
          className="action-btn action-btn--primary"
          onClick={handleSave}
          disabled={!isDirty || saving}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          {saving ? (
            'Đang lưu...'
          ) : (
            <>
              <Save size={12} /> Lưu thay đổi
            </>
          )}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '0.8rem',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  background: 'var(--gray-50)',
                  padding: '10px 12px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--gray-200)',
                  borderRight: '1px solid var(--gray-200)',
                  minWidth: 200,
                }}
              >
                Dịch vụ \ Luật sư
              </th>
              {lawyers.map((l) => (
                <th
                  key={l.id}
                  style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    background: 'var(--gray-50)',
                    borderBottom: '1px solid var(--gray-200)',
                    minWidth: 110,
                  }}
                  title={l.name}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {l.avatar ? (
                      <img
                        src={l.avatar}
                        alt={l.name}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--primary-faint, #EFF3F8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                        }}
                      >
                        {l.name.slice(0, 2)}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--gray-700)',
                        maxWidth: 90,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {l.name.replace('LS. ', '')}
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--gray-500)',
                        fontWeight: 600,
                      }}
                    >
                      {colCount(l.id)} DV
                    </div>
                  </div>
                </th>
              ))}
              <th
                style={{
                  padding: '10px 8px',
                  textAlign: 'center',
                  background: 'var(--gray-50)',
                  borderBottom: '1px solid var(--gray-200)',
                  minWidth: 70,
                }}
              >
                Tổng
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} style={{ background: 'white' }}>
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    background: 'white',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--gray-100)',
                    borderRight: '1px solid var(--gray-200)',
                    fontWeight: 600,
                    color: 'var(--gray-800)',
                  }}
                  title={s.name}
                >
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 220,
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--gray-500)',
                      fontWeight: 400,
                    }}
                  >
                    {s.category}
                  </div>
                </td>
                {lawyers.map((l) => {
                  const checked = local[s.id]?.has(l.id) ?? false;
                  return (
                    <td
                      key={l.id}
                      style={{
                        padding: 0,
                        textAlign: 'center',
                        borderBottom: '1px solid var(--gray-100)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(s.id, l.id)}
                        aria-label={`${checked ? 'Bỏ gán' : 'Gán'} ${l.name} cho ${s.name}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          padding: '10px 8px',
                          background: checked ? 'var(--primary-faint, #EFF3F8)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: checked ? 'var(--primary)' : 'var(--gray-300)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {checked ? <Check size={16} strokeWidth={3} /> : '–'}
                      </button>
                    </td>
                  );
                })}
                <td
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    borderBottom: '1px solid var(--gray-100)',
                    background: 'var(--gray-50)',
                  }}
                >
                  {rowCount(s.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--gray-200)',
          fontSize: '0.72rem',
          color: 'var(--gray-500)',
          display: 'flex',
          gap: 16,
        }}
      >
        <span>
          <strong>{services.length}</strong> dịch vụ · <strong>{lawyers.length}</strong> luật sư
        </span>
        <span>·</span>
        <span>{isDirty ? 'Chưa lưu' : 'Đã đồng bộ'}</span>
      </div>
    </div>
  );
}