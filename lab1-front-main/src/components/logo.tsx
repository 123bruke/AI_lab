import { FlaskConical } from "lucide-react"

export default function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="AFROLAB"
      title="AFROLAB"
      className={`inline-flex h-10 w-10 items-center justify-center ${className ?? ""}`}
    >
      <FlaskConical size={27} strokeWidth={1.8} aria-hidden="true" />
    </span>
  )
}
