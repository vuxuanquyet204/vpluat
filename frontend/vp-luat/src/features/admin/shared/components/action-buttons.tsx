interface ActionButtonsProps {
  actions?: Array<{
    label: string;
    variant?: 'default' | 'primary' | 'danger';
    onClick?: () => void;
  }>;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionButtons({
  actions,
  onView,
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  const defaultActions = [
    ...(onView ? [{ label: 'Xem', variant: 'default' as const, onClick: onView }] : []),
    ...(onEdit ? [{ label: 'Sửa', variant: 'default' as const, onClick: onEdit }] : []),
    ...(onDelete ? [{ label: 'Xóa', variant: 'danger' as const, onClick: onDelete }] : []),
  ];

  const btns = actions ?? defaultActions;

  return (
    <div className="action-btns">
      {btns.map((btn, i) => (
        <button
          key={i}
          type="button"
          className={`action-btn ${btn.variant ? `action-btn--${btn.variant}` : ''}`}
          onClick={btn.onClick}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
