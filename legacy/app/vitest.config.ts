import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Merge the Vite config (path alias '@/' lives there) with test settings,
// so specs resolve '@/...' exactly like the app does.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: { environment: 'node' },
  }),
)
