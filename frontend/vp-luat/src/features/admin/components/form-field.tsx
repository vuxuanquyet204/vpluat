'use client';

import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface BaseProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: ReactNode;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--gray-700)',
  marginBottom: 6,
};

const hintStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'var(--gray-400)',
  marginTop: 4,
};

const errorStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#DC2626',
  marginTop: 4,
};

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--gray-200)',
  borderRadius: 'var(--radius-md, 8px)',
  fontSize: '0.85rem',
  color: 'var(--gray-700)',
  background: 'var(--white)',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

export const FormFieldInput = forwardRef<HTMLInputElement, InputProps>(function FormFieldInput(
  { label, error, hint, required, leftIcon, ...rest },
  ref,
) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <span
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-400)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          {...rest}
          style={{
            ...inputBaseStyle,
            ...(leftIcon ? { paddingLeft: 34 } : null),
            ...(error ? { borderColor: '#DC2626' } : null),
            ...rest.style,
          }}
        />
      </div>
      {error ? <div style={errorStyle}>{error}</div> : hint ? <div style={hintStyle}>{hint}</div> : null}
    </div>
  );
});

export const FormFieldSelect = forwardRef<HTMLSelectElement, SelectProps>(function FormFieldSelect(
  { label, error, hint, required, children, ...rest },
  ref,
) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <select
        ref={ref}
        {...rest}
        style={{
          ...inputBaseStyle,
          ...(error ? { borderColor: '#DC2626' } : null),
          ...rest.style,
        }}
      >
        {children}
      </select>
      {error ? <div style={errorStyle}>{error}</div> : hint ? <div style={hintStyle}>{hint}</div> : null}
    </div>
  );
});

export const FormFieldTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function FormFieldTextarea(
  { label, error, hint, required, ...rest },
  ref,
) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={labelStyle}>
          {label}
          {required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        {...rest}
        style={{
          ...inputBaseStyle,
          minHeight: 80,
          resize: 'vertical',
          fontFamily: 'inherit',
          ...(error ? { borderColor: '#DC2626' } : null),
          ...rest.style,
        }}
      />
      {error ? <div style={errorStyle}>{error}</div> : hint ? <div style={hintStyle}>{hint}</div> : null}
    </div>
  );
});
