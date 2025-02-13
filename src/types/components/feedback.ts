import type { BaseProps } from './shared'
import type { ReactNode, HTMLAttributes, ErrorInfo } from 'react'

/**
 * Props for the Alert component
 */
export interface AlertProps extends BaseProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  closable?: boolean
  onClose?: () => void
}

/**
 * Props for the Toast component and provider
 */
export interface ToastProps extends Omit<BaseProps, 'title'> {
  id?: string
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  variant?: 'default' | 'success' | 'info' | 'warning' | 'error'
  duration?: number
  closable?: boolean
  position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left'
  onClose?: () => void
}

export interface ToastProviderProps extends BaseProps {
  duration?: number
  swipeDirection?: 'up' | 'down' | 'left' | 'right'
  swipeThreshold?: number
  gutter?: number
  visibleToasts?: number
}

/**
 * Props for the Progress components
 */
export interface ProgressProps extends BaseProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'info' | 'warning' | 'error'
  showValue?: boolean
  valueFormatter?: (value: number, max: number) => string
  indeterminate?: boolean
}

export interface CircularProgressProps extends Omit<ProgressProps, 'size'> {
  size?: number | string
  thickness?: number
  rotation?: number
}

/**
 * Props for the Spinner component
 */
export interface SpinnerProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg' | number
  variant?: 'default' | 'primary' | 'secondary'
  label?: string
  labelPosition?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * Props for the LoadingOverlay component
 */
export interface LoadingOverlayProps extends BaseProps {
  visible: boolean
  blur?: number
  opacity?: number
  spinner?: ReactNode
  message?: ReactNode
  zIndex?: number
}

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  className?: string
  children?: ReactNode
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}

/**
 * Props for the Modal component
 */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  className?: string
  children?: ReactNode
  open?: boolean
  onClose?: () => void
  title?: ReactNode
  description?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'top'
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  preventScroll?: boolean
  showCloseButton?: boolean
}

/**
 * Props for the Popover component
 */
export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  className?: string
  children?: ReactNode
  content: ReactNode
  trigger?: 'click' | 'hover' | 'focus' | Array<'click' | 'hover' | 'focus'>
  position?: 'top' | 'right' | 'bottom' | 'left'
  offset?: number
  arrow?: boolean
  closeOnClick?: boolean
  closeOnEsc?: boolean
  openDelay?: number
  closeDelay?: number
} 