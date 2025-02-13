/**
 * Theme Configuration Types
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  font: {
    family: string
    size: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
    weight: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      none: number
      tight: number
      snug: number
      normal: number
      relaxed: number
      loose: number
    }
  }
}

/**
 * Color Palette Types
 */
export interface ColorPalette {
  primary: ColorScale
  secondary: ColorScale
  success: ColorScale
  warning: ColorScale
  error: ColorScale
  info: ColorScale
  gray: ColorScale
}

export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

/**
 * Semantic Colors
 */
export interface SemanticColors {
  background: string
  foreground: string
  muted: {
    background: string
    foreground: string
  }
  card: {
    background: string
    foreground: string
  }
  popover: {
    background: string
    foreground: string
  }
  border: string
  input: string
  ring: string
  focus: string
  accent: {
    default: string
    foreground: string
  }
}

/**
 * Spacing System
 */
export interface SpacingSystem {
  px: string
  0: string
  0.5: string
  1: string
  1.5: string
  2: string
  2.5: string
  3: string
  3.5: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
}

/**
 * Breakpoints
 */
export interface Breakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

/**
 * Z-Index Layers
 */
export interface ZIndexLayers {
  hide: number
  auto: number
  base: number
  dropdown: number
  sticky: number
  fixed: number
  overlay: number
  modal: number
  popover: number
  toast: number
  tooltip: number
}

/**
 * Animation & Transition
 */
export interface Animation {
  duration: {
    fastest: string
    faster: string
    fast: string
    normal: string
    slow: string
    slower: string
    slowest: string
  }
  easing: {
    easeInOut: string
    easeOut: string
    easeIn: string
    sharp: string
  }
}

/**
 * Border Radius
 */
export interface BorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

/**
 * Shadows
 */
export interface Shadows {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

/**
 * Combined Theme Type
 */
export interface Theme {
  config: ThemeConfig
  colors: ColorPalette
  semantic: SemanticColors
  spacing: SpacingSystem
  breakpoints: Breakpoints
  zIndex: ZIndexLayers
  animation: Animation
  radius: BorderRadius
  shadows: Shadows
}

/**
 * Theme Context
 */
export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Partial<ThemeConfig>) => void
}

/**
 * Component Variants
 */
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'link'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled'

/**
 * Style Props
 */
export interface StyleProps {
  m?: keyof SpacingSystem | number
  mx?: keyof SpacingSystem | number
  my?: keyof SpacingSystem | number
  mt?: keyof SpacingSystem | number
  mr?: keyof SpacingSystem | number
  mb?: keyof SpacingSystem | number
  ml?: keyof SpacingSystem | number
  p?: keyof SpacingSystem | number
  px?: keyof SpacingSystem | number
  py?: keyof SpacingSystem | number
  pt?: keyof SpacingSystem | number
  pr?: keyof SpacingSystem | number
  pb?: keyof SpacingSystem | number
  pl?: keyof SpacingSystem | number
  w?: string | number
  h?: string | number
  minW?: string | number
  maxW?: string | number
  minH?: string | number
  maxH?: string | number
  color?: keyof ColorPalette | string
  bg?: keyof ColorPalette | string
  opacity?: number
  shadow?: keyof Shadows
  rounded?: keyof BorderRadius
  fontWeight?: keyof ThemeConfig['font']['weight']
  fontSize?: keyof ThemeConfig['font']['size']
  lineHeight?: keyof ThemeConfig['font']['lineHeight']
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  transform?: string
  cursor?: string
  overflow?: string
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
  zIndex?: keyof ZIndexLayers | number
} 