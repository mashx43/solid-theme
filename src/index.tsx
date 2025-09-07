import { useHead } from '@solidjs/meta'
import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createUniqueId,
  type JSX,
  type Setter,
  useContext,
} from 'solid-js'
import { attrStrategy } from './attr'
import { classStrategy } from './class'
import { createLocalStorage, THEME_STORAGE_KEY } from './local-storage'
import { isServer } from 'solid-js/web'
import type { ThemeStrategy } from './types'

const INITIAL_THEME = 'system'

const context = createContext<{
  themes: string[]
  theme: Accessor<string>
  setTheme: Setter<string>
}>({
  themes: [],
  theme: () => INITIAL_THEME,
  setTheme: () => {},
})

export function ThemeProvider(props: {
  themes: string[]
  method: 'attr' | 'class'
  children: JSX.Element
}): JSX.Element {
  const { changeTheme, createScript, removeTheme }: ThemeStrategy =
    props.method === 'attr' ? attrStrategy : classStrategy

  if (!isServer) {
    const script = createScript()
    useHead({
      tag: 'script',
      setting: { close: true },
      id: createUniqueId(),
      props: { children: script },
    })
  }

  const [theme, setTheme] = createLocalStorage(THEME_STORAGE_KEY, INITIAL_THEME)

  createEffect(() => {
    if (theme() === 'system') {
      removeTheme(props.themes)
      return
    }
    changeTheme(theme(), props.themes)
  })

  const allThemes = createMemo(() => Array.from(new Set([...props.themes, 'system'])))

  return (
    <context.Provider value={{ themes: allThemes(), theme, setTheme }}>
      {props.children}
    </context.Provider>
  )
}

export function useTheme() {
  return useContext(context)
}
