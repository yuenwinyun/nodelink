# NodeLink UI/UX Redesign Plan

Comprehensive UI/UX refactor of NodeLink from a basic prototype feel to a polished, premium SSH client. The redesign focuses on visual hierarchy, merged header bar, animated side panels, improved forms, and consistent spacing/iconography — all within the existing component architecture.

---

## Current Problems

- **No visual hierarchy**: Sidebar, session tabs, and toolbar all share `bg-base-200` — everything looks the same
- **No icons anywhere**: Every button, tab, and action is text-only, making the UI dense and hard to scan
- **Redundant double-labeling**: "Local Terminal" appears in both the session tab AND the toolbar below it, wasting vertical space
- **Status overlays are full-screen walls**: "Process exited" covers the entire terminal, hiding output the user may want to read
- **No transitions or animations**: Panels snap in/out, dialogs pop, tabs jump — everything feels jarring
- **Double-click to connect is undiscoverable**: No visible connect affordance on host items
- **Inconsistent spacing**: Sidebar uses `p-4 pb-2`, then `mx-4`, then `p-2` for adjacent sections
- **Aggressive CTA**: The `btn-primary` "+ Add Host" button screams for attention disproportionate to its importance

---

## Redesign Strategy

Work file-by-file, preserving all existing logic and props. Changes are purely visual/structural (JSX + classes), not behavioral.

---

## Phase 1: Foundation (CSS + Layout)

### 1. Update global CSS — `src/renderer/src/assets/main.css`

- Add `.scrollbar-thin` and `.scrollbar-none` utility classes for sidebar/panel/tab scrolling
- Add `@keyframes fadeInScale` for dialog/menu entrance animation
- Adjust terminal CSS variables for better contrast:
  - `--terminal-bg: #1a1e24` (darker, distinct from `bg-base-300`)
  - `--terminal-fg: #c8cdd5` (brighter foreground for readability)
  - `--terminal-selection: rgba(200, 205, 213, 0.15)`

```css
/* Subtle scrollbar for sidebar and panels */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: oklch(var(--bc) / 0.15) transparent;
}

/* Hide scrollbar for session tabs */
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

/* Dialog/menu entrance animation */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in-scale {
  animation: fadeInScale 150ms ease-out;
}
```

### 2. Install `lucide-react` for icons

Lightweight, tree-shakeable icon set used by modern apps (VS Code, Vercel, shadcn/ui).

---

## Phase 2: Sidebar Overhaul

### 3. Redesign Sidebar — `src/renderer/src/components/Sidebar.tsx`

- Reduce width from 280px to 240px (`w-60`)
- Replace `tabs-bordered` with `tabs-boxed` segmented control style:

```tsx
<div role="tablist" className="tabs tabs-sm tabs-boxed bg-base-300/50 p-0.5 rounded-lg">
  <button
    role="tab"
    className={`tab tab-sm rounded-md text-xs transition-all ${
      active === 'hosts' ? 'tab-active bg-base-100 shadow-sm font-medium' : 'text-base-content/60'
    }`}
  >
    Hosts
  </button>
  {/* ... */}
</div>
```

- Add brand icon next to "NodeLink" title
- Redesign footer: left-aligned ghost buttons with icons instead of a loud primary CTA:

```tsx
<div className="p-3 space-y-1.5 border-t border-base-content/5">
  <button className="btn btn-sm btn-block btn-ghost bg-base-300/40 hover:bg-base-300 gap-2 justify-start font-normal">
    <Plus className="w-4 h-4 text-base-content/50" />
    <span className="text-xs">New {activeTabLabel}</span>
  </button>
  <button className="btn btn-sm btn-block btn-ghost gap-2 justify-start font-normal text-base-content/70">
    <TerminalSquare className="w-4 h-4" />
    <span className="text-xs">Local Terminal</span>
  </button>
</div>
```

- Use `border-base-content/5` for subtler borders throughout

