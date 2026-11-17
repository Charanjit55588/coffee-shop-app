// Test hooks for automation.
// Playwright and Selenium select on `data-testid`. Maestro cannot see the DOM: it reads the
// accessibility tree, and in an Android WebView Chromium exposes an element's HTML `id` as its
// resource-id. So each hook sets both attributes to the same value.
// Only use it where the value is unique on the screen (ids must be unique).
export const tid = (value) => ({ 'data-testid': value, id: value });
