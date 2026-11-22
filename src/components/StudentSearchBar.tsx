'use client';

import type { ChangeEvent } from 'react';

const MAX_LENGTH = 100;
const LENGTH_ERROR = 'Search is limited to 100 characters.';
const INPUT_ID = 'student-search';
const ERROR_ID = 'student-search-error';

interface StudentSearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export default function StudentSearchBar({
  value = '',
  onChange,
  error = null,
}: StudentSearchBarProps) {
  const text = typeof value === 'string' ? value : '';
  const message = error ?? (text.length > MAX_LENGTH ? LENGTH_ERROR : null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  function handleClear() {
    onChange('');
  }

  return (
    <div data-nexen-component="nx_components_StudentSearchBar" className="w-full min-w-0">
      <label
        htmlFor={INPUT_ID}
        className="mb-1.5 block text-sm font-medium text-foreground"
       data-nexen-id="nx-e02b279c-0">
        Search by student name
      </label>

      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id={INPUT_ID}
            type="search"
            value={text}
            onChange={handleChange}
            maxLength={MAX_LENGTH}
            placeholder="Type a name"
            autoComplete="off"
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? ERROR_ID : undefined}
            className="h-10 w-full rounded-[var(--radius)] border border-border bg-card pl-9 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
           data-nexen-id="nx-e02b279c-1"/>
        </div>

        {text.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="h-10 shrink-0 rounded-[var(--radius)] border border-border bg-transparent px-3 text-sm font-medium text-foreground hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
           data-nexen-id="nx-e02b279c-2">
            Clear
          </button>
        )}
      </div>

      {message && (
        <p id={ERROR_ID} role="alert" className="mt-1.5 text-sm text-destructive" data-nexen-id="nx-e02b279c-3">
          {message}
        </p>
      )}
    </div>
  );
}