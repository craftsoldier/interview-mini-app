export interface ENSResolutionResult {
  address: string | null
  ensName: string
  isValid: boolean
  error?: string
}
