'use client';

import React from 'react';
import {
  Column,
  ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: Column<TData, TValue>[];
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  initialSorting?: SortingState;
  initialColumnPinning?: ColumnPinningState;
}

function getRowId<TData>(originalRow: TData, index: number): string {
  const maybeId = (originalRow as { id?: string | number } | null | undefined)?.id;
  return maybeId != null ? String(maybeId) : String(index);
}

export function DataTable<TData, TValue>({
  data,
  columns,
  pageSize = 20,
  className = '',
  emptyMessage = 'Không có dữ liệu',
  initialSorting,
  initialColumnPinning,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting ?? []);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(
    initialColumnPinning ?? { left: [], right: [] },
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnPinning, rowSelection },
    onSortingChange: setSorting,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    getRowId,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className={`table-card ${className}`}>
      <div className="table-header">
        <div className="table-title">{selectedCount > 0 ? `Đã chọn ${selectedCount} dòng` : ''}</div>
        <div className="table-header-actions" />
      </div>
      <div className="table-wrap">
        <table className="data-table" style={{ position: 'relative' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
                    aria-label="Chọn tất cả"
                  />
                </th>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : 'none'}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span style={{ color: 'var(--gray-400)', fontSize: 10 }}>
                          {header.column.getIsSorted() === 'asc' ? '▲' : header.column.getIsSorted() === 'desc' ? '▼' : '⇅'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.getIsSelected()}
                      onChange={(event) => row.toggleSelected(event.target.checked)}
                      aria-label={`Chọn dòng ${row.id}`}
                    />
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
