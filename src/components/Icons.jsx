export function StatusIcon({ name, className = '' }) {
  return (
    <span className={`material-symbols-rounded status-icon ${className}`.trim()} aria-hidden="true">
      {name}
    </span>
  );
}

export function PlusIcon({ className = '' }) {
  return (
    <span className={`material-symbols-rounded ${className}`.trim()} aria-hidden="true">
      add
    </span>
  );
}

export function DeleteIcon({ className = '' }) {
  return (
    <span className={`material-symbols-rounded ${className}`.trim()} aria-hidden="true">
      delete
    </span>
  );
}
