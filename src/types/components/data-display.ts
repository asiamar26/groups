import type { BaseProps } from './shared'
import type { ReactNode, HTMLAttributes } from 'react'

/**
 * Props for the Card component and its subcomponents
 */
export interface CardProps extends BaseProps {
  variant?: 'default' | 'bordered' | 'elevated'
  hoverable?: boolean
  clickable?: boolean
  compact?: boolean
}

export interface CardHeaderProps extends BaseProps {
  action?: ReactNode
}

export interface CardTitleProps extends BaseProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export interface CardDescriptionProps extends BaseProps {}

export interface CardContentProps extends BaseProps {
  padding?: boolean | number
}

export interface CardFooterProps extends BaseProps {
  divider?: boolean
}

/**
 * Props for the List component and its items
 */
export interface ListProps extends BaseProps {
  variant?: 'default' | 'bordered' | 'separated'
  type?: 'ordered' | 'unordered'
  spacing?: number | string
  horizontal?: boolean
}

export interface ListItemProps extends BaseProps {
  selected?: boolean
  disabled?: boolean
  icon?: ReactNode
  action?: ReactNode
}

/**
 * Props for the Table component and its parts
 */
export interface TableColumn<T = any> {
  id: string
  header: string | ReactNode
  accessor?: keyof T | ((row: T) => any)
  cell?: (value: any, row: T) => ReactNode
  sortable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> extends BaseProps {
  data: T[]
  columns: TableColumn<T>[]
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  loading?: boolean
  onRowClick?: (row: T) => void
  onSort?: (column: TableColumn<T>, direction: 'asc' | 'desc') => void
  onSelectionChange?: (selectedRows: T[]) => void
}

/**
 * Props for the Avatar component
 */
export interface AvatarProps extends BaseProps {
  src?: string
  alt?: string
  fallback?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
  status?: 'online' | 'offline' | 'away' | 'busy'
  bordered?: boolean
  stacked?: boolean
}

/**
 * Props for the Badge component
 */
export interface BadgeProps extends BaseProps {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  dot?: boolean
  count?: number
  max?: number
  showZero?: boolean
}

/**
 * Props for the Tooltip component
 */
export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  className?: string
  children?: ReactNode
  content: ReactNode
  position?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  offset?: number
  arrow?: boolean
  maxWidth?: number | string
  trigger?: 'hover' | 'click' | 'focus' | Array<'hover' | 'click' | 'focus'>
}

/**
 * Props for the Skeleton component
 */
export interface SkeletonProps extends BaseProps {
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | false
  width?: number | string
  height?: number | string
  count?: number
} 