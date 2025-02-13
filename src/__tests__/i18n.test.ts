import { describe, it, expect } from 'vitest'
import type { 
  Locale, 
  LocaleConfig, 
  Translations,
  I18nContextValue 
} from '@/types/i18n'

describe('i18n Types', () => {
  it('should validate locale type', () => {
    const validLocales: Locale[] = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh']
    const locale: Locale = 'en'
    
    expect(validLocales).toContain(locale)
    // @ts-expect-error - Invalid locale
    const invalidLocale: Locale = 'invalid'
  })

  it('should validate locale config', () => {
    const config: LocaleConfig = {
      locale: 'en',
      direction: 'ltr',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: 'HH:mm',
      numberFormat: {
        decimal: '.',
        thousand: ',',
        precision: 2
      }
    }

    expect(config.locale).toBe('en')
    expect(config.direction).toBe('ltr')
    // @ts-expect-error - Invalid direction
    config.direction = 'invalid'
  })

  it('should validate translations structure', () => {
    const translations: Translations = {
      common: {
        actions: {
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
          create: 'Create',
          update: 'Update',
          close: 'Close',
          confirm: 'Confirm',
          back: 'Back',
          next: 'Next',
          submit: 'Submit'
        },
        navigation: {
          home: 'Home',
          profile: 'Profile',
          settings: 'Settings',
          groups: 'Groups',
          notifications: 'Notifications',
          search: 'Search'
        },
        status: {
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          empty: 'No data'
        },
        time: {
          now: 'Now',
          minutesAgo: '{} minutes ago',
          hoursAgo: '{} hours ago',
          daysAgo: '{} days ago',
          weeksAgo: '{} weeks ago',
          monthsAgo: '{} months ago',
          yearsAgo: '{} years ago'
        }
      },
      auth: {
        signIn: {
          title: 'Sign In',
          subtitle: 'Welcome back',
          emailLabel: 'Email',
          passwordLabel: 'Password',
          forgotPassword: 'Forgot password?',
          submit: 'Sign in',
          noAccount: 'No account?',
          signUpLink: 'Sign up'
        },
        signUp: {
          title: 'Sign Up',
          subtitle: 'Create your account',
          emailLabel: 'Email',
          passwordLabel: 'Password',
          nameLabel: 'Name',
          usernameLabel: 'Username',
          submit: 'Sign up',
          hasAccount: 'Have an account?',
          signInLink: 'Sign in'
        },
        forgotPassword: {
          title: 'Forgot Password',
          subtitle: 'Reset your password',
          emailLabel: 'Email',
          submit: 'Send reset link',
          backToSignIn: 'Back to sign in'
        },
        errors: {
          invalidEmail: 'Invalid email',
          invalidPassword: 'Invalid password',
          userNotFound: 'User not found',
          emailInUse: 'Email already in use',
          weakPassword: 'Password is too weak'
        }
      },
      profile: {
        settings: {
          title: 'Settings',
          personal: 'Personal',
          account: 'Account',
          privacy: 'Privacy',
          notifications: 'Notifications'
        },
        fields: {
          name: 'Name',
          email: 'Email',
          username: 'Username',
          bio: 'Bio',
          location: 'Location',
          website: 'Website',
          social: 'Social'
        },
        notifications: {
          email: 'Email notifications',
          push: 'Push notifications',
          mentions: 'Mentions',
          replies: 'Replies',
          follows: 'Follows'
        }
      },
      groups: {
        actions: {
          create: 'Create group',
          join: 'Join',
          leave: 'Leave',
          invite: 'Invite',
          edit: 'Edit',
          delete: 'Delete'
        },
        fields: {
          name: 'Name',
          description: 'Description',
          privacy: 'Privacy',
          categories: 'Categories',
          members: 'Members'
        },
        privacy: {
          public: 'Public',
          private: 'Private',
          secret: 'Secret'
        },
        roles: {
          owner: 'Owner',
          admin: 'Admin',
          member: 'Member'
        }
      },
      discussions: {
        actions: {
          create: 'Create discussion',
          edit: 'Edit',
          delete: 'Delete',
          reply: 'Reply',
          like: 'Like',
          unlike: 'Unlike',
          share: 'Share'
        },
        fields: {
          title: 'Title',
          content: 'Content',
          attachments: 'Attachments',
          replies: 'Replies',
          likes: 'Likes'
        },
        placeholders: {
          title: 'Enter title',
          content: 'Write something...',
          reply: 'Write a reply...'
        }
      },
      errors: {
        general: {
          unknown: 'Unknown error',
          network: 'Network error',
          unauthorized: 'Unauthorized',
          forbidden: 'Forbidden',
          notFound: 'Not found',
          validation: 'Validation error'
        },
        auth: {
          required: 'Authentication required',
          invalid: 'Invalid credentials',
          expired: 'Session expired'
        },
        form: {
          required: 'This field is required',
          invalid: 'Invalid value',
          tooShort: 'Too short',
          tooLong: 'Too long',
          mismatch: 'Values do not match'
        }
      }
    }

    expect(translations.common.actions.save).toBe('Save')
    // @ts-expect-error - Missing required field
    delete translations.common.actions.save
  })

  it('should validate i18n context value', () => {
    const contextValue: I18nContextValue = {
      locale: 'en',
      setLocale: (locale: Locale) => {},
      t: (key: string, params?: Record<string, any>) => '',
      formatDate: (date: Date | string, format?: string) => '',
      formatNumber: (number: number, options?: Intl.NumberFormatOptions) => '',
      formatCurrency: (amount: number, currency: string) => ''
    }

    expect(contextValue.locale).toBe('en')
    // @ts-expect-error - Invalid locale
    contextValue.locale = 'invalid'
  })
}) 