'use client';

export interface SegmentOption {
  value: string;
  label: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div className={`ui-seg ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`ui-seg__item ${value === option.value ? 'is-active' : ''}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}