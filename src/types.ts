export interface ThemeStrategy {
  changeTheme: (theme: string, themes: string[]) => void
  removeTheme: (themes: string[]) => void
  createScript: () => string
}
