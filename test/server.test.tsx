import { MetaProvider } from '@solidjs/meta'
import { renderToString } from 'solid-js/web'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from '../src'
import {attrStrategy} from '../src/attr'
import {classStrategy} from '../src/class'

// Mock modules for SSR test
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

const TestComponent = () => {
  const { theme, themes } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme()}</span>
      <span data-testid="themes">{themes.join(',')}</span>
    </div>
  )
}

// This component will capture the context and call the onMount callback.
const ContextReader = (props: { onMount: (ctx: ReturnType<typeof useTheme>) => void }) => {
  const context = useTheme()
  props.onMount(context)
  return <TestComponent />
}

describe('SSR', () => {
  beforeEach(() => {
    vi.spyOn(classStrategy, 'createScript');
    vi.spyOn(attrStrategy, 'createScript');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('renders on server and provides context', () => {
    let context: ReturnType<typeof useTheme> | undefined
    const string = renderToString(() => (
      <MetaProvider>
        <ThemeProvider themes={['light', 'dark']} method="class">
          <ContextReader onMount={(ctx) => (context = ctx)} />
        </ThemeProvider>
      </MetaProvider>
    ))

    // Check rendered string
    expect(string).toContain('data-testid="theme"')
    expect(string).toContain('>system</span>') // Initial theme is system
    expect(string).toContain('>light,dark,system</span>') // 'system' is added automatically

    // Check context values
    expect(context).toBeDefined()
    expect(context!.theme()).toBe('system')
    expect(context!.themes).toEqual(['light', 'dark', 'system'])
  })

  it('does NOT call createScript for FOUC prevention on the server', () => {
    renderToString(() => (
      <MetaProvider>
        <ThemeProvider themes={['light', 'dark']} method="class">
          <TestComponent />
        </ThemeProvider>
      </MetaProvider>
    ))
    // createScript should not be called on the server due to `isServer` check
    expect(classStrategy.createScript).not.toHaveBeenCalled()
  })

  it('returns default values when used outside of a provider on server', () => {
    let context: ReturnType<typeof useTheme> | undefined
    renderToString(() => {
      context = useTheme()
      return null
    })
    expect(context!.theme()).toBe('system')
    expect(context!.themes).toEqual([])
  })
})
