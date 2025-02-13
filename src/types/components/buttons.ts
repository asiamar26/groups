import type { BaseProps } from './shared'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

/**
 * Props for the Button component
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rounded?: boolean
  asChild?: boolean
}

/**
 * Props for the IconButton component
 */
export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'loadingText'> {
  icon: ReactNode
  label?: string
  tooltipProps?: {
    content: string
    position?: 'top' | 'right' | 'bottom' | 'left'
    delay?: number
  }
}

/**
 * Props for the ButtonGroup component
 */
export interface ButtonGroupProps extends BaseProps {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  orientation?: 'horizontal' | 'vertical'
  spacing?: number | string
  attached?: boolean
}

/**
 * Props for the ToggleButton component
 */
export interface ToggleButtonProps extends Omit<ButtonProps, 'onChange'> {
  pressed?: boolean
  defaultPressed?: boolean
  onChange?: (pressed: boolean) => void
}

/**
 * Props for the ToggleButtonGroup component
 */
export interface ToggleButtonGroupOption {
  value: string
  label: string | ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface ToggleButtonGroupProps extends Omit<BaseProps, 'onChange'> {
  options: ToggleButtonGroupOption[]
  value?: string | string[]
  defaultValue?: string | string[]
  multiple?: boolean
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  onChange?: (value: string | string[]) => void
}

/**
 * Props for the SplitButton component
 */
export interface SplitButtonProps extends Omit<ButtonProps, 'onClick'> {
  text: string
  menuItems: Array<{
    label: string
    icon?: ReactNode
    onClick: () => void
    disabled?: boolean
    divider?: boolean
  }>
  onMainClick?: () => void
}

/**
 * Props for the FloatingActionButton component
 */
export interface FloatingActionButtonProps extends Omit<ButtonProps, 'size'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  offset?: number | { x: number; y: number }
  size?: 'sm' | 'md' | 'lg' | number
  extended?: boolean
  showOnScroll?: boolean
  scrollThreshold?: number
} 