// lib/validation.ts
import { z } from 'zod'

// ENS name format validation schema
export const ensNameSchema = z
  .string()
  .min(3, 'ENS name must be at least 3 characters')
  .max(255, 'ENS name is too long')
  .regex(
    /^[a-z0-9-]+\.eth$/i,
    'ENS name must end with .eth and contain only letters, numbers, and hyphens'
  )

export function validateENSName(name: string): {
  isValid: boolean
  error?: string
} {
  try {
    ensNameSchema.parse(name)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0].message
      }
    }
    return {
      isValid: false,
      error: 'Invalid ENS name format'
    }
  }
}

// More lenient check for other TLDs
export function isLikelyENSName(name: string): boolean {
  return /^[a-z0-9-]+\.(eth|xyz|luxe|kred|art|club)$/i.test(name)
}
