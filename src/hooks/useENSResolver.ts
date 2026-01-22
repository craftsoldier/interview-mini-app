// hooks/useENSResolver.ts
import { useState, useCallback } from 'react'
import { resolveENSName } from '@/lib/ens'
import { ENSResolutionResult } from '@/types/ens'
import { validateENSName } from '@/lib/validation'

export function useENSResolver() {
  const [result, setResult] = useState<ENSResolutionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolve = useCallback(async (ensName: string) => {
    // Reset state
    setError(null)
    setResult(null)

    // Validate format first
    const validation = validateENSName(ensName)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid ENS name')
      return
    }

    // Resolve ENS name
    setIsLoading(true)
    try {
      const resolutionResult = await resolveENSName(ensName)
      setResult(resolutionResult)

      if (!resolutionResult.isValid) {
        setError(resolutionResult.error || 'Failed to resolve ENS name')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resolution failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    result,
    isLoading,
    error,
    resolve,
    reset
  }
}
