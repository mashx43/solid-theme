import { For, type JSX } from 'solid-js'
import { useTheme } from 'src/index'

export default function ThemeSelector(): JSX.Element {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div>
      <label for="theme-selector">Select Theme: </label>
      <select id="theme-selector" value={theme()} onChange={e => setTheme(e.currentTarget.value)}>
        <For each={themes}>{t => <option value={t}>{t}</option>}</For>
      </select>
    </div>
  )
}
