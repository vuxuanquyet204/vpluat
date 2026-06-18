'use client';

import { useState } from 'react';
import { Bold, Italic, Underline, Link2, Image as ImageIcon, List, Code, Quote } from 'lucide-react';

interface CampaignEditorProps {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

/** Mini rich-text editor: dùng contentEditable + execCommand (legacy, nhưng đủ cho mock). */
export function CampaignEditor({ value, onChange, rows = 12 }: CampaignEditorProps) {
  const [mode, setMode] = useState<'html' | 'plain'>('html');

  const exec = (cmd: string, arg?: string) => {
    if (typeof document === 'undefined') return;
    document.execCommand(cmd, false, arg);
  };

  const insertLink = () => {
    const url = window.prompt('Nhập URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt('Nhập URL ảnh:', 'https://');
    if (url) exec('insertImage', url);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 6,
          background: 'var(--gray-50)',
          border: '1px solid var(--gray-200)',
          borderBottom: 'none',
          borderRadius: '6px 6px 0 0',
          flexWrap: 'wrap',
        }}
      >
        {mode === 'html' ? (
          <>
            <ToolbarButton icon={<Bold size={12} />} label="Bold" onClick={() => exec('bold')} />
            <ToolbarButton icon={<Italic size={12} />} label="Italic" onClick={() => exec('italic')} />
            <ToolbarButton
              icon={<Underline size={12} />}
              label="Underline"
              onClick={() => exec('underline')}
            />
            <Divider />
            <ToolbarButton icon={<Link2 size={12} />} label="Link" onClick={insertLink} />
            <ToolbarButton icon={<ImageIcon size={12} />} label="Image" onClick={insertImage} />
            <Divider />
            <ToolbarButton
              icon={<List size={12} />}
              label="Bulleted list"
              onClick={() => exec('insertUnorderedList')}
            />
            <ToolbarButton icon={<Quote size={12} />} label="Quote" onClick={() => exec('formatBlock', 'blockquote')} />
            <ToolbarButton
              icon={<Code size={12} />}
              label="Code"
              onClick={() => exec('formatBlock', 'pre')}
            />
          </>
        ) : null}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => {
            if (mode === 'html') {
              setMode('plain');
            } else {
              setMode('html');
            }
          }}
          className="action-btn"
          style={{ fontSize: '0.7rem', padding: '2px 8px' }}
        >
          {mode === 'html' ? 'HTML' : 'Plain'}
        </button>
      </div>

      {mode === 'html' ? (
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
          dangerouslySetInnerHTML={{ __html: value }}
          style={{
            minHeight: rows * 18,
            padding: 10,
            border: '1px solid var(--gray-200)',
            borderRadius: '0 0 6px 6px',
            background: 'white',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            outline: 'none',
            overflowY: 'auto',
          }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          style={{
            width: '100%',
            padding: 10,
            border: '1px solid var(--gray-200)',
            borderRadius: '0 0 6px 6px',
            fontSize: '0.85rem',
            outline: 'none',
            fontFamily: 'monospace',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      )}

      <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 4 }}>
        Hỗ trợ HTML cơ bản. Dùng {'{{name}}'}, {'{{email}}'} làm placeholder cá nhân hoá.
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 26,
        height: 26,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: 4,
        cursor: 'pointer',
        color: 'var(--gray-700)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: 'var(--gray-200)', margin: '0 4px' }} />;
}