---
name: ui-components
description: Enforces using daisyUI and Radix UI when building or modifying React components. Use automatically whenever creating, editing, or reviewing UI components.
---

When building or modifying any React component in this project, always follow these rules:

## Styling: daisyUI (Tailwind CSS)

- Use **daisyUI component classes** as the primary styling approach (e.g., `btn`, `input`, `card`, `menu`, `tabs`, `badge`, `alert`, `modal`, `dropdown`, `toggle`, `textarea`, `select`, `fieldset`)
- Use daisyUI **modifier classes** for variants (e.g., `btn-primary`, `btn-ghost`, `btn-sm`, `input-bordered`, `input-error`)
- Use daisyUI **theme colors** via utility classes (e.g., `bg-base-200`, `text-base-content`, `text-base-content/60`, `border-base-300`, `text-error`, `badge-success`)
- Use standard **Tailwind CSS utilities** for layout, spacing, and positioning (e.g., `flex`, `gap-2`, `p-4`, `w-full`, `truncate`)
- Never use raw CSS or CSS modules — all styling should be daisyUI classes + Tailwind utilities
- The app uses the **dark theme** — always test visual choices against a dark background

## Interactive Primitives: Radix UI

- Use **Radix UI** headless components for complex interactive patterns:
  - `@radix-ui/react-dialog` for modals and confirmation dialogs
  - `@radix-ui/react-dropdown-menu` for context menus and dropdown menus
  - `@radix-ui/react-toggle` for toggle buttons
- Style Radix UI components with daisyUI/Tailwind classes — never use Radix's default styles
- Radix UI ensures proper **accessibility** (keyboard navigation, ARIA attributes, focus management)

## Component Patterns

- Use daisyUI `fieldset` + `fieldset-label` for form field grouping
- Use daisyUI `menu` for list navigation in sidebars
- Use daisyUI `tabs` for tab navigation
- Use daisyUI `loading` for spinners (e.g., `loading loading-spinner loading-sm`)
- Use daisyUI `badge` for status indicators
- All form inputs must have proper `<label>` elements — never use placeholder-only labels
