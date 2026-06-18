'use client';

import { useState, type ReactNode } from 'react';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { EmptyStateWithCta } from './empty-state-with-cta';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: ReactNode;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableBulkAction<T> {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  onClick: (selected: T[]) => void;
  disabled?: (selected: T[]) => boolean;
}

interface DataTableV2Props<T extends { id: string }> {
  data: T[] | undefined;
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  rowKey?: (row: T) => string;
  selectable?: boolean;
  bulkActions?: DataTableBulkAction<T>[];
  rowActionMenu?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  defaultSort?: { by: keyof T; dir: 'asc' | 'desc' };
}

export function DataTableV2<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  selectable = false,
  bulkActions = [],
  rowActionMenu,
  onRowClick,
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription,
  emptyAction,
  defaultSort,
}: DataTableV2Props<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ by: keyof T; dir: 'asc' | 'desc' } | null>(
    defaultSort ?? null,
  );

  const toggleAll = () => {
    if (!data) return;
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map((d) => d.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const sortedData = (() => {
    if (!data) return [];
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const av = a[sort.by] as unknown;
      const bv = b[sort.by] as unknown;
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  })();

  const selectedRows = (data ?? []).filter((d) => selected.has(d.id));

  return (
    <div>
      {selectable && selected.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            background: 'var(--blue-bg)',
            borderRadius: 'var(--radius-md, 8px)',
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 600 }}>
            Đã chọn {selected.size}
          </span>
          <button
            type="button"
            className="action-btn"
            onClick={() => setSelected(new Set())}
            style={{ marginLeft: 'auto' }}
          >
            Bỏ chọn
          </button>
          {bulkActions.map((ba) => {
            const disabled = ba.disabled?.(selectedRows) ?? false;
            const cls =
              ba.variant === 'danger'
                ? 'action-btn action-btn--danger'
                : ba.variant === 'primary'
                ? 'action-btn action-btn--primary'
                : 'action-btn';
            return (
              <button
                key={ba.label}
                type="button"
                className={cls}
                onClick={() => ba.onClick(selectedRows)}
                disabled={disabled}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {ba.icon}
                {ba.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={Boolean(data && data.length > 0 && selected.size === data.length)}
                    ref={(el) => {
                      if (el) el.indeterminate = selected.size > 0 && selected.size < (data?.length ?? 0);
                    }}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => {
                const colKey = col.key as string;
                const sortable = col.sortable;
                const isSorted = sort && String(sort.by) === colKey;
                return (
                  <th
                    key={colKey}
                    style={{
                      width: col.width,
                      textAlign: col.align ?? 'left',
                      cursor: sortable ? 'pointer' : undefined,
                      userSelect: sortable ? 'none' : undefined,
                    }}
                    onClick={sortable ? () => setSort((s) => {
                      const by = col.key as keyof T;
                      if (s && String(s.by) === colKey) return { by, dir: s.dir === 'asc' ? 'desc' : 'asc' };
                      return { by, dir: 'asc' };
                    }) : undefined}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.header}
                      {sortable && (
                        <span style={{ color: isSorted ? 'var(--primary)' : 'var(--gray-300)' }}>
                          {isSorted && sort?.dir === 'asc' ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
              {rowActionMenu && <th style={{ width: 50 }} aria-label="Hành động" />}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (rowActionMenu ? 1 : 0)}
                  style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}
                >
                  <Loader2 size={20} className="animate-spin" style={{ display: 'inline-block', marginRight: 8 }} />
                  Đang tải...
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActionMenu ? 1 : 0)}>
                  <EmptyStateWithCta
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{ cursor: onRowClick ? 'pointer' : undefined }}
                >
                  {selectable && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label="Chọn dòng"
                        checked={selected.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const colKey = col.key as string;
                    return (
                      <td
                        key={colKey}
                        style={{ textAlign: col.align ?? 'left' }}
                      >
                        {col.cell ? col.cell(row) : (row as Record<string, unknown>)[colKey] as ReactNode}
                      </td>
                    );
                  })}
                  {rowActionMenu && (
                    <td onClick={(e) => e.stopPropagation()}>{rowActionMenu(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
