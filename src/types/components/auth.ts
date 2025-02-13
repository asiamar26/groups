import type { BaseProps, FormFieldBaseProps } from './shared'
import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Props for the EmailInput component
 */
export interface EmailInputProps extends FormFieldBaseProps<string> {
  onValidate?: (isValid: boolean) => void
}

/**
 * Props for the PasswordInput component
 */
export interface PasswordInputProps extends FormFieldBaseProps<string> {
  showStrengthMeter?: boolean
  minLength?: number
  requireSpecialChar?: boolean
  requireNumber?: boolean
  requireUppercase?: boolean
}

/**
 * Props for the UsernameInput component
 */
export interface UsernameInputProps extends FormFieldBaseProps<string> {
  suggestUsernames?: boolean
  minLength?: number
  maxLength?: number
}

/**
 * Props for the AuthForm component
 */
export interface AuthFormProps extends Omit<HTMLAttributes<HTMLFormElement>, 'onError'> {
  className?: string
  children?: ReactNode
  mode: 'signin' | 'signup' | 'reset-password'
  onSuccess?: () => void
  onError?: (error: Error) => void
  redirectUrl?: string
}

/**
 * Props for the SocialAuth component
 */
export interface SocialAuthProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  className?: string
  children?: ReactNode
  providers: Array<'google' | 'github' | 'twitter'>
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Props for the AuthGuard component
 */
export interface AuthGuardProps extends BaseProps {
  fallback?: React.ReactNode
  roles?: string[]
  permissions?: string[]
  redirectTo?: string
}

/**
 * Props for the ResetPassword component
 */
export interface ResetPasswordProps extends Omit<HTMLAttributes<HTMLFormElement>, 'onError'> {
  className?: string
  children?: ReactNode
  token?: string
  email?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Props for the VerifyEmail component
 */
export interface VerifyEmailProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  className?: string
  children?: ReactNode
  token: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Props for the ProfileForm component
 */
export interface ProfileFormProps extends BaseProps {
  mode?: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
} 