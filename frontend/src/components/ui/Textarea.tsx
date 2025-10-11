import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { InputProps } from '../../types';

export interface TextareaProps extends 
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>,
  InputProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, required, disabled, className, ...props }, ref) => {
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium text-gray-700',
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              disabled && 'text-gray-400'
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={cn(
            // Base styles
            'block w-full rounded-md border px-3 py-2 text-sm transition-colors duration-200',
            'placeholder:text-gray-400 resize-vertical',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            // Conditional styles based on state
            error
              ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 text-gray-900 focus:border-primary-500 focus:ring-primary-500',
            disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            className
          )}
          {...props}
        />
        
        {(error || helperText) && (
          <div className="text-xs">
            {error ? (
              <p className="text-red-600 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            ) : (
              <p className="text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
