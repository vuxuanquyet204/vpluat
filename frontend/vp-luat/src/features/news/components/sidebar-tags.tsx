'use client';

import { useAllTags } from '../hooks/use-news';

interface SidebarTagsProps {
  onSelectTag?: (tag: string) => void;
}

export function SidebarTags({ onSelectTag }: SidebarTagsProps) {
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

  if (tags.length === 0) {
    return null;
  }

  const handleClick = (tag: string) => {
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget__title">
        <i className="fa-solid fa-tags" aria-hidden="true" />
        Tags phổ biến
      </h3>
      <div className="tags-cloud">
        {tags.map((tag) =>
          onSelectTag ? (
            <button
              key={tag}
              type="button"
              className="tag-item"
              onClick={() => handleClick(tag)}
              aria-label={`Lọc bài viết theo tag ${tag}`}
            >
              {tag}
            </button>
          ) : (
            <span key={tag} className="tag-item" aria-label={`Tag: ${tag}`}>
              {tag}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
