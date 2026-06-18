'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { BLOCK_DEFINITIONS } from '../hooks/use-landing-pages';
import type { LandingBlockType } from '@/features/admin/types';

export function LandingBlockLibrary() {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
        height: '100%',
        overflow: 'auto',
        padding: 8,
      }}
    >
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--gray-700)',
          marginBottom: 8,
          padding: '0 4px',
        }}
      >
        Blocks — kéo thả vào canvas
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {BLOCK_DEFINITIONS.map((def) => (
          <DraggableBlock key={def.type} type={def.type} />
        ))}
      </div>
    </div>
  );
}

function DraggableBlock({ type }: { type: LandingBlockType }) {
  const def = BLOCK_DEFINITIONS.find((d) => d.type === type);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}`,
    data: { type, from: 'library' },
  });
  if (!def) return null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        background: isDragging ? 'var(--primary-faint, #EFF3F8)' : 'var(--gray-50)',
        border: '1px solid var(--gray-200)',
        borderRadius: 6,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      <GripVertical size={12} color="var(--gray-400)" />
      <span style={{ fontSize: 18 }}>{def.icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-800)' }}>
          {def.label}
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            color: 'var(--gray-500)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {def.description}
        </div>
      </div>
    </div>
  );
}