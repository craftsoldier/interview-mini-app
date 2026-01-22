// hooks/useENSResolver.ts
import { useState, useCallback } from 'react'
import { resolveENSName } from '@/lib/ens'
import { ENSProfile, ENSTextRecords } from '@/types/ens'
import { validateENSName } from '@/lib/validation'

const defaultTextRecords: ENSTextRecords = {
  avatar: null,
  description: null,
  url: null,
  twitter: null,
  github: null,
  email: null
}

export function useENSResolver() {
  const [result, setResult] = useState<ENSProfile | null>(null)
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

      // Create ENSProfile from resolution result, including text records if available
      const profile: ENSProfile = {
        address: resolutionResult.address,
        ensName: resolutionResult.ensName,
        isValid: resolutionResult.isValid,
        error: resolutionResult.error,
        textRecords: (resolutionResult as ENSProfile).textRecords || defaultTextRecords
      }

      setResult(profile)

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

  // Extract text records for convenient access
  const textRecords = result?.textRecords || null
  const avatar = textRecords?.avatar || null
  const description = textRecords?.description || null
  const url = textRecords?.url || null
  const twitter = textRecords?.twitter || null
  const github = textRecords?.github || null
  const email = textRecords?.email || null

  return {
    // Core resolution result
    result,
    isLoading,
    error,
    resolve,
    reset,
    // Text records (grouped)
    textRecords,
    // Individual text record fields for convenient access
    avatar,
    description,
    url,
    twitter,
    github,
    email
  }
}
