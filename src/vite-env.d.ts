/// <reference types="vite/client" />

declare module '*.tsx' {
    import type { ComponentType } from 'react'
    const component: ComponentType<unknown>
    export default component
  }
  
  declare module '@heroicons/react/outline' {
    export * from '@heroicons/react/outline'
  }