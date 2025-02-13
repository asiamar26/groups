import type { BaseProps } from './shared'
import type { ReactNode, HTMLAttributes } from 'react'

/**
 * Props for the Menu component and its items
 */
export interface MenuItem {
  id: string
  label: string | ReactNode
  icon?: ReactNode
  href?: string
  disabled?: boolean
  external?: boolean
  children?: MenuItem[]
}

export interface MenuProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  className?: string
  children?: ReactNode
  items: MenuItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'subtle' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  collapsible?: boolean
  defaultCollapsed?: boolean
  onSelect?: (item: MenuItem) => void
}

/**
 * Props for the Tabs component
 */
export interface TabItem {
  id: string
  label: string | ReactNode
  icon?: ReactNode
  disabled?: boolean
  content?: ReactNode
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  className?: string
  children?: ReactNode
  items: TabItem[]
  value?: string
  defaultValue?: string
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  onChange?: (value: string) => void
}

/**
 * Props for the Breadcrumb component
 */
export interface BreadcrumbItem {
  label: string | ReactNode
  href?: string
  icon?: ReactNode
  current?: boolean
}

export interface BreadcrumbProps extends BaseProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  maxItems?: number
  itemsBeforeCollapse?: number
  itemsAfterCollapse?: number
  expandOnClick?: boolean
}

/**
 * Props for the Pagination component
 */
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  className?: string
  children?: ReactNode
  count: number
  page: number
  pageSize?: number
  siblingCount?: number
  boundaryCount?: number
  showFirstButton?: boolean
  showLastButton?: boolean
  disabled?: boolean
  variant?: 'default' | 'outlined' | 'text'
  shape?: 'rounded' | 'circular'
  size?: 'sm' | 'md' | 'lg'
  onChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

/**
 * Props for the Stepper component
 */
export interface Step {
  label: string | ReactNode
  description?: string | ReactNode
  icon?: ReactNode
  optional?: boolean
  error?: boolean
  completed?: boolean
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  className?: string
  children?: ReactNode
  steps: Step[]
  activeStep: number
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'dots' | 'progress'
  alternativeLabel?: boolean
  nonLinear?: boolean
  onChange?: (step: number) => void
}

/**
 * Props for the Navbar component
 */
export interface NavbarProps extends BaseProps {
  brand?: ReactNode
  sticky?: boolean
  fixed?: boolean
  transparent?: boolean
  fullWidth?: boolean
  bordered?: boolean
  elevated?: boolean
  position?: 'top' | 'bottom'
  onMenuToggle?: (isOpen: boolean) => void
}

/**
 * Props for the Sidebar component
 */
export interface SidebarProps extends BaseProps {
  open?: boolean
  position?: 'left' | 'right'
  variant?: 'default' | 'mini' | 'overlay'
  width?: number | string
  collapsible?: boolean
  collapsed?: boolean
  backdrop?: boolean
  elevation?: boolean
  onClose?: () => void
  onCollapse?: (collapsed: boolean) => void
}

/**
 * Props for the Dropdown component
 */
export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  className?: string
  children?: ReactNode
  trigger: ReactNode
  content: ReactNode
  position?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  offset?: number
  arrow?: boolean
  closeOnClick?: boolean
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
  disabled?: boolean
  onOpen?: () => void
  onClose?: () => void
} 