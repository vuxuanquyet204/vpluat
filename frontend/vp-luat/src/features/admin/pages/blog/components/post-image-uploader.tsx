// features/admin/pages/blog/components/post-image-uploader.tsx
// Drag-drop image uploader — replaces the legacy FileReader-base64
// implementation. The actual file is uploaded to the backend via
// /api/admin/upload/image; the returned URL (/files/images/...) is what
// gets stored in PostFormValues.thumbnail.

'use client';

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/api/upload-image';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

interface PostImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onClear: () => void;
  aspectRatio?: string; // CSS aspect-ratio, e.g. '16/9'
}

/**
 * Drag-drop image uploader — reads the File, uploads it to
 * `/api/admin/upload/image`, and stores the returned `/files/...` URL
 * in the form so it survives `PostRequest.thumbnailUrl` validation.
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
  const [uploading, setUploading] = useState(false);

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
    setUploading(true);
    try {
      const result = await uploadImage(file, 'thumbnail');
      if (!result.url) {
        throw new Error('Phản hồi từ server không có URL ảnh');
      }
      onChange(result.url);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Upload ảnh thất bại';
      setError(msg);
    } finally {
      setUploading(false);
    }
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
        style={{ aspectRatio, opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? 'none' : 'auto' }}
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
        aria-disabled={uploading}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleSelect}
          style={{ display: 'none' }}
          disabled={uploading}
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
          {uploading ? (
            <>
              <Loader2 size={24} className="pe-uploader__spinner" />
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>Đang tải ảnh lên...</div>
            </>
          ) : (
            <>
              <Upload size={24} />
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Kéo thả ảnh hoặc bấm để chọn
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                JPG, PNG, WEBP, GIF, SVG · tối đa 2MB
              </div>
            </>
          )}
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
