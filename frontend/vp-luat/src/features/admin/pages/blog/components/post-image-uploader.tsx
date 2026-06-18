'use client';

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

interface PostImageUploaderProps {
  value: string;
  onChange: (dataUrl: string) => void;
  onClear: () => void;
  aspectRatio?: string; // CSS aspect-ratio, e.g. '16/9'
}

/**
 * Drag-drop image uploader — đọc File, nén/resize nhẹ nếu quá lớn,
 * lưu dưới dạng data URL (base64) để giữ trong localStorage.
 */
export function PostImageUploader({
  value,
  onChange,
  onClear,
  aspectRatio = '16/9',
}: PostImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError('Định dạng không hỗ trợ. Chỉ chấp nhận JPG, PNG, GIF, WEBP, SVG.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Kích thước tối đa 2MB. File của bạn: ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    onChange(dataUrl);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  if (value) {
    return (
      <div className="pe-uploader pe-uploader--filled">
        <img src={value} alt="Thumbnail preview" className="pe-uploader__preview" />
        <button
          type="button"
          className="pe-uploader__remove"
          onClick={onClear}
          aria-label="Xóa ảnh"
          title="Xóa ảnh"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`pe-uploader pe-uploader--dropzone${dragOver ? ' pe-uploader--over' : ''}`}
        style={{ aspectRatio }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Tải ảnh đại diện lên"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleSelect}
          style={{ display: 'none' }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'var(--gray-500)',
            textAlign: 'center',
            padding: 12,
          }}
        >
          <Upload size={24} />
          <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Kéo thả ảnh hoặc bấm để chọn</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>JPG, PNG, WEBP, GIF, SVG · tối đa 2MB</div>
        </div>
      </div>
      {error && (
        <div
          style={{
            marginTop: 6,
            color: '#DC2626',
            fontSize: '0.72rem',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không đọc được file'));
    reader.readAsDataURL(file);
  });
}
