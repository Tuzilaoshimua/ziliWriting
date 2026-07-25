/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_DESKTOP_UPDATES?: string
  readonly VITE_APP_VERSION?: string
}