### 4. Redesign HostList — `src/renderer/src/components/HostList.tsx`

- Replace `menu menu-sm` with custom list items using `rounded-lg`:

```tsx
<button
  className={`group flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 transition-colors ${
    isSelected
      ? 'bg-primary/10 text-primary'
      : 'hover:bg-base-300/60 text-base-content'
  }`}
>
  {/* Connection status indicator with glow */}
  <div className={`w-2 h-2 rounded-full shrink-0 ${
    isConnected ? 'bg-success shadow-[0_0_6px_theme(colors.success/40%)]' : 'bg-base-content/20'
  }`} />

  <div className="flex flex-col items-start min-w-0 flex-1">
    <span className="text-sm font-medium truncate w-full leading-tight">{host.name}</span>
    <span className="text-[11px] text-base-content/40 truncate w-full leading-tight">
      {host.username}@{host.address}
    </span>
  </div>

  {/* Visible "more options" trigger on hover */}
  <button className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-square transition-opacity">
    <MoreHorizontal className="w-3.5 h-3.5" />
  </button>
</button>
```

- Custom selection state: `bg-primary/10 text-primary` instead of daisyUI `active`
- Glowing connection dot: `shadow-[0_0_6px_theme(colors.success/40%)]`
- Remove port from subtitle (show only `user@address`)

### 5. Redesign KeychainList and SnippetList

Apply the same list item pattern as HostList:
- Custom rounded items with hover states
- Visible more-options button on hover
- Consistent spacing and typography

---

## Phase 3: Unified Header Bar

### 6. Merge SessionTabs + Toolbar — `src/renderer/src/components/SessionTabs.tsx`

Single 40px bar: session tabs scroll on the left, context-specific toolbar actions on the right.

```tsx
<header className="flex items-center h-10 bg-base-200/50 border-b border-base-content/5 shrink-0">
  {/* Session tabs - scrollable */}
  <div className="flex items-stretch overflow-x-auto flex-1 min-w-0 scrollbar-none">
    {sessions.map((session) => (
      <button className={`group flex items-center gap-1.5 px-3 h-full text-xs shrink-0 ...`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor}`} />
        <span className="truncate max-w-28">{label}</span>
        <span className="ml-1 opacity-0 group-hover:opacity-100 ...">&times;</span>
        {/* Active tab bottom accent line */}
        {isActive && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
        )}
      </button>
    ))}
  </div>

  {/* Right side: context-specific actions (icon-only) */}
  <div className="flex items-center gap-1 px-2 shrink-0 border-l border-base-content/5">
    <span className="badge badge-success badge-xs badge-outline gap-1">Live</span>
    <button className="btn btn-ghost btn-xs btn-square" title="Snippets">
      <Code className="w-3.5 h-3.5" />
    </button>
    <button className="btn btn-ghost btn-xs btn-square" title="Tunnels">
      <ArrowUpDown className="w-3.5 h-3.5" />
    </button>
    <div className="w-px h-4 bg-base-content/10 mx-0.5" />
    <button className="btn btn-ghost btn-xs btn-square text-error/60 hover:text-error" title="Close">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
