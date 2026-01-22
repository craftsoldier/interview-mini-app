// lib/ens.ts
import { normalize } from 'viem/ens'
import { publicClient } from './ethereum'
import { ENSResolutionResult } from '@/types/ens'

export async function resolveENSName(
  ensName: string
): Promise<ENSResolutionResult> {
  try {
    // Normalize ENS name (handles special characters, case, etc.)
    const normalizedName = normalize(ensName)

    // Resolve ENS name to address
    const address = await publicClient.getEnsAddress({
      name: normalizedName
    })

    if (!address) {
      return {
        address: null,
        ensName: normalizedName,
        isValid: false,
        error: 'ENS name not found or not registered'
      }
    }

    return {
      address,
      ensName: normalizedName,
      isValid: true
    }
  } catch (error) {
    return {
      address: null,
      ensName,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
