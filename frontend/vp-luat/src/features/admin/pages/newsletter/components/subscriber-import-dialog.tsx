'use client';

import { useState, useMemo } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Modal } from '@/features/admin/shared';
import { parseCsv, validateEmail } from '../lib/csv';

interface SubscriberImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: Array<{ email: string; name?: string }>) => void;
}

interface PreviewRow {
  email: string;
  name?: string;
  valid: boolean;
  error?: string;
}

const SAMPLE_CSV = `email,name
nguyenvana@gmail.com,Nguyễn Văn A
tran_b@yahoo.com,Trần Thị B
invalid_email,
le.c@outlook.com,Lê C`;

export function SubscriberImportDialog({ isOpen, onClose, onImport }: SubscriberImportDialogProps) {
  const [raw, setRaw] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);

  const preview = useMemo<PreviewRow[]>(() => {
    if (!raw.trim()) return [];
    const parsed = parseCsv(raw);
    return parsed.rows.map((row) => {
      const email = (row.email ?? '').trim();
      const name = (row.name ?? row['tên'] ?? '').trim() || undefined;
      if (!email) return { email, name, valid: false, error: 'Thiếu email' };
      if (!validateEmail(email)) return { email, name, valid: false, error: 'Email không hợp lệ' };
      return { email, name, valid: true };
    });
  }, [raw]);

  const validRows = useMemo(() => preview.filter((r) => r.valid), [preview]);
  const invalidCount = preview.length - validRows.length;

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') setRaw(result);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (validRows.length === 0) return;
    onImport(validRows.map((r) => ({ email: r.email, name: r.name })));
    handleClose();
  };

  const handleClose = () => {
    setRaw('');
    setFileName(null);
    setShowSample(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import subscribers từ CSV"
      size="lg"
      footer={
        <>
          <button type="button" className="action-btn" onClick={handleClose}>
            Hủy
          </button>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={handleConfirm}
            disabled={validRows.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Upload size={12} /> Import {validRows.length} dòng hợp lệ
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            padding: 10,
            background: 'var(--gray-50)',
            borderRadius: 6,
            fontSize: '0.78rem',
          }}
        >
          <FileText size={14} color="var(--primary)" />
          <div style={{ flex: 1 }}>
            <strong>Định dạng:</strong> CSV có header <code>email,name</code> (name tuỳ chọn).
            Dòng trùng email sẽ bị bỏ qua.
          </div>
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowSample((v) => !v)}
            style={{
              fontSize: '0.72rem',
              background: 'white',
              border: '1px solid var(--gray-200, #E5E7EB)',
            }}
          >
            {showSample ? 'Ẩn' : 'Xem'} mẫu
          </button>
        </div>

        {showSample && (
          <pre
            style={{
              padding: 10,
              background: 'var(--gray-800, #1F2937)',
              color: 'var(--gray-100, #F3F4F6)',
              borderRadius: 6,
              fontSize: '0.7rem',
              overflow: 'auto',
              margin: 0,
            }}
          >
            {SAMPLE_CSV}
          </pre>
        )}

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--gray-700)',
              marginBottom: 6,
            }}
          >
            Tải file CSV
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1.5px dashed var(--gray-300)',
              borderRadius: 6,
              fontSize: '0.8rem',
              background: 'white',
            }}
          />
          {fileName && (
            <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--gray-500)' }}>
              Đã tải: {fileName}
            </div>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--gray-700)',
              marginBottom: 6,
            }}
          >
            Hoặc dán nội dung CSV
          </label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={5}
            placeholder="email,name&#10;nguyenvana@gmail.com,Nguyễn Văn A&#10;..."
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 6,
              fontSize: '0.8rem',
              outline: 'none',
              fontFamily: 'monospace',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {preview.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 6,
                fontSize: '0.78rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success, #10B981)' }}>
                <CheckCircle size={12} /> {validRows.length} hợp lệ
              </span>
              {invalidCount > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger, #DC2626)' }}>
                  <XCircle size={12} /> {invalidCount} lỗi
                </span>
              )}
            </div>
            <div
              style={{
                maxHeight: 200,
                overflowY: 'auto',
                border: '1px solid var(--gray-200)',
                borderRadius: 6,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--gray-50)' }}>
                  <tr>
                    <th style={{ padding: 6, textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>#</th>
                    <th style={{ padding: 6, textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Email</th>
                    <th style={{ padding: 6, textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Tên</th>
                    <th style={{ padding: 6, textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((r, i) => (
                    <tr
                      key={i}
                      style={{ background: r.valid ? 'transparent' : 'rgba(220, 38, 38, 0.05)' }}
                    >
                      <td style={{ padding: 4, color: 'var(--gray-500)' }}>{i + 1}</td>
                      <td style={{ padding: 4, fontWeight: 600 }}>{r.email || <em>—</em>}</td>
                      <td style={{ padding: 4, color: 'var(--gray-600)' }}>{r.name ?? '—'}</td>
                      <td style={{ padding: 4 }}>
                        {r.valid ? (
                          <span style={{ color: 'var(--success, #10B981)' }}>OK</span>
                        ) : (
                          <span
                            style={{
                              color: 'var(--danger, #DC2626)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <AlertCircle size={10} /> {r.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {preview.length > 50 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ padding: 6, textAlign: 'center', color: 'var(--gray-500)' }}
                      >
                        ... và {preview.length - 50} dòng nữa
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}