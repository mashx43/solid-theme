import { MetaProvider } from '@solidjs/meta'
import { createRoot } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from '../src'
import {attrStrategy} from '../src/attr'
import {classStrategy} from '../src/class'

// Mock modules
vi.mock('../src/attr', async () => {
  const actual = await vi.importActual<typeof import('../src/attr')>('../src/attr');
  return {
    ...actual,
    attrStrategy: {
      ...actual.attrStrategy,
      createScript: vi.fn(() => '// ATTR_SCRIPT'),
      changeTheme: vi.fn(),
      removeTheme: vi.fn(),
    },
  };
});

vi.mock('../src/class', async () => {
  const actual = await vi.importActual<typeof import('../src/class')>('../src/class');
  return {
    ...actual,
    classStrategy: {
      ...actual.classStrategy,
      createScript: vi.fn(() => '// CLASS_SCRIPT'),
      changeTheme: vi.fn(),
      removeTheme: vi.fn(),
    },
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
}

const TestComponent = () => {
  const { theme, setTheme, themes } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme()}</span>
      <span data-testid="themes">{themes.join(',')}</span>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>
        Set System
      </button>
    </div>
  )
}

describe('ThemeProvider and useTheme', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    localStorage.clear()
    document.head.innerHTML = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  it('returns default values when used outside of a provider', () => {
    let context: ReturnType<typeof useTheme> | undefined
    createRoot(dispose => {
      context = useTheme()
      dispose()
    })
    expect(context!.theme()).toBe('system')
    expect(context!.themes).toEqual([])
  })

  it('renders ThemeProvider and provides context', () => {
    render(
      () => (
        <MetaProvider>
          <ThemeProvider themes={['light', 'dark']} method="class">
            <TestComponent />
          </ThemeProvider>
        </MetaProvider>
      ),
      container,
    )

    expect(container.querySelector('[data-testid="theme"]')!.textContent).toBe('system')
    expect(container.querySelector('[data-testid="themes"]')!.textContent).toBe('light,dark,system')
  })

  it('initializes theme from localStorage', () => {
    localStorage.setItem('theme', JSON.stringify('dark'))
    render(
      () => (
        <MetaProvider>
          <ThemeProvider themes={['light', 'dark']} method="class">
            <TestComponent />
          </ThemeProvider>
        </MetaProvider>
      ),
      container,
    )
    expect(container.querySelector('[data-testid="theme"]')!.textContent).toBe('dark')
  })

  it('updates theme via setTheme and persists to localStorage', async () => {
    render(
      () => (
        <MetaProvider>
          <ThemeProvider themes={['light', 'dark']} method="class">
            <TestComponent />
          </ThemeProvider>
        </MetaProvider>
      ),
      container,
    )

    const button = container.querySelector('[data-testid="set-dark"]') as HTMLButtonElement
    const themeSpan = container.querySelector('[data-testid="theme"]')!

    expect(themeSpan.textContent).toBe('system')

    button.click()

    await Promise.resolve() // wait for effects

    expect(themeSpan.textContent).toBe('dark')
    expect(localStorage.getItem('theme')).toBe(JSON.stringify('dark'))
  })

  it('uses "attr" method and calls its functions', async () => {
    render(
      () => (
        <MetaProvider>
          <ThemeProvider themes={['light', 'dark']} method="attr">
            <TestComponent />
          </ThemeProvider>
        </MetaProvider>
      ),
      container,
    )

    expect(attrStrategy.createScript).toHaveBeenCalledOnce()
    expect(document.head.innerHTML).toContain('// ATTR_SCRIPT')

    // Initial theme is 'system', so removeTheme should be called
    expect(attrStrategy.removeTheme).toHaveBeenCalledWith(['light', 'dark'])

    const button = container.querySelector('[data-testid="set-dark"]') as HTMLButtonElement
    button.click()
    await Promise.resolve()

    expect(attrStrategy.changeTheme).toHaveBeenCalledWith('dark', ['light', 'dark'])
  })

  it('uses "class" method and calls its functions', async () => {
    render(
      () => (
        <MetaProvider>
          <ThemeProvider themes={['light', 'dark']} method="class">
            <TestComponent />
          </ThemeProvider>
        </MetaProvider>
      ),
      container,
    )

    expect(classStrategy.createScript).toHaveBeenCalledOnce()
    expect(document.head.innerHTML).toContain('// CLASS_SCRIPT')

    // Initial theme is 'system', so removeTheme should be called
    expect(classStrategy.removeTheme).toHaveBeenCalledWith(['light', 'dark'])

    const button = container.querySelector('[data-testid="set-dark"]') as HTMLButtonElement
    button.click()
    await Promise.resolve()

    expect(classStrategy.changeTheme).toHaveBeenCalledWith('dark', ['light', 'dark'])
  })

  it('calls removeTheme when switching to "system" theme', async () => {
    localStorage.setItem('theme', JSON.stringify('dark'))
    render(
      () => (
        <MetaProvider>
          <ThemeProvider themes={['light', 'dark']} method="class">
            <TestComponent />
          </ThemeProvider>
        </MetaProvider>
      ),
      container,
    )

    await Promise.resolve()
    expect(classStrategy.changeTheme).toHaveBeenCalledWith('dark', ['light', 'dark'])
    vi.clearAllMocks()

    const button = container.querySelector('[data-testid="set-system"]') as HTMLButtonElement
    button.click()
    await Promise.resolve()

    expect(container.querySelector('[data-testid="theme"]')!.textContent).toBe('system')
    expect(classStrategy.removeTheme).toHaveBeenCalledWith(['light', 'dark'])
    expect(classStrategy.changeTheme).not.toHaveBeenCalled()
  })
})