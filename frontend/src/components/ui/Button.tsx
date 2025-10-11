import React from 'react';
import { cn } from '../../utils/cn';
import { ButtonProps } from '../../types';

const buttonVariants = {
  variant: {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-300',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-300',
    tertiary: 'bg-tertiary-500 text-white hover:bg-tertiary-600 focus:ring-tertiary-300',
    outline: 'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-primary-300',
    ghost: 'text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-primary-300',
  },
  size: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant styles
        buttonVariants.variant[variant],
        // Size styles
        buttonVariants.size[size],
        // Custom className
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Đang xử lý...
        </>
      ) : (
        children
      )}
    </button>
  );
};
