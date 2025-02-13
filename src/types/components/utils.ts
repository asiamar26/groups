import type { ReactNode, CSSProperties, HTMLAttributes } from 'react'

/**
 * Props for the Portal component
 */
export interface PortalProps extends HTMLAttributes<HTMLDivElement> {
  container?: HTMLElement | null
  disabled?: boolean
}

/**
 * Props for the Transition component
 */
export type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited'

export interface TransitionProps extends HTMLAttributes<HTMLDivElement> {
  in?: boolean
  appear?: boolean
  type?: 'fade' | 'slide' | 'scale' | 'zoom' | 'collapse'
  direction?: 'up' | 'right' | 'down' | 'left'
  duration?: number | { enter?: number; exit?: number }
  easing?: string | { enter?: string; exit?: string }
  onEnter?: () => void
  onEntering?: () => void
  onEntered?: () => void
  onExit?: () => void
  onExiting?: () => void
  onExited?: () => void
}

/**
 * Props for the ClickAway component
 */
export interface ClickAwayProps extends HTMLAttributes<HTMLDivElement> {
  onClickAway: (event: MouseEvent | TouchEvent) => void
  mouseEvent?: 'click' | 'mousedown' | 'mouseup' | false
  touchEvent?: 'touchstart' | 'touchend' | false
  disableReactTree?: boolean
}

/**
 * Props for the ResizeObserver component
 */
export interface ResizeObserverProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onResize: (entry: ResizeObserverEntry) => void
  box?: 'border-box' | 'content-box' | 'device-pixel-content-box'
  disabled?: boolean
}

/**
 * Props for the IntersectionObserver component
 */
export interface IntersectionObserverProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onIntersect: (entry: IntersectionObserverEntry) => void
  root?: HTMLElement | null
  rootMargin?: string
  threshold?: number | number[]
  disabled?: boolean
}

/**
 * Props for the AspectRatio component
 */
export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: number
  maxWidth?: number | string
  maxHeight?: number | string
}

/**
 * Props for the MediaQuery component
 */
export type MediaQueryOperator = 'min' | 'max'
export type MediaQueryFeature = 'width' | 'height' | 'aspect-ratio' | 'orientation'

export interface MediaQueryProps {
  query?: string
  operator?: MediaQueryOperator
  feature?: MediaQueryFeature
  value?: string | number
  device?: 'all' | 'screen' | 'print'
  children: ReactNode | ((matches: boolean) => ReactNode)
}

/**
 * Props for the Virtualize component
 */
export interface VirtualizeProps<T = any> {
  className?: string
  style?: CSSProperties
  items: T[]
  height: number
  itemHeight: number | ((index: number) => number)
  overscan?: number
  renderItem: (item: T, index: number) => ReactNode
  onScroll?: (scrollTop: number) => void
  onItemsRendered?: (options: {
    overscanStartIndex: number
    overscanStopIndex: number
    visibleStartIndex: number
    visibleStopIndex: number
  }) => void
}

/**
 * Props for the Measure component
 */
export interface MeasureProps {
  className?: string
  style?: CSSProperties
  children: (dimensions: {
    width: number
    height: number
    top: number
    right: number
    bottom: number
    left: number
    x: number
    y: number
  }) => ReactNode
  onResize?: (dimensions: DOMRectReadOnly) => void
}

/**
 * Props for the CopyToClipboard component
 */
export interface CopyToClipboardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  text: string
  timeout?: number
  onCopy?: (text: string, result: boolean) => void
}

/**
 * Props for the IdProvider component
 */
export interface IdProviderProps {
  className?: string
  style?: CSSProperties
  prefix?: string
  children: (id: string) => ReactNode
}

/**
 * Props for the KeyboardShortcut component
 */
export interface KeyboardShortcutProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  combination: string | string[]
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  disabled?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  global?: boolean
}

/**
 * Props for the LazyLoad component
 */
export interface LazyLoadProps extends HTMLAttributes<HTMLDivElement> {
  height?: number | string
  offset?: number | string
  once?: boolean
  overflow?: boolean
  resize?: boolean
  scroll?: boolean
  unmountIfInvisible?: boolean
  placeholder?: ReactNode
  onVisible?: () => void
}

/**
 * Props for the ErrorBoundary component
 */
export interface FallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export interface ErrorBoundaryProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  fallback: ReactNode | ((props: FallbackProps) => ReactNode)
  onError?: (error: Error, info: { componentStack: string }) => void
  onReset?: () => void
  resetKeys?: any[]
} 