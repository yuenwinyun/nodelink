# NodeLink

A desktop SSH client for managing remote hosts and credentials, built with Electron and React. Similar in concept to [Termius](https://termius.com/), NodeLink lets you organize SSH connections, store credentials securely in a local keychain, and open interactive terminal sessions -- all from a single app.

## Features

- **Host management** -- Create, edit, and delete SSH host entries with name, address, port, and username
- **Credential keychain** -- Store passwords and SSH private keys, then link them to hosts
- **Interactive terminal** -- Full terminal emulation via xterm.js with 256-color support, Unicode 11, and auto-resize
- **Multiple sessions** -- Connect to several hosts simultaneously with per-session tracking
- **Authentication methods** -- Password, SSH key, keyboard-interactive, and SSH agent fallback
- **Dark theme UI** -- Clean interface built with daisyUI and Radix UI primitives

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Electron 39 |
| Build | electron-vite, Vite 7 |
| UI | React 19, TypeScript 5.9 |
| Styling | Tailwind CSS 4, daisyUI 5 |
| Components | Radix UI (Dialog, DropdownMenu, Toggle) |
| Terminal | xterm.js 6, FitAddon, Unicode11Addon |
| SSH | ssh2 |
| Storage | JSON file in app data directory |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)
- A Powerline-patched or [Nerd Font](https://www.nerdfonts.com/) installed for proper terminal glyph rendering (e.g. `brew install --cask font-meslo-lg-nerd-font`)

### Install & Run

```bash
pnpm install
pnpm dev
```

### Build

```bash
# Typecheck and build
pnpm build

# Build macOS .dmg
pnpm build:mac

# Build unpacked directory (for debugging)
pnpm build:unpack
```

### Other Commands

```bash
pnpm typecheck    # Run type checks for both processes
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
```

## Project Structure

```
src/
├── main/                  # Electron main process
│   ├── index.ts           # App lifecycle and IPC handler registration
│   ├── ssh.ts             # SSH connection management (ssh2)
│   └── store.ts           # JSON file-based persistence
├── preload/               # Context bridge (secure IPC)
│   ├── index.ts           # Exposes window.api to renderer
│   └── index.d.ts         # TypeScript declarations
├── renderer/              # React frontend
│   └── src/
│       ├── App.tsx        # Root component and view routing
│       ├── main.tsx       # Entry point
│       ├── types.ts       # SSH config builder
│       ├── assets/
│       │   └── main.css   # Tailwind + daisyUI + theme variables
│       ├── components/
│       │   ├── Terminal.tsx      # xterm.js terminal view
│       │   ├── Sidebar.tsx      # Left sidebar with tabs
│       │   ├── HostList.tsx     # Host list with context menu
│       │   ├── HostForm.tsx     # Create/edit host form
│       │   ├── KeychainList.tsx # Keychain entry list
│       │   ├── KeychainForm.tsx # Create/edit keychain form
│       │   ├── EmptyState.tsx   # Welcome / empty placeholder
│       │   ├── ContextMenu.tsx  # Right-click menu (Radix)
│       │   └── ConfirmDialog.tsx# Delete confirmation (Radix)
│       └── hooks/
│           ├── useAppNavigation.ts # View state management
│           ├── useHosts.ts        # Host CRUD hook
│           └── useKeychain.ts     # Keychain CRUD hook
└── shared/
    └── types.ts           # Types shared across all processes
```

## Architecture

NodeLink follows Electron's multi-process model:

```
┌─────────────────────────────────────────────┐
│  Renderer Process (React)                   │
│  xterm.js ↔ hooks ↔ components              │
│         ↕ IPC via context bridge            │
├─────────────────────────────────────────────┤
│  Main Process                               │
│  ssh2 sessions  ←→  JSON store (data.json)  │
└─────────────────────────────────────────────┘
```

- **Renderer** handles all UI and terminal rendering. It never touches Node APIs directly.
- **Preload** script exposes a typed `window.api` object via Electron's context bridge.
- **Main** process manages SSH connections (ssh2), persists data to a JSON file in the app's `userData` directory, and handles all IPC.

## Data Storage

Host and keychain data is stored as a JSON file (`data.json`) in Electron's user data directory. Deleting a keychain entry automatically unlinks it from any hosts that reference it.

## License

MIT
