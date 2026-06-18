'use client';

import { useDroppable, useDraggable } from '@dnd-kit/core';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { renderBlock } from './landing-block-renderers';
import { BLOCK_DEFINITIONS } from '../hooks/use-landing-pages';
import type { LandingBlock } from '@/features/admin/types';

interface LandingBlockCanvasProps {
  blocks: LandingBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function LandingBlockCanvas({
  blocks,
  selectedId,
  onSelect,
  onRemove,
  onDuplicate,
}: LandingBlockCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-root' });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: 'var(--gray-50)',
        border: isOver ? '2px dashed var(--primary, #1E3A5F)' : '1px solid var(--gray-200)',
        borderRadius: 8,
        minHeight: 500,
        padding: 16,
      }}
    >
      {blocks.length === 0 ? (
        <EmptyCanvas />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {blocks.map((block) => (
            <SortableCanvasBlock
              key={block.id}
              block={block}
              selected={selectedId === block.id}
              onSelect={() => onSelect(block.id)}
              onRemove={() => onRemove(block.id)}
              onDuplicate={() => onDuplicate(block.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SortableCanvasBlock({
  block,
  selected,
  onSelect,
  onRemove,
  onDuplicate,
}: {
  block: LandingBlock;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const def = BLOCK_DEFINITIONS.find((d) => d.type === block.type);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
    data: { type: block.type, from: 'canvas', blockId: block.id },
  });
  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      style={{
        position: 'relative',
        background: 'white',
        border: selected ? '2px solid var(--primary, #1E3A5F)' : '1px solid var(--gray-200)',
        borderRadius: 8,
        overflow: 'hidden',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          background: selected ? 'var(--primary-faint, #EFF3F8)' : 'var(--gray-50)',
          borderBottom: '1px solid var(--gray-200)',
          fontSize: '0.72rem',
        }}
      >
        <span
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', color: 'var(--gray-400)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </span>
        <span>{def?.icon}</span>
        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{def?.label ?? block.type}</span>
        <span style={{ color: 'var(--gray-400)' }}>· #{block.id.slice(-4)}</span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="action-btn"
          style={{ padding: '2px 6px' }}
          title="Nhân bản"
        >
          <Copy size={10} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="action-btn"
          style={{ padding: '2px 6px' }}
          title="Xóa"
        >
          <Trash2 size={10} color="var(--danger, #DC2626)" />
        </button>
      </div>
      <div style={{ pointerEvents: 'none' }}>
        {renderBlock({ type: block.type, props: block.props as unknown as Record<string, unknown> })}
      </div>
    </div>
  );
}

function EmptyCanvas() {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-empty' });
  return (
    <div
      ref={setNodeRef}
      style={{
        textAlign: 'center',
        padding: '80px 20px',
        color: 'var(--gray-400)',
        border: isOver ? '2px dashed var(--primary, #1E3A5F)' : '2px dashed var(--gray-300)',
        borderRadius: 8,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>📐</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Canvas trống</div>
      <div style={{ fontSize: '0.72rem', marginTop: 4 }}>
        Kéo block từ sidebar bên trái vào đây để bắt đầu.
      </div>
    </div>
  );
}