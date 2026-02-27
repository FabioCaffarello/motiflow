/**
 * Accessibility Utilities
 * 
 * Helper functions for WCAG 2.1 compliance.
 */

/**
 * Generate ARIA label for form fields
 */
export function getAriaLabel(fieldName: string, required?: boolean): string {
  return required ? `${fieldName} (required)` : fieldName;
}

/**
 * Generate ARIA described by ID
 */
export function getAriaDescribedBy(fieldId: string, hasError?: boolean, hasHelper?: boolean): string | undefined {
  const ids: string[] = [];
  
  if (hasError) {
    ids.push(`${fieldId}-error`);
  }
  
  if (hasHelper) {
    ids.push(`${fieldId}-helper`);
  }
  
  return ids.length > 0 ? ids.join(' ') : undefined;
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.tabIndex;
  const isFocusable = tabIndex >= 0 || 
    (element instanceof HTMLButtonElement) ||
    (element instanceof HTMLAnchorElement && element.href) ||
    (element instanceof HTMLInputElement) ||
    (element instanceof HTMLSelectElement) ||
    (element instanceof HTMLTextAreaElement);
  
  return isFocusable;
}

/**
 * Get focusable elements in container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selectors));
}

/**
 * Trap focus within container (for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) {
    return () => {};
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTab);
  firstElement.focus();

  return () => {
    container.removeEventListener('keydown', handleTab);
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
