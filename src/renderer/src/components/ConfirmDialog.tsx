import * as Dialog from '@radix-ui/react-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  variant?: 'error' | 'warning' | 'primary'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'error'
}: ConfirmDialogProps): React.JSX.Element {
  const btnClass =
    variant === 'error'
      ? 'btn btn-error'
      : variant === 'warning'
        ? 'btn btn-warning'
        : 'btn btn-primary'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 glass-surface z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-xl bg-base-200/95 glass-surface p-6 shadow-2xl shadow-black/40 border border-base-content/5 focus:outline-none animate-fade-in-scale">
          <Dialog.Title className="text-base font-semibold text-base-content">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-base-content/60">
            {description}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button type="button" className="btn btn-ghost btn-sm rounded-lg">
                {cancelLabel}
              </button>
            </Dialog.Close>
            <button
              type="button"
              className={`${btnClass} btn-sm rounded-lg`}
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
