'use client';

import { Search } from 'lucide-react';

interface SidebarSearchProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export function SidebarSearch({ value, onChange, onSubmit }: SidebarSearchProps) {
  return (
    <form
      className="sidebar-search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="search"
        className="sidebar-search__input"
        placeholder="Tìm kiếm bài viết..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Tìm kiếm bài viết"
      />
      <button type="submit" className="sidebar-search__btn" aria-label="Tìm kiếm">
        <Search size={16} />
      </button>
    </form>
  );
}
