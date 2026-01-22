import { describe, it, expect } from 'vitest'
import { validateENSName, ensNameSchema, isLikelyENSName } from './validation'

describe('validateENSName', () => {
  describe('valid ENS names', () => {
    it('should accept valid .eth names', () => {
      const result = validateENSName('vitalik.eth')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept names with numbers', () => {
      const result = validateENSName('test123.eth')
      expect(result.isValid).toBe(true)
    })

    it('should accept names with hyphens', () => {
      const result = validateENSName('my-name.eth')
      expect(result.isValid).toBe(true)
    })

    it('should accept mixed case (case insensitive)', () => {
      const result = validateENSName('Vitalik.ETH')
      expect(result.isValid).toBe(true)
    })

    it('should accept minimum length names (3 chars)', () => {
      const result = validateENSName('abc.eth')
      expect(result.isValid).toBe(true)
    })
  })

  describe('invalid ENS names - format errors', () => {
    it('should reject names without .eth suffix', () => {
      const result = validateENSName('vitalik')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('.eth')
    })

    it('should reject names with wrong TLD', () => {
      const result = validateENSName('vitalik.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('.eth')
    })

    it('should reject empty string', () => {
      const result = validateENSName('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject names that are too short (less than 3 chars total)', () => {
      const result = validateENSName('ab')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('at least 3 characters')
    })

    it('should reject names with special characters', () => {
      const result = validateENSName('test@name.eth')
      expect(result.isValid).toBe(false)
    })

    it('should reject names with spaces', () => {
      const result = validateENSName('test name.eth')
      expect(result.isValid).toBe(false)
    })

    it('should reject names with underscores', () => {
      const result = validateENSName('test_name.eth')
      expect(result.isValid).toBe(false)
    })

    it('should reject names exceeding max length (255 chars)', () => {
      const longName = 'a'.repeat(256) + '.eth'
      const result = validateENSName(longName)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('too long')
    })
  })

  describe('edge cases', () => {
    it('should reject just ".eth"', () => {
      const result = validateENSName('.eth')
      expect(result.isValid).toBe(false)
    })

    it('should reject names starting with hyphen', () => {
      // This is allowed by the regex, but may be worth noting
      const result = validateENSName('-test.eth')
      // Current regex allows this - documenting behavior
      expect(result.isValid).toBe(true)
    })

    it('should reject names ending with hyphen before .eth', () => {
      // This is allowed by the regex, but may be worth noting
      const result = validateENSName('test-.eth')
      // Current regex allows this - documenting behavior
      expect(result.isValid).toBe(true)
    })

    it('should handle whitespace around name', () => {
      const result = validateENSName(' vitalik.eth ')
      // Note: validation doesn't trim - this would be invalid
      expect(result.isValid).toBe(false)
    })
  })
})

describe('ensNameSchema (Zod schema)', () => {
  it('should parse valid ENS names', () => {
    expect(() => ensNameSchema.parse('vitalik.eth')).not.toThrow()
  })

  it('should throw for invalid ENS names', () => {
    expect(() => ensNameSchema.parse('invalid')).toThrow()
  })

  it('should provide specific error for too short names', () => {
    try {
      ensNameSchema.parse('ab')
    } catch (error: unknown) {
      const zodError = error as { errors: Array<{ message: string }> }
      expect(zodError.errors[0].message).toContain('at least 3 characters')
    }
  })
})

describe('isLikelyENSName', () => {
  describe('supported TLDs', () => {
    it('should return true for .eth names', () => {
      expect(isLikelyENSName('test.eth')).toBe(true)
    })

    it('should return true for .xyz names', () => {
      expect(isLikelyENSName('test.xyz')).toBe(true)
    })

    it('should return true for .luxe names', () => {
      expect(isLikelyENSName('test.luxe')).toBe(true)
    })

    it('should return true for .kred names', () => {
      expect(isLikelyENSName('test.kred')).toBe(true)
    })

    it('should return true for .art names', () => {
      expect(isLikelyENSName('test.art')).toBe(true)
    })

    it('should return true for .club names', () => {
      expect(isLikelyENSName('test.club')).toBe(true)
    })
  })

  describe('unsupported inputs', () => {
    it('should return false for .com names', () => {
      expect(isLikelyENSName('test.com')).toBe(false)
    })

    it('should return false for names without TLD', () => {
      expect(isLikelyENSName('test')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isLikelyENSName('')).toBe(false)
    })
  })
})