</header>
```

### 7. Update App.tsx — `src/renderer/src/App.tsx`

- Remove separate toolbar rendering from Terminal/LocalTerminal components
- Pass toolbar action callbacks up to the unified header via props
- Adjust layout for new sidebar width (`w-60`)

---

## Phase 4: Terminal Views

### 8. Redesign Terminal overlays — `src/renderer/src/components/Terminal.tsx`

Replace full-screen overlays with **bottom-anchored floating banners**:

```tsx
{status === 'disconnected' && (
  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 bg-gradient-to-t from-base-300/95 to-base-300/0">
    <div className="bg-base-200 rounded-lg px-5 py-3 shadow-lg flex items-center gap-3">
      <span className="text-sm text-base-content/60">Session ended</span>
      <button className="btn btn-primary btn-sm btn-outline" onClick={handleReconnect}>
        Reconnect
      </button>
    </div>
  </div>
)}
```

- Terminal output remains visible above the banner
- Gradient fade from bottom prevents a hard edge
- Contained cards (`rounded-lg shadow-lg`) feel like notifications, not walls
- Remove the separate toolbar `<div>` (now in unified header)

### 9. Redesign LocalTerminal — `src/renderer/src/components/LocalTerminal.tsx`

- Same bottom-banner pattern for "exited" and "starting" states
- Remove the separate toolbar div

---

## Phase 5: Side Panels

### 10. Animate SnippetPanel — `src/renderer/src/components/SnippetPanel.tsx`

```tsx
<div className={`
  bg-base-200 border-l border-base-content/5 flex flex-col h-full
  transition-all duration-200 ease-out overflow-hidden
  ${isOpen ? 'w-64 min-w-[256px] opacity-100' : 'w-0 min-w-0 opacity-0'}
`}>
```

- Width transition for slide in/out effect
- Add search icon inside the filter input
- Add count badge in panel header: `<span className="badge badge-xs badge-ghost">{count}</span>`
- Section header styling: `text-xs uppercase tracking-wider text-base-content/60`

### 11. Animate TunnelPanel — `src/renderer/src/components/TunnelPanel.tsx`

- Same sliding animation pattern as SnippetPanel
- Refine tunnel card styling with consistent spacing

---

## Phase 6: Forms and Dialogs

### 12. Redesign HostForm — `src/renderer/src/components/HostForm.tsx`

- Add section headers ("Connection", "Authentication"):

```tsx
<h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
  Connection
</h3>
```

- Put Address + Port on the same row:

```tsx
<div className="flex gap-3">
  <fieldset className="fieldset flex-1">
    <label className="fieldset-label text-xs font-medium text-base-content/70">Host / IP</label>
    <input className="input input-bordered input-sm w-full bg-base-300/30 focus:bg-base-300/50 transition-colors" />
  </fieldset>
  <fieldset className="fieldset w-24">
    <label className="fieldset-label text-xs font-medium text-base-content/70">Port</label>
    <input className="input input-bordered input-sm w-full bg-base-300/30 focus:bg-base-300/50 transition-colors" />
  </fieldset>
</div>
```

- Use `input-sm bg-base-300/30 focus:bg-base-300/50` for embedded dark-theme inputs
- Right-align action buttons; add subtitle under heading
- Change max-width from `max-w-lg` to `max-w-md`

### 13. Redesign KeychainForm and SnippetForm

Apply same form patterns:
- Section headers for grouping
- Compact inputs with background transition
- Right-aligned actions
- Subtitle text

### 14. Polish ConfirmDialog — `src/renderer/src/components/ConfirmDialog.tsx`

- Add entrance animation: `animate-fade-in-scale`
- Use `rounded-xl` and `shadow-2xl shadow-black/30` for more dramatic lift
- Use `data-[highlighted]` for Radix item states (proper keyboard + mouse support)

### 15. Polish ContextMenu — `src/renderer/src/components/ContextMenu.tsx`

- Add entrance animation
- Use `data-[highlighted]:bg-base-300` instead of `hover:bg-base-300`
- Support icon slots in menu items

---

## Phase 7: Empty State and Polish

### 16. Redesign EmptyState — `src/renderer/src/components/EmptyState.tsx`

```tsx
<div className="flex flex-col items-center justify-center h-full text-center p-8 select-none">
  <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center mb-6">
    <TerminalSquare className="w-8 h-8 text-base-content/20" />
  </div>
  <h2 className="text-base font-semibold text-base-content/70 mb-1.5">{title}</h2>
  <p className="text-sm text-base-content/40 mb-6 max-w-xs leading-relaxed">{description}</p>
  <button className="btn btn-primary btn-sm btn-outline gap-1.5">
    <Plus className="w-4 h-4" />
    {action.label}
  </button>
  <p className="text-[11px] text-base-content/30 mt-4">
    or press <kbd className="kbd kbd-xs">⌘</kbd> + <kbd className="kbd kbd-xs">N</kbd>
  </p>
