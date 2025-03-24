'use client';

import React, { useState } from 'react';
import AsyncErrorHandler from '@/lib/AsyncErrorHandler';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type FieldConfig = {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validator?: (value: string) => string | undefined;
  maxLength?: number;
};

interface EnhancedFormProps {
  title?: string;
  fields: FieldConfig[];
  submitLabel: string;
  cancelLabel?: string;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  initialValues?: Record<string, string>;
  successMessage?: string;
}

/**
 * EnhancedFormComponent - A reusable form component with robust error handling
 * 
 * Features:
 * - Field-level validation
 * - Comprehensive error handling
 * - Loading states and success feedback
 * - Error boundary integration
 */
const EnhancedFormComponent: React.FC<EnhancedFormProps> = ({
  title,
  fields,
  submitLabel,
  cancelLabel,
  onSubmit,
  onCancel,
  initialValues = {},
  successMessage = 'Submission successful!',
}) => {
  // Form state
  const [formData, setFormData] = useState<Record<string, string>>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // If we had a global error, clear it
    if (globalError) {
      setGlobalError(null);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate a single field
  const validateField = (name: string, value: string): string | undefined => {
    const field = fields.find(f => f.name === name);
    if (!field) return undefined;
    
    // Check required fields
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }
    
    // Check custom validator
    if (field.validator && value.trim()) {
      return field.validator(value);
    }
    
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate each field
    fields.forEach(field => {
      const value = formData[field.name] || '';
      const error = validateField(field.name, value);
      
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });
    
    setFieldErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setGlobalError(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setIsSuccess(true);
      
      // Reset form after successful submission
      if (!initialValues) {
        const emptyForm = fields.reduce<Record<string, string>>((acc, field) => {
          acc[field.name] = '';
          return acc;
        }, {});
        setFormData(emptyForm);
      }
    } catch (error) {
      // Use AsyncErrorHandler to process form errors
      const { message, fieldErrors: errorFields } = AsyncErrorHandler.handleFormError(error);
      
      // Display field-specific errors if available
      if (errorFields && Object.keys(errorFields).length > 0) {
        setFieldErrors(errorFields);
      } else {
        // Otherwise show a global error message
        setGlobalError(message);
      }
      
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form to initial state
  const resetForm = () => {
    setFormData(initialValues);
    setFieldErrors({});
    setGlobalError(null);
    setIsSuccess(false);
  };

  // Form field rendering
  const renderField = (field: FieldConfig) => {
    const { name, label, type, placeholder, required, options, maxLength } = field;
    const value = formData[name] || '';
    const error = fieldErrors[name];
    
    const baseClasses = `w-full p-3 rounded-lg focus:outline-none focus:ring-2 ${
      error 
        ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' 
        : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
    }`;
    
    // Input field common props
    const inputProps = {
      id: name,
      name,
      value,
      onChange: handleChange,
      placeholder,
      required,
      maxLength,
      className: baseClasses,
      'aria-invalid': error ? true : false,
      'aria-describedby': error ? `${name}-error` : undefined,
    };
    
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={4}
          />
        );
      case 'select':
        return (
          <select {...inputProps}>
            <option value="">Please select</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            {...inputProps}
            type={type}
          />
        );
    }
  };

  return (
    <ErrorBoundary boundary="enhanced-form">
      <div className="rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
        {title && (
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h2>
        )}
        
        {isSuccess ? (
          <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-6 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300">
            <div className="flex items-center">
              <svg 
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
            <div className="mt-4">
              <button 
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {globalError && (
              <div 
                className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
                role="alert"
              >
                {globalError}
              </div>
            )}
            
            <div className="space-y-6">
              {fields.map(field => (
                <div key={field.name}>
                  <label 
                    htmlFor={field.name} 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {renderField(field)}
                  
                  {fieldErrors[field.name] && (
                    <p 
                      id={`${field.name}-error`} 
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {fieldErrors[field.name]}
                    </p>
                  )}
                  
                  {field.maxLength && (
                    <div className="text-xs text-gray-500 mt-1">
                      {field.maxLength - (formData[field.name]?.length || 0)} characters remaining
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg font-medium text-white ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
              
              {cancelLabel && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {cancelLabel}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedFormComponent; 