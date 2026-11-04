/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

declare module '*.html?raw' {
  const content: string;
  export default content;
}
