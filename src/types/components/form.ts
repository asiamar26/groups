import type { BaseProps, FormFieldBaseProps } from './shared'

/**
 * Props for the Form component
 */
export interface FormProps extends BaseProps {
  onSubmit: (data: any) => void | Promise<void>
  defaultValues?: Record<string, any>
  resetOnSubmit?: boolean
}

/**
 * Props for the Input component
 */
export interface InputProps extends FormFieldBaseProps<string> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  autoComplete?: string
  maxLength?: number
  pattern?: string
}

/**
 * Props for the Textarea component
 */
export interface TextareaProps extends FormFieldBaseProps<string> {
  placeholder?: string
  rows?: number
  maxLength?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

/**
 * Props for the Select component
 */
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface SelectProps extends FormFieldBaseProps<string | string[]> {
  options: SelectOption[]
  placeholder?: string
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
}

/**
 * Props for the Checkbox component
 */
export interface CheckboxProps extends FormFieldBaseProps<boolean> {
  indeterminate?: boolean
}

/**
 * Props for the Radio component
 */
export interface RadioProps extends FormFieldBaseProps<string> {
  options: Array<{
    label: string
    value: string
    disabled?: boolean
  }>
}

/**
 * Props for the Switch component
 */
export interface SwitchProps extends FormFieldBaseProps<boolean> {
  onLabel?: string
  offLabel?: string
}

/**
 * Props for form validation messages
 */
export interface FormMessageProps extends BaseProps {
  error?: string
  success?: string
  info?: string
}

/**
 * Props for form field wrapper
 */
export interface FormFieldProps extends BaseProps {
  name: string
  label?: string
  error?: string
  description?: string
  required?: boolean
} 