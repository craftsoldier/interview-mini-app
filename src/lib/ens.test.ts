import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveENSName } from './ens'

// Mock the ethereum module
vi.mock('./ethereum', () => ({
  publicClient: {
    getEnsAddress: vi.fn(),
  },
}))

// Mock viem/ens normalize function
vi.mock('viem/ens', () => ({
  normalize: vi.fn((name: string) => name.toLowerCase()),
}))

import { publicClient } from './ethereum'
import { normalize } from 'viem/ens'

const mockGetEnsAddress = publicClient.getEnsAddress as ReturnType<typeof vi.fn>
const mockNormalize = normalize as ReturnType<typeof vi.fn>

describe('resolveENSName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset normalize to default behavior
    mockNormalize.mockImplementation((name: string) => name.toLowerCase())
  })

  describe('successful resolution', () => {
    it('should resolve valid ENS name to address', async () => {
      const mockAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      mockGetEnsAddress.mockResolvedValue(mockAddress)

      const result = await resolveENSName('vitalik.eth')

      expect(result).toEqual({
        address: mockAddress,
        ensName: 'vitalik.eth',
        isValid: true,
      })
      expect(mockNormalize).toHaveBeenCalledWith('vitalik.eth')
      expect(mockGetEnsAddress).toHaveBeenCalledWith({ name: 'vitalik.eth' })
    })

    it('should normalize ENS name before resolution', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'
      mockGetEnsAddress.mockResolvedValue(mockAddress)

      await resolveENSName('VITALIK.ETH')

      expect(mockNormalize).toHaveBeenCalledWith('VITALIK.ETH')
      expect(mockGetEnsAddress).toHaveBeenCalledWith({ name: 'vitalik.eth' })
    })
  })

  describe('ENS name not found', () => {
    it('should return error for non-existent ENS name', async () => {
      mockGetEnsAddress.mockResolvedValue(null)

      const result = await resolveENSName('thisnamedoesnotexist123456.eth')

      expect(result).toEqual({
        address: null,
        ensName: 'thisnamedoesnotexist123456.eth',
        isValid: false,
        error: 'ENS name not found or not registered',
      })
    })

    it('should return error when address is undefined', async () => {
      mockGetEnsAddress.mockResolvedValue(undefined)

      const result = await resolveENSName('unregistered.eth')

      expect(result.isValid).toBe(false)
      expect(result.address).toBeNull()
      expect(result.error).toBe('ENS name not found or not registered')
    })
  })

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockGetEnsAddress.mockRejectedValue(new Error('Network request failed'))

      const result = await resolveENSName('vitalik.eth')

      expect(result).toEqual({
        address: null,
        ensName: 'vitalik.eth',
        isValid: false,
        error: 'Network request failed',
      })
    })

    it('should handle normalization errors', async () => {
      mockNormalize.mockImplementation(() => {
        throw new Error('Invalid ENS name format')
      })

      const result = await resolveENSName('invalid\u0000name.eth')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid ENS name format')
    })

    it('should handle non-Error exceptions', async () => {
      mockGetEnsAddress.mockRejectedValue('String error')

      const result = await resolveENSName('test.eth')

      expect(result).toEqual({
        address: null,
        ensName: 'test.eth',
        isValid: false,
        error: 'Unknown error occurred',
      })
    })

    it('should handle timeout errors', async () => {
      mockGetEnsAddress.mockRejectedValue(new Error('Request timeout'))

      const result = await resolveENSName('slow.eth')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Request timeout')
    })
  })

  describe('edge cases', () => {
    it('should preserve original ENS name in error result when normalization fails', async () => {
      const originalName = 'MIXED-Case.ETH'
      mockNormalize.mockImplementation(() => {
        throw new Error('Normalization failed')
      })

      const result = await resolveENSName(originalName)

      expect(result.ensName).toBe(originalName)
    })

    it('should use normalized name in success result', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'
      mockGetEnsAddress.mockResolvedValue(mockAddress)
      mockNormalize.mockReturnValue('normalized.eth')

      const result = await resolveENSName('NORMALIZED.ETH')

      expect(result.ensName).toBe('normalized.eth')
    })
  })
})
