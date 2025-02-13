import type { BaseProps } from './shared'
import type { ReactNode, HTMLAttributes } from 'react'

/**
 * Common props for overlay components
 */
export interface OverlayBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  closeOnEsc?: boolean
  closeOnOutsideClick?: boolean
  preventScroll?: boolean
  container?: HTMLElement | null
  zIndex?: number
}

/**
 * Props for the Drawer component
 */
export interface DrawerProps extends OverlayBaseProps {
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: number | string
  overlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
  showCloseButton?: boolean
  closeButtonPosition?: 'inside' | 'outside'
}

/**
 * Props for the Sheet component
 */
export interface SheetProps extends OverlayBaseProps {
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  snapPoints?: number[]
  defaultSnapPoint?: number
  overlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
  showCloseButton?: boolean
  dragHandle?: boolean
  onSnapPointChange?: (snapPoint: number) => void
}

/**
 * Props for the CommandPalette component
 */
export interface CommandItem {
  id: string
  label: string
  icon?: ReactNode
  shortcut?: string[]
  disabled?: boolean
  children?: CommandItem[]
}

export interface CommandPaletteProps extends OverlayBaseProps {
  items: CommandItem[]
  placeholder?: string
  emptyState?: ReactNode
  filter?: (value: string, item: CommandItem) => boolean
  onSelect?: (item: CommandItem) => void
}

/**
 * Props for the ContextMenu component
 */
export interface ContextMenuItem {
  label: string | ReactNode
  icon?: ReactNode
  shortcut?: string[]
  disabled?: boolean
  danger?: boolean
  onClick?: () => void
  children?: ContextMenuItem[]
}

export interface ContextMenuProps extends Omit<OverlayBaseProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  items: ContextMenuItem[]
  trigger: ReactNode
  triggerEvent?: 'click' | 'contextmenu'
}

/**
 * Props for the Lightbox component
 */
export interface LightboxImage {
  src: string
  alt?: string
  width?: number
  height?: number
  caption?: ReactNode
}

export interface LightboxProps extends OverlayBaseProps {
  images: LightboxImage[]
  initialIndex?: number
  showThumbnails?: boolean
  showCaption?: boolean
  showCounter?: boolean
  showZoom?: boolean
  showRotate?: boolean
  showDownload?: boolean
  infinite?: boolean
  onIndexChange?: (index: number) => void
}

/**
 * Props for the HoverCard component
 */
export interface HoverCardProps extends Omit<OverlayBaseProps, 'modal'> {
  trigger: ReactNode
  content: ReactNode
  openDelay?: number
  closeDelay?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  arrow?: boolean
  arrowPadding?: number
  avoidCollisions?: boolean
}

/**
 * Props for the Dialog component
 */
export interface DialogProps extends OverlayBaseProps {
  title?: ReactNode
  description?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'top'
  showCloseButton?: boolean
}

export interface DialogHeaderProps extends BaseProps {
  showClose?: boolean
  onClose?: () => void
}

export interface DialogFooterProps extends BaseProps {
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
}

/**
 * Props for the Spotlight component
 */
export interface SpotlightProps extends OverlayBaseProps {
  target?: string | HTMLElement
  title?: ReactNode
  description?: ReactNode
  placement?: 'top' | 'right' | 'bottom' | 'left'
  offset?: number
  arrow?: boolean
  mask?: boolean
  maskColor?: string
  maskOpacity?: number
  onNext?: () => void
  onPrev?: () => void
  onFinish?: () => void
} 