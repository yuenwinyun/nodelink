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
