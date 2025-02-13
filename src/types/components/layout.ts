import type { BaseProps } from './shared'

/**
 * Props for the Layout component
 */
export interface LayoutProps extends BaseProps {
  showNavigation?: boolean
  showFooter?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
}

/**
 * Props for the Navigation component
 */
export interface NavigationItem {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number | string
}

export interface NavigationProps extends BaseProps {
  items: NavigationItem[]
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

/**
 * Props for the Header component
 */
export interface HeaderProps extends BaseProps {
  sticky?: boolean
  transparent?: boolean
  showLogo?: boolean
  showNav?: boolean
  showAuth?: boolean
}

/**
 * Props for the Footer component
 */
export interface FooterProps extends BaseProps {
  showSocial?: boolean
  showNewsletter?: boolean
  showLegal?: boolean
}

/**
 * Props for the Sidebar component
 */
export interface SidebarProps extends BaseProps {
  position?: 'left' | 'right'
  width?: number | string
  collapsible?: boolean
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

/**
 * Props for the Container component
 */
export interface ContainerProps extends BaseProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean | number
  center?: boolean
}

/**
 * Props for the Grid component
 */
export interface GridProps extends BaseProps {
  columns?: number | { [key: string]: number }
  gap?: number | string
  rowGap?: number | string
  columnGap?: number | string
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense'
}

/**
 * Props for the Stack component
 */
export interface StackProps extends BaseProps {
  direction?: 'row' | 'column'
  spacing?: number | string
  wrap?: boolean
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

/**
 * Props for the Box component
 */
export interface BoxProps extends BaseProps {
  padding?: number | string
  margin?: number | string
  width?: number | string
  height?: number | string
  background?: string
  border?: boolean | string
  rounded?: boolean | string | number
  shadow?: boolean | string
} 