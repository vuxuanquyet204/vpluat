interface FilterTabsProps {
  tabs: Array<{ value: string; label: string; count?: number }>;
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterTabs({
  tabs,
  activeValue,
  onChange,
  className = '',
}: FilterTabsProps) {
  return (
    <div className={`filter-bar ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === activeValue}
          className={`filter-tab ${tab.value === activeValue ? 'filter-tab--active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="filter-tab__count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
