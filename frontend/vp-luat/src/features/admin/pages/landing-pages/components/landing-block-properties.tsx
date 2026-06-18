'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import type { LandingBlock, LandingBlockType } from '@/features/admin/types';
import { BLOCK_DEFINITIONS } from '../hooks/use-landing-pages';

interface LandingBlockPropertiesProps {
  block: LandingBlock | null;
  onChange: (patch: Record<string, unknown>) => void;
}

export function LandingBlockProperties({ block, onChange }: LandingBlockPropertiesProps) {
  if (!block) {
    return (
      <div
        style={{
          padding: 32,
          textAlign: 'center',
          color: 'var(--gray-400)',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚙️</div>
        Chọn 1 block trong canvas để chỉnh sửa.
      </div>
    );
  }

  const def = BLOCK_DEFINITIONS.find((d) => d.type === block.type);
  return (
    <div style={{ padding: 12 }}>
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--gray-700)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{def?.icon}</span> {def?.label} — Properties
      </div>
      <PropertiesByType block={block} onChange={onChange} />
    </div>
  );
}

function PropertiesByType({
  block,
  onChange,
}: {
  block: LandingBlock;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const setProp = (key: string, value: unknown) =>
    onChange({ ...(block.props as unknown as Record<string, unknown>), [key]: value });

  const setArrayItem = (key: string, idx: number, value: unknown) => {
    const props = block.props as unknown as Record<string, unknown>;
    const arr = Array.isArray(props[key]) ? [...(props[key] as unknown[])] : [];
    arr[idx] = value;
    setProp(key, arr);
  };
  const addArrayItem = (key: string, value: unknown) => {
    const props = block.props as unknown as Record<string, unknown>;
    const arr = Array.isArray(props[key]) ? [...(props[key] as unknown[])] : [];
    arr.push(value);
    setProp(key, arr);
  };
  const removeArrayItem = (key: string, idx: number) => {
    const props = block.props as unknown as Record<string, unknown>;
    const arr = Array.isArray(props[key]) ? [...(props[key] as unknown[])] : [];
    arr.splice(idx, 1);
    setProp(key, arr);
  };

  const p = block.props as unknown as Record<string, unknown>;

  switch (block.type) {
    case 'hero':
      return (
        <div style={col()}>
          <Field label="Headline" required>
            <Input value={(p.headline as string) ?? ''} onChange={(v) => setProp('headline', v)} />
          </Field>
          <Field label="Eyebrow">
            <Input value={(p.eyebrow as string) ?? ''} onChange={(v) => setProp('eyebrow', v)} />
          </Field>
          <Field label="Subheadline">
            <Textarea value={(p.subheadline as string) ?? ''} onChange={(v) => setProp('subheadline', v)} />
          </Field>
          <Field label="CTA text">
            <Input value={(p.ctaText as string) ?? ''} onChange={(v) => setProp('ctaText', v)} />
          </Field>
          <Field label="CTA link">
            <Input value={(p.ctaLink as string) ?? ''} onChange={(v) => setProp('ctaLink', v)} />
          </Field>
          <Field label="Background image URL">
            <Input
              value={(p.backgroundImage as string) ?? ''}
              onChange={(v) => setProp('backgroundImage', v)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Align">
            <Select
              value={(p.align as string) ?? 'left'}
              options={[
                { value: 'left', label: 'Trái' },
                { value: 'center', label: 'Giữa' },
                { value: 'right', label: 'Phải' },
              ]}
              onChange={(v) => setProp('align', v)}
            />
          </Field>
        </div>
      );

    case 'text':
      return (
        <div style={col()}>
          <Field label="Nội dung" required>
            <Textarea
              value={(p.content as string) ?? ''}
              onChange={(v) => setProp('content', v)}
              rows={6}
            />
          </Field>
          <Field label="Max width (px)">
            <Input
              type="number"
              value={String(p.maxWidth ?? 800)}
              onChange={(v) => setProp('maxWidth', Number(v) || 800)}
            />
          </Field>
          <Field label="Align">
            <Select
              value={(p.align as string) ?? 'left'}
              options={[
                { value: 'left', label: 'Trái' },
                { value: 'center', label: 'Giữa' },
                { value: 'right', label: 'Phải' },
              ]}
              onChange={(v) => setProp('align', v)}
            />
          </Field>
        </div>
      );

    case 'image':
      return (
        <div style={col()}>
          <Field label="Image URL" required>
            <Input value={(p.src as string) ?? ''} onChange={(v) => setProp('src', v)} />
          </Field>
          <Field label="Alt (bắt buộc cho SEO)" required>
            <Input value={(p.alt as string) ?? ''} onChange={(v) => setProp('alt', v)} />
          </Field>
          <Field label="Caption">
            <Input value={(p.caption as string) ?? ''} onChange={(v) => setProp('caption', v)} />
          </Field>
          <Field label="Width (px)">
            <Input
              type="number"
              value={String(p.width ?? '')}
              onChange={(v) => setProp('width', v ? Number(v) : undefined)}
            />
          </Field>
          <Field label="">
            <Checkbox
              checked={Boolean(p.rounded)}
              onChange={(v) => setProp('rounded', v)}
              label="Bo góc tròn"
            />
          </Field>
        </div>
      );

    case 'cta':
      return (
        <div style={col()}>
          <Field label="Text" required>
            <Input value={(p.text as string) ?? ''} onChange={(v) => setProp('text', v)} />
          </Field>
          <Field label="Link" required>
            <Input value={(p.link as string) ?? ''} onChange={(v) => setProp('link', v)} />
          </Field>
          <Field label="Variant">
            <Select
              value={(p.variant as string) ?? 'primary'}
              options={[
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'outline', label: 'Outline' },
              ]}
              onChange={(v) => setProp('variant', v)}
            />
          </Field>
          <Field label="Icon (emoji)">
            <Input value={(p.icon as string) ?? ''} onChange={(v) => setProp('icon', v)} />
          </Field>
        </div>
      );

    case 'lead-form':
      return (
        <div style={col()}>
          <Field label="Submit text" required>
            <Input
              value={(p.submitText as string) ?? ''}
              onChange={(v) => setProp('submitText', v)}
            />
          </Field>
          <Field label="Success message">
            <Textarea
              value={(p.successMessage as string) ?? ''}
              onChange={(v) => setProp('successMessage', v)}
              rows={2}
            />
          </Field>
          <Field label="Redirect URL">
            <Input
              value={(p.redirectTo as string) ?? ''}
              onChange={(v) => setProp('redirectTo', v)}
            />
          </Field>
        </div>
      );

    case 'testimonials':
    case 'reviews':
      return (
        <div style={col()}>
          <Field label="Limit">
            <Input
              type="number"
              value={String(p.limit ?? 6)}
              onChange={(v) => setProp('limit', Number(v) || 1)}
            />
          </Field>
          <Field label="Layout">
            <Select
              value={(p.layout as string) ?? 'grid'}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
                { value: 'carousel', label: 'Carousel' },
              ]}
              onChange={(v) => setProp('layout', v)}
            />
          </Field>
          {block.type === 'testimonials' && (
            <Field label="Min rating (1-5)">
              <Input
                type="number"
                value={String(p.minRating ?? 4)}
                onChange={(v) => setProp('minRating', Number(v) || 1)}
              />
            </Field>
          )}
          {block.type === 'reviews' && (
            <Field label="">
              <Checkbox
                checked={Boolean(p.showRating)}
                onChange={(v) => setProp('showRating', v)}
                label="Hiện rating"
              />
            </Field>
          )}
        </div>
      );

    case 'pricing': {
      const ids = (p.serviceIds as string[]) ?? [];
      const [newId, setNewId] = useState('');
      return (
        <div style={col()}>
          <Field label="Tiêu đề">
            <Input value={(p.title as string) ?? ''} onChange={(v) => setProp('title', v)} />
          </Field>
          <Field label="Service IDs">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ids.map((id, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 4 }}>
                  <Input value={id} onChange={(v) => setArrayItem('serviceIds', idx, v)} />
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => removeArrayItem('serviceIds', idx)}
                  >
                    <Trash2 size={11} color="var(--danger, #DC2626)" />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 4 }}>
                <Input value={newId} onChange={setNewId} placeholder="VD: svc-1" />
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    if (newId.trim()) {
                      addArrayItem('serviceIds', newId.trim());
                      setNewId('');
                    }
                  }}
                >
                  <Plus size={11} />
                </button>
              </div>
            </div>
          </Field>
          <Field label="">
            <Checkbox
              checked={Boolean(p.showButton)}
              onChange={(v) => setProp('showButton', v)}
              label="Hiện nút Đặt lịch"
            />
          </Field>
        </div>
      );
    }

    case 'faq': {
      const items = (p.items as Array<{ question: string; answer: string }>) ?? [];
      return (
        <div style={col()}>
          <Field label="Tiêu đề">
            <Input value={(p.title as string) ?? ''} onChange={(v) => setProp('title', v)} />
          </Field>
          <Field label="FAQ items">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 8,
                    background: 'var(--gray-50)',
                    borderRadius: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <Input
                    value={it.question}
                    onChange={(v) => {
                      const arr = [...items];
                      arr[idx] = { ...arr[idx], question: v };
                      setProp('items', arr);
                    }}
                    placeholder="Câu hỏi"
                  />
                  <Textarea
                    value={it.answer}
                    onChange={(v) => {
                      const arr = [...items];
                      arr[idx] = { ...arr[idx], answer: v };
                      setProp('items', arr);
                    }}
                    placeholder="Câu trả lời"
                    rows={2}
                  />
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => removeArrayItem('items', idx)}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    <Trash2 size={11} color="var(--danger, #DC2626)" /> Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="action-btn"
                onClick={() =>
                  addArrayItem('items', { question: 'Câu hỏi mới?', answer: 'Câu trả lời...' })
                }
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={11} /> Thêm FAQ
              </button>
            </div>
          </Field>
        </div>
      );
    }

    case 'news':
      return (
        <div style={col()}>
          <Field label="Category (slug)">
            <Input value={(p.category as string) ?? ''} onChange={(v) => setProp('category', v)} />
          </Field>
          <Field label="Limit">
            <Input
              type="number"
              value={String(p.limit ?? 3)}
              onChange={(v) => setProp('limit', Number(v) || 1)}
            />
          </Field>
          <Field label="Layout">
            <Select
              value={(p.layout as string) ?? 'grid'}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
              ]}
              onChange={(v) => setProp('layout', v)}
            />
          </Field>
        </div>
      );

    case 'lawyers': {
      const specs = (p.specialties as string[]) ?? [];
      return (
        <div style={col()}>
          <Field label="Specialties">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {specs.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 4 }}>
                  <Input value={s} onChange={(v) => setArrayItem('specialties', idx, v)} />
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => removeArrayItem('specialties', idx)}
                  >
                    <Trash2 size={11} color="var(--danger, #DC2626)" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="action-btn"
                onClick={() => addArrayItem('specialties', '')}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={11} /> Thêm specialty
              </button>
            </div>
          </Field>
          <Field label="Limit">
            <Input
              type="number"
              value={String(p.limit ?? 4)}
              onChange={(v) => setProp('limit', Number(v) || 1)}
            />
          </Field>
          <Field label="">
            <Checkbox
              checked={Boolean(p.showSchedule)}
              onChange={(v) => setProp('showSchedule', v)}
              label="Hiện lịch"
            />
          </Field>
        </div>
      );
    }

    case 'map':
      return (
        <div style={col()}>
          <Field label="Embed URL" required>
            <Input
              value={(p.embedUrl as string) ?? ''}
              onChange={(v) => setProp('embedUrl', v)}
            />
          </Field>
          <Field label="Height (px)">
            <Input
              type="number"
              value={String(p.height ?? 400)}
              onChange={(v) => setProp('height', Number(v) || 400)}
            />
          </Field>
          <Field label="Title">
            <Input value={(p.title as string) ?? ''} onChange={(v) => setProp('title', v)} />
          </Field>
        </div>
      );

    case 'contact':
      return (
        <div style={col()}>
          <Field label="Address" required>
            <Input
              value={(p.address as string) ?? ''}
              onChange={(v) => setProp('address', v)}
            />
          </Field>
          <Field label="Phone" required>
            <Input
              value={(p.phone as string) ?? ''}
              onChange={(v) => setProp('phone', v)}
            />
          </Field>
          <Field label="Email" required>
            <Input
              value={(p.email as string) ?? ''}
              onChange={(v) => setProp('email', v)}
            />
          </Field>
          <Field label="Working hours">
            <Input
              value={(p.workingHours as string) ?? ''}
              onChange={(v) => setProp('workingHours', v)}
            />
          </Field>
          <Field label="">
            <Checkbox
              checked={Boolean(p.showMap)}
              onChange={(v) => setProp('showMap', v)}
              label="Hiện bản đồ"
            />
          </Field>
        </div>
      );

    default:
      return <div style={{ color: 'var(--danger, #DC2626)' }}>Unknown block: {block.type}</div>;
  }
}

// ─── Reusable form controls ────────────────────────────────────────────
function col(): React.CSSProperties {
  return { display: 'flex', flexDirection: 'column', gap: 10 };
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--gray-700)',
            marginBottom: 4,
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger, #DC2626)' }}> *</span>}
        </label>
      )}
      {children}
    </div>
  );
}
function Input({
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '6px 10px',
        border: '1px solid var(--gray-200)',
        borderRadius: 4,
        fontSize: '0.82rem',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}
function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '6px 10px',
        border: '1px solid var(--gray-200)',
        borderRadius: 4,
        fontSize: '0.82rem',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    />
  );
}
function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 24px 6px 10px',
          border: '1px solid var(--gray-200)',
          borderRadius: 4,
          fontSize: '0.82rem',
          background: 'white',
          appearance: 'none',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        color="var(--gray-400)"
      />
    </div>
  );
}
function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}