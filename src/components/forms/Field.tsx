import * as React from "react";

type BaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

export function TextField({
  label,
  name,
  error,
  hint,
  required,
  type = "text",
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="vc-label">
        {label} {required && <span className="text-[var(--brand)]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : hint ? `${name}-hint` : undefined}
        className="vc-input"
        {...rest}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="vc-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-err`} className="vc-hint !text-[var(--brand-ink)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  required,
  rows = 4,
  ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={name} className="vc-label">
        {label} {required && <span className="text-[var(--brand)]">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : hint ? `${name}-hint` : undefined}
        className="vc-input"
        {...rest}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="vc-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-err`} className="vc-hint !text-[var(--brand-ink)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  name,
  error,
  hint,
  required,
  children,
  ...rest
}: BaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
  }) {
  return (
    <div>
      <label htmlFor={name} className="vc-label">
        {label} {required && <span className="text-[var(--brand)]">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : hint ? `${name}-hint` : undefined}
        className="vc-input bg-white"
        defaultValue=""
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={`${name}-hint`} className="vc-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-err`} className="vc-hint !text-[var(--brand-ink)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({
  label,
  name,
  error,
  required,
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          id={name}
          name={name}
          type="checkbox"
          required={required}
          aria-invalid={!!error}
          className="mt-1 w-5 h-5 accent-[var(--brand)] flex-shrink-0"
          {...rest}
        />
        <span className="text-sm text-[var(--ink-soft)] leading-relaxed">
          {label}
        </span>
      </label>
      {error && (
        <p className="vc-hint !text-[var(--brand-ink)] mt-1">{error}</p>
      )}
    </div>
  );
}
