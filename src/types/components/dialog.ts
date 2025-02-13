import type { BaseProps } from './shared'

/**
 * Props for the Dialog component
 */
export interface DialogProps extends BaseProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

/**
 * Props for the Dialog trigger
 */
export interface DialogTriggerProps extends BaseProps {
  asChild?: boolean
}

/**
 * Props for the Dialog content
 */
export interface DialogContentProps extends BaseProps {
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
  onInteractOutside?: (event: Event) => void
  forceMount?: boolean
}

/**
 * Props for the Dialog header
 */
export interface DialogHeaderProps extends BaseProps {
  showClose?: boolean
  onClose?: () => void
}

/**
 * Props for the Dialog footer
 */
export interface DialogFooterProps extends BaseProps {
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
}

/**
 * Props for the Dialog title
 */
export interface DialogTitleProps extends BaseProps {
  asChild?: boolean
}

/**
 * Props for the Dialog description
 */
export interface DialogDescriptionProps extends BaseProps {
  asChild?: boolean
}

/**
 * Props for the Dialog close button
 */
export interface DialogCloseProps extends BaseProps {
  asChild?: boolean
}

/**
 * Props for the Dialog overlay
 */
export interface DialogOverlayProps extends BaseProps {
  forceMount?: boolean
} 