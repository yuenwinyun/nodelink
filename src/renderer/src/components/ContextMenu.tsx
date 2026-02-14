import { useState, useCallback } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface ContextMenuProps {
  children: React.ReactNode
  items: ContextMenuItem[]
}

interface ContextMenuItem {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

export function ContextMenu({ children, items }: ContextMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }, [])

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <div
          onContextMenu={handleContextMenu}
          onPointerDown={(e) => {
            // Prevent Radix DropdownMenu from opening on left/middle click.
            // Only right-click (via onContextMenu) should open the menu.
            if (e.button !== 2) {
              e.preventDefault()
            }
          }}
        >
          {children}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="menu bg-base-200 rounded-box shadow-xl border border-base-300 p-1 min-w-[160px] z-50"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y
          }}
          side="bottom"
          align="start"
          sideOffset={0}
          alignOffset={0}
        >
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              className={`rounded-btn px-3 py-1.5 text-sm cursor-pointer outline-none select-none transition-colors hover:bg-base-300 focus:bg-base-300 ${
                item.variant === 'danger' ? 'text-error' : 'text-base-content'
              }`}
              onSelect={item.onClick}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
