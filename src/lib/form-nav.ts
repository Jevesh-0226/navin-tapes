/**
 * Helper to handle Enter key navigation in forms.
 * Moves focus to the next input/select/textarea on Enter.
 * Submits the form if it's the last focusable element.
 */
export function handleEnterNavigation(e: React.KeyboardEvent) {
  if (e.key !== 'Enter') return;

  // Don't navigate if it's a textarea and Shift is held (allow newlines)
  const target = e.target as HTMLElement;
  if (target.tagName === 'TEXTAREA' && e.shiftKey) return;

  const form = target.closest('form');
  if (!form) return;

  // Get all focusable elements
  const focusableElements = Array.from(
    form.querySelectorAll(
      'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[type="submit"]:not([disabled])'
    )
  ) as HTMLElement[];

  const index = focusableElements.indexOf(target);

  if (index > -1) {
    if (index < focusableElements.length - 1) {
      // Move to next element
      e.preventDefault();
      const nextElement = focusableElements[index + 1];
      nextElement.focus();
      
      // If it's an input, select the text
      if (nextElement instanceof HTMLInputElement) {
        nextElement.select();
      }
    } else {
      // It's the last element, let the natural form submission happen
      // Or manually trigger submit if needed
    }
  }
}
