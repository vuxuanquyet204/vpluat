import { NEWS_TAGS } from '../lib/data/news-data';

export function SidebarTags() {
  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget__title">
        <i className="fa-solid fa-tags" aria-hidden="true" />
        Tags phổ biến
      </h3>
      <div className="tags-cloud">
        {NEWS_TAGS.map((tag) => (
          <span key={tag} className="tag-item" role="button" tabIndex={0}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
