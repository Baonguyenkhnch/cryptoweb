// Polyfills for browser environment
// This prevents Node.js modules from being loaded in the browser

// Stub for 'events' module
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.process = window.process || { env: {} };
    // @ts-ignore
    window.global = window.global || window;
}

export { };
