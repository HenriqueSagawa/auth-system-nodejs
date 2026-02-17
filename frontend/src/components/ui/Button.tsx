import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  isLoading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : null}
      <span className={isLoading ? 'btn-text-loading' : ''}>{children}</span>
    </button>
  );
}