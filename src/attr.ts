import { createBaseScript } from './script'
import type { ThemeStrategy } from './types'

export const attrStrategy: ThemeStrategy = {
  changeTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme)
  },

  removeTheme(): void {
    document.documentElement.removeAttribute('data-theme')
  },

  createScript(): string {
    return createBaseScript("document.documentElement.setAttribute('data-theme', theme)")
  },
}
