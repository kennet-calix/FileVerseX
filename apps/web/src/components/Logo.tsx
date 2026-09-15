interface LogoProps {
  className?: string
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <img
      src="/fileversex-logo.png"
      alt="FileVerseX"
      className={`object-contain ${className}`}
    />
  )
}