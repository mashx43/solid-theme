import { THEME_STORAGE_KEY } from './local-storage'

export function createBaseScript(setter: string): string {
  const script = `(
    function() {
      try {
        const storedValue = localStorage.getItem('${THEME_STORAGE_KEY}');
        if (storedValue) {
          const theme = JSON.parse(storedValue);
          if (theme && theme !== 'system') {
            ${setter}
          }
        }
      } catch (e) {
        console.error('Error in theme script:', e);
      }
    }()
  )`
  return script.replace(/\s*\n\s*/g, '')
}
