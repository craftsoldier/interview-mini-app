// components/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="retro-card border-[var(--retro-red)]">
      <div className="retro-card-header bg-gradient-to-r from-[var(--retro-red)] to-[#aa2222]">
        <span className="retro-card-header-title">System Error</span>
      </div>
      <div className="p-4">
        <p className="terminal-text text-[var(--retro-red)]">
          <span className="blink">[!]</span> {message}
        </p>
      </div>
    </div>
  )
}
