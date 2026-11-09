'use client';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function SearchField({
  value,
  onChange,
  placeholder = 'Search medicines, facilities, transfers…',
  className = '',
  ariaLabel = 'Search',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <label className={`ui-search ${className}`}>
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="ui-search__icon"
        aria-hidden="true"
      />
      <input
        type="search"
        className="ui-search__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </label>
  );
}