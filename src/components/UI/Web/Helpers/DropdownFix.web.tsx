import { useEffect } from 'react';

/**
 * Component that adds CSS to fix dropdown option colors on web in dark mode.
 * Native select dropdowns on web have white backgrounds that can't be styled
 * through React props, so we inject CSS to override the browser defaults.
 */
const DropdownFix: React.FC = () => {
  useEffect(() => {
    // Inject CSS to style select dropdown options
    const styleId = 'dropdown-dark-mode-fix';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    // CSS to style the dropdown options
    styleEl.textContent = `
      /* Style select dropdown options in dark mode */
      select option {
        background-color: #2a2a2a !important;
        color: #e0e0e0 !important;
      }

      /* Style the dropdown list background */
      select:focus option,
      select:active option {
        background-color: #2a2a2a !important;
        color: #e0e0e0 !important;
      }

      /* Style selected option */
      select option:checked,
      select option[selected] {
        background-color: #4a5568 !important;
        color: #ffffff !important;
      }

      /* Style hover state for options */
      select option:hover {
        background-color: #4a5568 !important;
        color: #ffffff !important;
      }
    `;

    // Cleanup on unmount
    return () => {
      styleEl.remove();
    };
  }, []);

  return null;
};

export default DropdownFix;
