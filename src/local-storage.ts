import { createSignal, createEffect, type Accessor, type Setter } from 'solid-js'
import { isServer } from 'solid-js/web'

export const THEME_STORAGE_KEY = 'theme'

export function createLocalStorage<T>(key: string, defaultValue: T): [Accessor<T>, Setter<T>] {
  if (isServer) {
    return createSignal<T>(defaultValue)
  }

  let initialValue: T = defaultValue
  try {
    const storedValue = localStorage.getItem(key)
    if (storedValue) {
      initialValue = JSON.parse(storedValue)
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error reading localStorage key “${key}”:`, error)
    initialValue = defaultValue
  }

  const [value, setValue] = createSignal<T>(initialValue)

  createEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value()))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error setting localStorage key “${key}”:`, error)
    }
  })

  return [value, setValue]
}
