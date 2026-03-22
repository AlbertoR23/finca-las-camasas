// src/types/global.d.ts
export {};

declare global {
  interface Window {
    forzarActualizacion?: () => Promise<any>;
    __useAnimales?: any;
  }
}
