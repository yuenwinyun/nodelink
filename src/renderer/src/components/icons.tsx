import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function BaseIcon({ children, ...props }: IconProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function Plus(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  )
}

export function X(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </BaseIcon>
  )
}

export function Search(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </BaseIcon>
  )
}

export function Code(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </BaseIcon>
  )
}

export function ArrowUpDown(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="m8 7 4-4 4 4" />
      <path d="M12 3v18" />
      <path d="m16 17-4 4-4-4" />
    </BaseIcon>
  )
}

export function TerminalSquare(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <path d="M13 15h4" />
    </BaseIcon>
  )
}

export function MoreHorizontal(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="6" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
    </BaseIcon>
  )
}

export function ChevronLeft(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </BaseIcon>
  )
}

export function ChevronRight(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </BaseIcon>
  )
}

export function RefreshCw(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </BaseIcon>
  )
}

export function Command(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </BaseIcon>
  )
}

export function Globe(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </BaseIcon>
  )
}

export function Key(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.3 9.3" />
      <path d="m11.7 11.3 4.6 4.6" />
      <path d="M18 13l4-4" />
    </BaseIcon>
  )
}

export function Zap(props: IconProps): React.JSX.Element {
  return (
    <BaseIcon {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </BaseIcon>
  )
}
