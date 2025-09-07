import type { Component } from 'solid-js'
import logo from './logo.svg'
import styles from './App.module.css'
import ThemeSelector from './ThemeSelector'
import { MetaProvider } from '@solidjs/meta'
import { ThemeProvider } from 'src'

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <MetaProvider>
          <ThemeProvider method="attr" themes={['light', 'dark']}>
            <ThemeSelector />
          </ThemeProvider>
        </MetaProvider>
      </header>
    </div>
  )
}

export default App
