import type { Profile } from './profile'
import type { Group, GroupMember } from './groups'
import type { Discussion, DiscussionReply } from './discussions'
import type { RootState } from './store'

/**
 * Mock Data Types
 */
export interface MockData {
  profiles: Profile[]
  groups: Group[]
  groupMembers: GroupMember[]
  discussions: Discussion[]
  discussionReplies: DiscussionReply[]
}

/**
 * Test Store Types
 */
export interface TestStore extends RootState {
  reset: () => void
  populate: (data: Partial<MockData>) => void
}

/**
 * Test Render Options
 */
export interface TestRenderOptions {
  initialRoute?: string
  store?: Partial<RootState>
  mockData?: Partial<MockData>
  user?: Profile | null
  theme?: 'light' | 'dark'
}

/**
 * Test Query Types
 */
export interface TestQuery {
  text?: string | RegExp
  role?: string
  name?: string
  testId?: string
  selector?: string
}

/**
 * Test Event Types
 */
export interface TestEventOptions {
  bubbles?: boolean
  cancelable?: boolean
  button?: number
  pointerType?: string
  clientX?: number
  clientY?: number
  key?: string
  code?: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
}

/**
 * Test API Mock Types
 */
export interface TestApiMock {
  path: string | RegExp
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  status?: number
  response?: any
  delay?: number
  times?: number
}

/**
 * Test User Actions
 */
export interface TestUserActions {
  click: (element: Element | null) => Promise<void>
  type: (element: Element | null, text: string) => Promise<void>
  clear: (element: Element | null) => Promise<void>
  selectOption: (element: Element | null, option: string | number) => Promise<void>
  upload: (element: Element | null, file: File | File[]) => Promise<void>
  hover: (element: Element | null) => Promise<void>
  press: (key: string) => Promise<void>
  drag: (element: Element | null, target: Element | null) => Promise<void>
}

/**
 * Test Assertions
 */
export interface TestAssertions {
  toBeVisible: () => void
  toBeHidden: () => void
  toBeDisabled: () => void
  toBeEnabled: () => void
  toBeChecked: () => void
  toBeUnchecked: () => void
  toHaveText: (text: string | RegExp) => void
  toHaveValue: (value: string | number | string[]) => void
  toHaveAttribute: (name: string, value?: string) => void
  toHaveStyle: (css: Partial<CSSStyleDeclaration>) => void
  toHaveClass: (...classNames: string[]) => void
  toBeEmpty: () => void
  toHaveLength: (length: number) => void
  toHaveFocus: () => void
  toBeInTheDocument: () => void
  toBeInvalid: () => void
  toBeRequired: () => void
  toHaveErrorMessage: (message?: string | RegExp) => void
  toMatchSnapshot: () => void
}

/**
 * Test Utilities
 */
export interface TestUtils {
  act: (callback: () => Promise<void> | void) => Promise<void>
  waitFor: (callback: () => void | Promise<void>, options?: {
    timeout?: number
    interval?: number
  }) => Promise<void>
  waitForElementToBeRemoved: (callback: () => Element | null) => Promise<void>
  prettyDOM: (element?: Element | null) => string
  logRoles: (element?: Element | null) => void
  logTestingPlaygroundURL: (element?: Element | null) => void
}

/**
 * Test Hooks
 */
export interface TestHooks {
  beforeEach: (fn: () => void | Promise<void>) => void
  afterEach: (fn: () => void | Promise<void>) => void
  beforeAll: (fn: () => void | Promise<void>) => void
  afterAll: (fn: () => void | Promise<void>) => void
}

/**
 * Test Context
 */
export interface TestContext {
  store: TestStore
  user: TestUserActions
  assert: TestAssertions
  utils: TestUtils
  hooks: TestHooks
  mockApi: (mock: TestApiMock) => void
  cleanup: () => Promise<void>
}

/**
 * Test Result Types
 */
export interface TestResult {
  pass: boolean
  message: () => string
}

/**
 * Test Suite Configuration
 */
export interface TestConfig {
  setupFiles?: string[]
  testMatch?: string[]
  testTimeout?: number
  maxWorkers?: number
  coverage?: {
    enabled: boolean
    threshold?: {
      statements?: number
      branches?: number
      functions?: number
      lines?: number
    }
    exclude?: string[]
  }
  env?: Record<string, string>
  globals?: Record<string, any>
} 