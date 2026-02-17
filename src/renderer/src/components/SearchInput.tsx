import { Search } from './icons'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  shortcutHint?: string
  autoFocus?: boolean
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  shortcutHint,
  autoFocus
}: SearchInputProps): React.JSX.Element {
  return (
    <div className="relative">
      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40" />
      <input
        type="text"
        className="input input-bordered input-sm w-full pl-8 pr-2 bg-base-300/20 focus:border-primary/30 rounded-lg transition-colors placeholder:text-base-content/30"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
      {shortcutHint && !value && (
        <kbd className="kbd kbd-xs absolute right-2 top-1/2 -translate-y-1/2 text-base-content/30">
          {shortcutHint}
        </kbd>
      )}
    </div>
  )
}
