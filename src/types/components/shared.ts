import { type HTMLAttributes, type ReactNode } from 'react'

/**
 * Base props that should be available to all components
 */
export interface BaseProps extends HTMLAttributes<HTMLElement> {
  className?: string
  children?: ReactNode
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  disabled?: boolean
  loading?: boolean
}

/**
 * Props for components that can have a variant
 */
export interface VariantProps<T = string> {
  variant?: T
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Props for components that can be controlled
 */
export interface ControlledProps<T = any> {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}

/**
 * Props for form field components
 */
export interface FieldProps extends BaseProps, DisableableProps {
  label?: string
  error?: string
  required?: boolean
  description?: string
}

/**
 * Props for components that can handle user interaction
 */
export interface InteractiveProps extends BaseProps, DisableableProps {
  onClick?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

/**
 * Props for components that can be validated
 */
export interface ValidatableProps {
  error?: string
  touched?: boolean
  valid?: boolean
}

/**
 * Props for components that can be styled with intent
 */
export type Intent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'

export interface IntentProps {
  intent?: Intent
}

/**
 * Props for components that can have different visual states
 */
export interface VisualStateProps {
  isActive?: boolean
  isHovered?: boolean
  isFocused?: boolean
  isSelected?: boolean
}

/**
 * Props for components that can be animated
 */
export interface AnimatableProps {
  animate?: boolean
  animation?: string
  duration?: number
  delay?: number
}

/**
 * Combined form field props
 */
export type FormFieldBaseProps<T = any> = Omit<FieldProps, 'defaultValue'> & ControlledProps<T> & ValidatableProps 