</div>
```

### 17. Accessibility improvements

- Add `aria-label` to all icon-only buttons
- Add `aria-live="polite"` regions for terminal status announcements:

```tsx
<div className="sr-only" aria-live="polite">
  {status === 'connected' && `Connected to ${host.name}`}
  {status === 'disconnected' && `Disconnected from ${host.name}`}
</div>
```

- Ensure `role="tab"` and `aria-selected` on session tabs
- Add `focus-visible:ring-2 focus-visible:ring-primary/50` to custom interactive elements

---

## Design Specs

### Spacing Scale (use consistently)

| Scale | Use |
|-------|-----|
| `gap-1` / `gap-1.5` | Related micro-elements (icon + label) |
| `gap-2` / `gap-2.5` | List items, form field internals |
| `gap-3` | Between form fields |
| `gap-4` / `gap-5` | Between form sections |
| `gap-6` / `gap-8` | Major content sections |

### Typography Scale

| Element | Classes |
|---------|---------|
| App brand | `text-sm font-semibold tracking-tight` |
| Section headers | `text-xs font-semibold uppercase tracking-wider text-base-content/40` |
| Form labels | `text-xs font-medium text-base-content/70` |
| Body text | `text-sm text-base-content` |
| Muted text | `text-xs text-base-content/50` |
| Tiny muted | `text-[11px] text-base-content/40` |

### Surface Hierarchy (dark to light)

| Surface | Class | Use |
|---------|-------|-----|
| Deepest | `bg-base-300` | Terminal area |
| Mid | `bg-base-200` | Sidebar, panels, dialogs |
| Translucent | `bg-base-200/50` | Unified header bar |
| Inset | `bg-base-300/30` | Input backgrounds |
| Elevated | `bg-base-100` | Active boxed tab |

### Transitions

| Element | Classes |
|---------|---------|
| Color changes | `transition-colors duration-100` |
| Side panels | `transition-all duration-200 ease-out` |
| Dialog entry | `animate-fade-in-scale` (150ms) |
| Close btn reveal | `transition-opacity duration-100` |

---

## File Change Summary

| File | Change Type |
|------|------------|
| `src/renderer/src/assets/main.css` | Add utilities, animations, adjust terminal vars |
| `package.json` | Add `lucide-react` dependency |
| `src/renderer/src/components/Sidebar.tsx` | Major restyling |
| `src/renderer/src/components/HostList.tsx` | Restyle list items |
| `src/renderer/src/components/KeychainList.tsx` | Restyle list items |
| `src/renderer/src/components/SnippetList.tsx` | Restyle list items |
| `src/renderer/src/components/SessionTabs.tsx` | Merge with toolbar, major rework |
| `src/renderer/src/App.tsx` | Layout adjustments for unified header |
| `src/renderer/src/components/Terminal.tsx` | Bottom banners, remove toolbar |
| `src/renderer/src/components/LocalTerminal.tsx` | Bottom banners, remove toolbar |
| `src/renderer/src/components/SnippetPanel.tsx` | Add animation, search icon, count |
| `src/renderer/src/components/TunnelPanel.tsx` | Add animation, refined cards |
| `src/renderer/src/components/HostForm.tsx` | Section headers, compact inputs, row layout |
| `src/renderer/src/components/KeychainForm.tsx` | Same form patterns |
| `src/renderer/src/components/SnippetForm.tsx` | Same form patterns |
| `src/renderer/src/components/ConfirmDialog.tsx` | Animation, polish |
| `src/renderer/src/components/ContextMenu.tsx` | Animation, data-[highlighted] |
| `src/renderer/src/components/EmptyState.tsx` | Illustration, kbd hints |
