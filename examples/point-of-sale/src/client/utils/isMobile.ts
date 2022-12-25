export function isMobile() {
  return typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof document !== 'undefined' &&
    /mobi|android/i.test(navigator.userAgent);
}
