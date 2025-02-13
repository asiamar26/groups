/**
 * Locale configuration types
 */
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh'

export interface LocaleConfig {
  locale: Locale
  direction: 'ltr' | 'rtl'
  dateFormat: string
  timeFormat: string
  numberFormat: {
    decimal: string
    thousand: string
    precision: number
  }
}

/**
 * Translation namespace types
 */
export interface Translations {
  common: CommonTranslations
  auth: AuthTranslations
  profile: ProfileTranslations
  groups: GroupTranslations
  discussions: DiscussionTranslations
  errors: ErrorTranslations
}

export interface CommonTranslations {
  actions: {
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    update: string
    close: string
    confirm: string
    back: string
    next: string
    submit: string
  }
  navigation: {
    home: string
    profile: string
    settings: string
    groups: string
    notifications: string
    search: string
  }
  status: {
    loading: string
    error: string
    success: string
    empty: string
  }
  time: {
    now: string
    minutesAgo: string
    hoursAgo: string
    daysAgo: string
    weeksAgo: string
    monthsAgo: string
    yearsAgo: string
  }
}

export interface AuthTranslations {
  signIn: {
    title: string
    subtitle: string
    emailLabel: string
    passwordLabel: string
    forgotPassword: string
    submit: string
    noAccount: string
    signUpLink: string
  }
  signUp: {
    title: string
    subtitle: string
    emailLabel: string
    passwordLabel: string
    nameLabel: string
    usernameLabel: string
    submit: string
    hasAccount: string
    signInLink: string
  }
  forgotPassword: {
    title: string
    subtitle: string
    emailLabel: string
    submit: string
    backToSignIn: string
  }
  errors: {
    invalidEmail: string
    invalidPassword: string
    userNotFound: string
    emailInUse: string
    weakPassword: string
  }
}

export interface ProfileTranslations {
  settings: {
    title: string
    personal: string
    account: string
    privacy: string
    notifications: string
  }
  fields: {
    name: string
    email: string
    username: string
    bio: string
    location: string
    website: string
    social: string
  }
  notifications: {
    email: string
    push: string
    mentions: string
    replies: string
    follows: string
  }
}

export interface GroupTranslations {
  actions: {
    create: string
    join: string
    leave: string
    invite: string
    edit: string
    delete: string
  }
  fields: {
    name: string
    description: string
    privacy: string
    categories: string
    members: string
  }
  privacy: {
    public: string
    private: string
    secret: string
  }
  roles: {
    owner: string
    admin: string
    member: string
  }
}

export interface DiscussionTranslations {
  actions: {
    create: string
    edit: string
    delete: string
    reply: string
    like: string
    unlike: string
    share: string
  }
  fields: {
    title: string
    content: string
    attachments: string
    replies: string
    likes: string
  }
  placeholders: {
    title: string
    content: string
    reply: string
  }
}

export interface ErrorTranslations {
  general: {
    unknown: string
    network: string
    unauthorized: string
    forbidden: string
    notFound: string
    validation: string
  }
  auth: {
    required: string
    invalid: string
    expired: string
  }
  form: {
    required: string
    invalid: string
    tooShort: string
    tooLong: string
    mismatch: string
  }
}

/**
 * i18n Context type
 */
export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, any>) => string
  formatDate: (date: Date | string, format?: string) => string
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (amount: number, currency: string) => string
}

/**
 * i18n Provider Props
 */
export interface I18nProviderProps {
  children: React.ReactNode
  defaultLocale?: Locale
  fallbackLocale?: Locale
  loadPath?: string
  debug?: boolean
} 