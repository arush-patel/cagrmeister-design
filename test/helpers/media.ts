// A matchMedia stub: reports the OS scheme set by setOsDark and notifies change listeners.
type Listener = () => void;

let osDark = false;
const listeners = new Set<Listener>();

export function setOsDark(dark: boolean): void {
  osDark = dark;
}

export function fireOsChange(): void {
  for (const fn of [...listeners]) fn();
}

export function installMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes("prefers-color-scheme: dark") ? osDark : false;
      },
      media: query,
      addEventListener: (_type: string, fn: Listener) => listeners.add(fn),
      removeEventListener: (_type: string, fn: Listener) => listeners.delete(fn),
      addListener: (fn: Listener) => listeners.add(fn),
      removeListener: (fn: Listener) => listeners.delete(fn),
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
}
