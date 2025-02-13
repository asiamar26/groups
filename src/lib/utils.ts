import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  type ThemeColor, 
  type IconSize, 
  type FontSize,
  type FontWeight,
  type BorderRadius,
  type Shadow,
  themeColors,
  iconSizes,
  fontSizes,
  fontWeights,
  borderRadius,
  shadows
} from "./theme"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getColorClass(color: ThemeColor, shade: keyof typeof themeColors.primary = 500) {
  return `text-${color}-${shade}`
}

export function getBgColorClass(color: ThemeColor, shade: keyof typeof themeColors.primary = 500) {
  return `bg-${color}-${shade}`
}

export function getIconSizeClass(size: IconSize) {
  return iconSizes[size]
}

export function getFontSizeClass(size: FontSize) {
  return fontSizes[size]
}

export function getFontWeightClass(weight: FontWeight) {
  return fontWeights[weight]
}

export function getBorderRadiusClass(radius: BorderRadius) {
  return borderRadius[radius]
}

export function getShadowClass(shadow: Shadow) {
  return shadows[shadow]
}

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
}: {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
} = {}) {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-colors',
    getBorderRadiusClass('md'),
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    disabled && 'opacity-50 cursor-not-allowed'
  )

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const variantClasses = {
    primary: cn(
      getBgColorClass('primary'),
      'text-white',
      'hover:bg-primary-600',
      'focus-visible:ring-primary-500'
    ),
    secondary: cn(
      getBgColorClass('secondary'),
      'text-white',
      'hover:bg-secondary-600',
      'focus-visible:ring-secondary-500'
    ),
    outline: cn(
      'border-2',
      'border-primary-500',
      getColorClass('primary'),
      'bg-transparent',
      'hover:bg-primary-50',
      'focus-visible:ring-primary-500'
    ),
    ghost: cn(
      'bg-transparent',
      getColorClass('secondary'),
      'hover:bg-secondary-50',
      'focus-visible:ring-secondary-500'
    ),
  }

  return cn(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth && 'w-full'
  )
}

export function getInputClasses({
  size = 'md',
  error = false,
  disabled = false,
}: {
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  disabled?: boolean
} = {}) {
  return cn(
    'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset',
    'focus:ring-2 focus:ring-inset',
    error
      ? 'ring-error-500 focus:ring-error-500 text-error-900 placeholder:text-error-300'
      : 'ring-gray-300 focus:ring-primary-500 text-gray-900 placeholder:text-gray-400',
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
    {
      'text-sm px-2.5 py-1.5': size === 'sm',
      'text-base px-3 py-2': size === 'md',
      'text-lg px-4 py-2.5': size === 'lg',
    }
  )
} 