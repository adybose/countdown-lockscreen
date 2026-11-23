/** The app's clock access point outside of `useNow()` (keeps utils and <Wallpaper> pure). */
export function nowDate(): Date {
  return new Date();
}

export function nowMs(): number {
  return Date.now();
}
