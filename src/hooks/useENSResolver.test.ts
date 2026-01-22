import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useENSResolver } from './useENSResolver'

// Mock the ens module
vi.mock('@/lib/ens', () => ({
  resolveENSName: vi.fn(),
}))

// Mock the validation module
vi.mock('@/lib/validation', () => ({
  validateENSName: vi.fn(),
}))

import { resolveENSName } from '@/lib/ens'
import { validateENSName } from '@/lib/validation'

const mockResolveENSName = resolveENSName as ReturnType<typeof vi.fn>
const mockValidateENSName = validateENSName as ReturnType<typeof vi.fn>

describe('useENSResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: validation passes
    mockValidateENSName.mockReturnValue({ isValid: true })
  })

  describe('initial state', () => {
    it('should have null result initially', () => {
      const { result } = renderHook(() => useENSResolver())

      expect(result.current.result).toBeNull()
    })

    it('should not be loading initially', () => {
      const { result } = renderHook(() => useENSResolver())

      expect(result.current.isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const { result } = renderHook(() => useENSResolver())

      expect(result.current.error).toBeNull()
    })

    it('should provide resolve function', () => {
      const { result } = renderHook(() => useENSResolver())

      expect(typeof result.current.resolve).toBe('function')
    })

    it('should provide reset function', () => {
      const { result } = renderHook(() => useENSResolver())

      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('validation errors', () => {
    it('should set error when validation fails', async () => {
      mockValidateENSName.mockReturnValue({
        isValid: false,
        error: 'ENS name must end with .eth',
      })

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('invalid')
      })

      expect(result.current.error).toBe('ENS name must end with .eth')
      expect(result.current.result).toBeNull()
      expect(mockResolveENSName).not.toHaveBeenCalled()
    })

    it('should use default error message when validation error is undefined', async () => {
      mockValidateENSName.mockReturnValue({
        isValid: false,
        error: undefined,
      })

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('invalid')
      })

      expect(result.current.error).toBe('Invalid ENS name')
    })
  })

  describe('successful resolution', () => {
    it('should resolve valid ENS name', async () => {
      const mockResult = {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        ensName: 'vitalik.eth',
        isValid: true,
      }
      mockResolveENSName.mockResolvedValue(mockResult)

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('vitalik.eth')
      })

      expect(result.current.result).toEqual(mockResult)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should set isLoading during resolution', async () => {
      let resolvePromise: (value: unknown) => void
      mockResolveENSName.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve
          })
      )

      const { result } = renderHook(() => useENSResolver())

      act(() => {
        result.current.resolve('vitalik.eth')
      })

      // Should be loading
      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!({
          address: '0x123',
          ensName: 'vitalik.eth',
          isValid: true,
        })
      })

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should clear previous state before resolving', async () => {
      // First resolution fails
      mockResolveENSName.mockResolvedValueOnce({
        address: null,
        ensName: 'notfound.eth',
        isValid: false,
        error: 'Not found',
      })

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('notfound.eth')
      })

      expect(result.current.error).toBe('Not found')

      // Second resolution succeeds
      mockResolveENSName.mockResolvedValueOnce({
        address: '0x123',
        ensName: 'found.eth',
        isValid: true,
      })

      await act(async () => {
        await result.current.resolve('found.eth')
      })

      expect(result.current.error).toBeNull()
      expect(result.current.result?.isValid).toBe(true)
    })
  })

  describe('resolution errors', () => {
    it('should set error when ENS name not found', async () => {
      mockResolveENSName.mockResolvedValue({
        address: null,
        ensName: 'notfound.eth',
        isValid: false,
        error: 'ENS name not found',
      })

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('notfound.eth')
      })

      expect(result.current.error).toBe('ENS name not found')
      expect(result.current.result?.isValid).toBe(false)
    })

    it('should handle resolution throwing error', async () => {
      mockResolveENSName.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('vitalik.eth')
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle non-Error exceptions', async () => {
      mockResolveENSName.mockRejectedValue('String error')

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('vitalik.eth')
      })

      expect(result.current.error).toBe('Resolution failed')
    })

    it('should use default error message when resolution error is undefined', async () => {
      mockResolveENSName.mockResolvedValue({
        address: null,
        ensName: 'test.eth',
        isValid: false,
        error: undefined,
      })

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('test.eth')
      })

      expect(result.current.error).toBe('Failed to resolve ENS name')
    })
  })

  describe('reset function', () => {
    it('should reset all state', async () => {
      mockResolveENSName.mockResolvedValue({
        address: '0x123',
        ensName: 'vitalik.eth',
        isValid: true,
      })

      const { result } = renderHook(() => useENSResolver())

      await act(async () => {
        await result.current.resolve('vitalik.eth')
      })

      expect(result.current.result).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.result).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('memoization', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useENSResolver())

      const initialResolve = result.current.resolve
      const initialReset = result.current.reset

      rerender()

      expect(result.current.resolve).toBe(initialResolve)
      expect(result.current.reset).toBe(initialReset)
    })
  })
})
