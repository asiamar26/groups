import type { BaseProps, FormFieldBaseProps } from './shared'
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

/**
 * Props for the Input component
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline' | 'unstyled'
  error?: boolean | string
  prefix?: ReactNode
  suffix?: ReactNode
  loading?: boolean
  clearable?: boolean
  onClear?: () => void
}

/**
 * Props for the SearchInput component
 */
export interface SearchInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  debounce?: number
  searchIcon?: ReactNode
  clearIcon?: ReactNode
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
}

/**
 * Props for the NumberInput component
 */
export interface NumberInputProps extends Omit<InputProps, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  precision?: number
  format?: (value: number) => string
  parse?: (value: string) => number
  onChange?: (value: number | null) => void
  controls?: boolean
  controlsPosition?: 'right' | 'both-sides'
}

/**
 * Props for the Textarea component
 */
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline' | 'unstyled'
  error?: boolean | string
  rows?: number
  minRows?: number
  maxRows?: number
  autoResize?: boolean
  showCount?: boolean
  maxLength?: number
}

/**
 * Props for the Select component
 */
export interface SelectOption {
  value: string | number
  label: string | ReactNode
  description?: string
  icon?: ReactNode
  disabled?: boolean
  group?: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  options: SelectOption[]
  value?: string | string[]
  defaultValue?: string | string[]
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outline' | 'unstyled'
  error?: boolean | string
  loading?: boolean
  multiple?: boolean
  clearable?: boolean
  searchable?: boolean
  creatable?: boolean
  groupBy?: (option: SelectOption) => string
  onChange?: (value: string | string[]) => void
  onCreateOption?: (inputValue: string) => void
}

/**
 * Props for the Combobox component
 */
export interface ComboboxProps extends Omit<SelectProps, 'multiple'> {
  freeSolo?: boolean
  autoHighlight?: boolean
  autoSelect?: boolean
  filterOptions?: (options: SelectOption[], inputValue: string) => SelectOption[]
  onInputChange?: (value: string) => void
}

/**
 * Props for the AutoComplete component
 */
export interface AutoCompleteProps<T = any> extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  options: T[]
  value?: T | null
  defaultValue?: T | null
  getOptionLabel: (option: T) => string
  getOptionValue?: (option: T) => string
  renderOption?: (option: T) => ReactNode
  loading?: boolean
  loadingText?: string
  noOptionsText?: string
  multiple?: boolean
  freeSolo?: boolean
  onChange?: (value: T | T[] | null) => void
  onInputChange?: (value: string) => void
  filterOptions?: (options: T[], inputValue: string) => T[]
}

/**
 * Props for the TagInput component
 */
export interface TagInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: string[]
  defaultValue?: string[]
  validate?: (value: string) => boolean | string
  transform?: (value: string) => string
  addOnBlur?: boolean
  addOnPaste?: boolean
  pasteSeparator?: string | RegExp
  allowDuplicates?: boolean
  maxTags?: number
  onChange?: (tags: string[]) => void
  onTagAdd?: (tag: string) => void
  onTagRemove?: (tag: string) => void
}

/**
 * Props for the ColorInput component
 */
export interface ColorInputProps extends Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: string
  defaultValue?: string
  format?: 'hex' | 'rgb' | 'hsl'
  swatches?: string[]
  swatchesPerRow?: number
  withPreview?: boolean
  withEyeDropper?: boolean
  onChange?: (value: string) => void
} 