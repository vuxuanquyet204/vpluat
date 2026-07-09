'use client';

import { useAllTags } from '../hooks/use-news';

export function SidebarTags() {
  const { data: tags = [], isLoading } = useAllTags();

  if (isLoading) {
    return (
      <div className="sidebar-widget">
        <h3 className="sidebar-widget__title">
          <i className="fa-solid fa-tags" aria-hidden="true" />
          Tags phổ biến
        </h3>
        <div className="tags-cloud">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: '28px', width: '80px', borderRadius: '4px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget__title">
        <i className="fa-solid fa-tags" aria-hidden="true" />
        Tags phổ biến
      </h3>
      <div className="tags-cloud">
        {tags.map((tag) => (
          <span key={tag} className="tag-item" role="button" tabIndex={0}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
