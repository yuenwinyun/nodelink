---
name: ui-design-workflow
description: Enforces a designer-first workflow for all UI work. Automatically delegates to the designer subagent before building or modifying any React component, then implements based on its recommendations. Use whenever creating, editing, or reviewing UI components.
---

# UI Design Workflow

Every UI change — new component, layout tweak, form redesign, or interaction pattern — must go through the **designer** subagent before implementation.

## Workflow

### 1. Consult the Designer

Before writing or modifying any component code, delegate to the `designer` subagent with:

- **What** is being built or changed (component name, purpose)
- **Context** the designer needs (surrounding layout, related components, user flow)
- **Constraints** (existing patterns in the codebase, specific user requests)

Ask the designer to provide:
- Component strategy (daisyUI vs Radix UI choices with rationale)
- Layout and spacing recommendations
- Interaction and state feedback patterns
- Accessibility requirements

### 2. Implement the Designer's Recommendations

After receiving the designer's response:

- Follow the component choices and class selections exactly
- Use the recommended daisyUI classes and Radix primitives
- Apply the suggested spacing, hierarchy, and color scheme
- Implement all interaction states (hover, focus, active, disabled, loading)
- Add accessibility attributes as specified

### 3. Verify

- Confirm the implementation matches the designer's suggestions
- Check dark theme appearance
- Ensure keyboard navigation works for all interactive elements

## When to Consult

**Always consult** the designer for:
- Creating a new component
- Adding or changing interactive elements (buttons, forms, menus, dialogs)
- Modifying layout or navigation structure
- Adding feedback states (loading, error, empty states)
- Choosing between daisyUI and Radix UI for a pattern

**Skip consultation** only for:
- Pure logic changes with zero visual impact
- Renaming props or refactoring internals with no markup changes
- Fixing typos in text content
