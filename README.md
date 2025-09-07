<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@mash43/solid-theme&background=tiles&project=%20" alt="@mash43/solid-theme">
</p>

# @mash43/solid-theme

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

A simple and flexible theming library for SolidJS. It makes it easy to add theme functionality like dark mode, persist user preferences, and sync with system settings.

## Features

*   **Theme Persistence**: Saves the user's selected theme to `localStorage` (under the key 'theme'), maintaining it across browser sessions.
*   **Two Application Methods**:
    *   Set a `data-theme` attribute on the `<html>` element (`attr`).
    *   Add a class name to the `<html>` element (`class`).
*   **System Theme Sync**: Supports a `system` theme that follows the OS's color scheme.
*   **FOUC Prevention**: Prevents the "Flash of Unstyled Content" on initial page load by injecting a small script that reads the stored theme from `localStorage` and applies it before your SolidJS application fully loads.
*   **Simple API**:
    *   `ThemeProvider`: A component to wrap your entire application and provide theme management.
    *   `useTheme`: A hook to access the current theme and the function to change it from within any component.

## Quick start

Install it:

```bash
npm i @mash43/solid-theme
# or
yarn add @mash43/solid-theme
# or
pnpm add @mash43/solid-theme
```

## Usage

1.  **Wrap your application with `ThemeProvider`**

    Wrap your root component with the `ThemeProvider` to provide theme context to your entire application. You need to pass a list of available `themes` and a `method` (`'attr'` or `'class'`).

    ```tsx
    // index.tsx (e.g., in your root file)
    import { MetaProvider } from '@solidjs/meta'
    import { ThemeProvider } from '@mash43/solid-theme'

    // ...
    <MetaProvider>
      <ThemeProvider themes={['light', 'dark']} method="attr">
        {/* Your SolidJS application components */}
      </ThemeProvider>
    </MetaProvider>
    // ...
    ```

2.  **Use the `useTheme` hook in your components**

    Use the `useTheme` hook to access the current `theme`, a `setTheme` function, and the list of available `themes`.

    ```tsx
    // YourComponent.tsx
    import { useTheme } from '@mash43/solid-theme'
    import type { JSX } from 'solid-js'

    function YourComponent(): JSX.Element {
      const { theme, setTheme } = useTheme()

      return (
        <div>
          <p>Current theme: {theme()}</p>
          <button onClick={() => setTheme('dark')}>Set Dark</button>
          <button onClick={() => setTheme('light')}>Set Light</button>
        </div>
      )
    }
    ```