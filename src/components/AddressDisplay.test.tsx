import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AddressDisplay } from './AddressDisplay'

// Mock navigator.clipboard
const mockWriteText = vi.fn()

describe('AddressDisplay', () => {
  const defaultProps = {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    ensName: 'vitalik.eth',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText.mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('should display ENS name', () => {
      render(<AddressDisplay {...defaultProps} />)

      expect(screen.getByText('vitalik.eth')).toBeInTheDocument()
    })

    it('should display truncated address', () => {
      render(<AddressDisplay {...defaultProps} />)

      // Component shows truncated address (0xd8dA...6045)
      expect(screen.getByText('0xd8dA...6045')).toBeInTheDocument()
    })

    it('should display Name label', () => {
      render(<AddressDisplay {...defaultProps} />)

      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('should display ETH label', () => {
      render(<AddressDisplay {...defaultProps} />)

      expect(screen.getByText('ETH')).toBeInTheDocument()
    })

    it('should render copy button', () => {
      render(<AddressDisplay {...defaultProps} />)

      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })

    it('should render Etherscan link', () => {
      render(<AddressDisplay {...defaultProps} />)

      const link = screen.getByRole('link', { name: /etherscan/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        `https://etherscan.io/address/${defaultProps.address}`
      )
    })

    it('should open Etherscan link in new tab', () => {
      render(<AddressDisplay {...defaultProps} />)

      const link = screen.getByRole('link', { name: /etherscan/i })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('copy functionality', () => {
    it('should copy address to clipboard when copy button clicked', async () => {
      render(<AddressDisplay {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(defaultProps.address)
      })
    })

    it('should show check icon after successful copy', async () => {
      render(<AddressDisplay {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        // After copy, the button title should change to "Copied!"
        expect(screen.getByTitle('Copied!')).toBeInTheDocument()
      })
    })

    it('should revert to copy icon after timeout', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })

      render(<AddressDisplay {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(copyButton)

      // Wait for the promise to resolve
      await act(async () => {
        await Promise.resolve()
      })

      expect(screen.getByTitle('Copied!')).toBeInTheDocument()

      // Advance past the 2 second timeout
      await act(async () => {
        vi.advanceTimersByTime(2100)
      })

      expect(screen.getByTitle('Copy address')).toBeInTheDocument()
    })

    it('should handle clipboard error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockWriteText.mockRejectedValue(new Error('Clipboard access denied'))

      render(<AddressDisplay {...defaultProps} />)

      const copyButton = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to copy address:',
          expect.any(Error)
        )
      })

      // Should not show "Copied!" on error
      expect(screen.queryByTitle('Copied!')).not.toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('different addresses', () => {
    it('should display different address correctly', () => {
      const customProps = {
        address: '0x1234567890123456789012345678901234567890',
        ensName: 'test.eth',
      }

      render(<AddressDisplay {...customProps} />)

      // Should show truncated address
      expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
      expect(screen.getByText(customProps.ensName)).toBeInTheDocument()
    })

    it('should update Etherscan link for different address', () => {
      const customAddress = '0x1234567890123456789012345678901234567890'
      render(<AddressDisplay address={customAddress} ensName="test.eth" />)

      const link = screen.getByRole('link', { name: /etherscan/i })
      expect(link).toHaveAttribute(
        'href',
        `https://etherscan.io/address/${customAddress}`
      )
    })
  })
})
