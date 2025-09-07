import { createBaseScript } from './script'
import type { ThemeStrategy } from './types'

export const classStrategy: ThemeStrategy = {
  changeTheme(theme: string, themes: string[]): void {
    this.removeTheme(themes)
    document.documentElement.classList.add(theme)
  },

  removeTheme(themes: string[]): void {
    document.documentElement.classList.remove(...themes)
  },

  createScript(): string {
    return createBaseScript('document.documentElement.classList.add(theme)')
  },
}
