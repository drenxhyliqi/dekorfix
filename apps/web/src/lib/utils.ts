/**
 * Joins class names, skipping falsy values. It does not resolve conflicting
 * Tailwind utilities: to hide a component that sets its own `display`, wrap it
 * in an element with the responsive visibility classes instead.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
