import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type { ButtonProps } from '@/types/components/buttons'
import type { InputProps } from '@/types/components/inputs'
import type { DialogProps } from '@/types/components/dialog'
import type { CardProps } from '@/types/components/data-display'

describe('Component Types', () => {
  it('should validate button props', () => {
    const validProps: ButtonProps = {
      variant: 'primary',
      size: 'md',
      loading: false,
      disabled: false,
      fullWidth: true,
      onClick: () => {}
    }

    expect(validProps.variant).toBe('primary')
    // @ts-expect-error - Invalid variant
    validProps.variant = 'invalid'
  })

  it('should validate input props', () => {
    const validProps: InputProps = {
      size: 'md',
      variant: 'default',
      error: false,
      disabled: false,
      value: '',
      onChange: (e) => {},
      placeholder: 'Enter value'
    }

    expect(validProps.size).toBe('md')
    // @ts-expect-error - Invalid size
    validProps.size = 'xl'
  })

  it('should validate dialog props', () => {
    const validProps: DialogProps = {
      open: true,
      onOpenChange: (open) => {},
      modal: true,
      title: 'Dialog Title',
      description: 'Dialog description',
      size: 'md'
    }

    expect(validProps.size).toBe('md')
    // @ts-expect-error - Invalid size
    validProps.size = 'xxl'
  })

  it('should validate card props', () => {
    const validProps: CardProps = {
      variant: 'default',
      hoverable: true,
      clickable: false,
      compact: false
    }

    expect(validProps.variant).toBe('default')
    // @ts-expect-error - Invalid variant
    validProps.variant = 'custom'
  })
}) 