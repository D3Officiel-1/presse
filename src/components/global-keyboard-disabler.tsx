'use client';

import React from 'react';

export function GlobalKeyboardDisabler() {
  React.useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'textarea'
      ) {
        (target as HTMLInputElement | HTMLTextAreaElement).readOnly = true;
        
        // We need to set it back to false after a very short delay.
        // This is a trick to prevent the keyboard from showing up
        // while still allowing custom input methods (like our custom keyboard)
        // to programmatically change the value.
        setTimeout(() => {
          if (document.body.contains(target)) { // Check if the element is still in the DOM
            (target as HTMLInputElement | HTMLTextAreaElement).readOnly = false;
          }
        }, 100);
      }
    };

    document.addEventListener('focusin', handleFocus);

    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }, []);

  return null;
}
