// components/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}
