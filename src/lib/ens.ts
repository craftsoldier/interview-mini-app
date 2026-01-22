// lib/ens.ts
import { normalize } from 'viem/ens'
import { publicClient } from './ethereum'
import { ENSResolutionResult, ENSTextRecords } from '@/types/ens'

/**
 * Fetches ENS text records for a given normalized ENS name
 * Uses getEnsAvatar for avatar (handles IPFS/Arweave gateway resolution)
 * Uses getEnsText for other text records
 */
async function fetchTextRecords(normalizedName: string): Promise<ENSTextRecords> {
  // Fetch all records in parallel for better performance
  const [avatar, description, url, twitter, github, email] = await Promise.all([
    // Use getEnsAvatar for avatar - handles IPFS/Arweave gateway resolution
    publicClient.getEnsAvatar({ name: normalizedName }).catch(() => null),
    // Use getEnsText for other text records
    publicClient.getEnsText({ name: normalizedName, key: 'description' }).catch(() => null),
    publicClient.getEnsText({ name: normalizedName, key: 'url' }).catch(() => null),
    publicClient.getEnsText({ name: normalizedName, key: 'com.twitter' }).catch(() => null),
    publicClient.getEnsText({ name: normalizedName, key: 'com.github' }).catch(() => null),
    publicClient.getEnsText({ name: normalizedName, key: 'email' }).catch(() => null),
  ])

  return {
    avatar: avatar ?? null,
    description: description ?? null,
    url: url ?? null,
    twitter: twitter ?? null,
    github: github ?? null,
    email: email ?? null,
  }
}

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

    // Fetch text records
    const textRecords = await fetchTextRecords(normalizedName)

    return {
      address,
      ensName: normalizedName,
      isValid: true,
      textRecords
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
