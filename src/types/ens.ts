export interface ENSTextRecords {
  avatar: string | null
  description: string | null
  url: string | null
  twitter: string | null
  github: string | null
  email: string | null
}

export interface ENSResolutionResult {
  address: string | null
  ensName: string
  isValid: boolean
  error?: string
  textRecords?: ENSTextRecords
}

export interface ENSProfile {
  address: string | null
  ensName: string
  isValid: boolean
  error?: string
  textRecords: ENSTextRecords
}
