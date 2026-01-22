import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ENSResolver } from './ENSResolver'

// Mock the useENSResolver hook
vi.mock('@/hooks/useENSResolver', () => ({
  useENSResolver: vi.fn(),
}))

import { useENSResolver } from '@/hooks/useENSResolver'

const mockUseENSResolver = useENSResolver as ReturnType<typeof vi.fn>

describe('ENSResolver', () => {
  const mockResolve = vi.fn()
  const mockReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock state
    mockUseENSResolver.mockReturnValue({
      result: null,
      isLoading: false,
      error: null,
      resolve: mockResolve,
      reset: mockReset,
    })
  })

  describe('initial render', () => {
    it('should render the title', () => {
      render(<ENSResolver />)

      expect(screen.getByText('ENS Explorer')).toBeInTheDocument()
    })

    it('should render description', () => {
      render(<ENSResolver />)

      expect(
        screen.getByText(/Discover decentralized identities/i)
      ).toBeInTheDocument()
    })

    it('should render input field', () => {
      render(<ENSResolver />)

      expect(screen.getByPlaceholderText(/Enter ENS name/i)).toBeInTheDocument()
    })

    it('should render search button', () => {
      render(<ENSResolver />)

      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    })

    it('should show empty state when no result or error', () => {
      render(<ENSResolver />)

      expect(screen.getByText(/Enter an ENS name above to explore/i)).toBeInTheDocument()
    })

    it('should disable button when input is empty', () => {
      render(<ENSResolver />)

      const button = screen.getByRole('button', { name: /search/i })
      expect(button).toBeDisabled()
    })
  })

  describe('user input', () => {
    it('should enable button when input has value', async () => {
      render(<ENSResolver />)

      const input = screen.getByPlaceholderText(/Enter ENS name/i)
      await userEvent.type(input, 'test.eth')

      const button = screen.getByRole('button', { name: /search/i })
      expect(button).not.toBeDisabled()
    })

    it('should call resolve on form submit', async () => {
      render(<ENSResolver />)

      const input = screen.getByPlaceholderText(/Enter ENS name/i)
      await userEvent.type(input, 'vitalik.eth')

      const button = screen.getByRole('button', { name: /search/i })
      fireEvent.click(button)

      expect(mockResolve).toHaveBeenCalledWith('vitalik.eth')
    })

    it('should trim whitespace from input', async () => {
      render(<ENSResolver />)

      const input = screen.getByPlaceholderText(/Enter ENS name/i)
      await userEvent.type(input, '  vitalik.eth  ')

      const button = screen.getByRole('button', { name: /search/i })
      fireEvent.click(button)

      expect(mockResolve).toHaveBeenCalledWith('vitalik.eth')
    })

    it('should submit on Enter key', async () => {
      render(<ENSResolver />)

      const input = screen.getByPlaceholderText(/Enter ENS name/i)
      await userEvent.type(input, 'vitalik.eth{enter}')

      expect(mockResolve).toHaveBeenCalledWith('vitalik.eth')
    })
  })

  describe('loading state', () => {
    it('should show loading indicator when isLoading is true', () => {
      mockUseENSResolver.mockReturnValue({
        result: null,
        isLoading: true,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      // Component shows a retro-spinner element
      const spinner = document.querySelector('.retro-spinner')
      expect(spinner).toBeInTheDocument()
    })

    it('should disable input while loading', () => {
      mockUseENSResolver.mockReturnValue({
        result: null,
        isLoading: true,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      const input = screen.getByPlaceholderText(/Enter ENS name/i)
      expect(input).toBeDisabled()
    })

    it('should disable button while loading', () => {
      mockUseENSResolver.mockReturnValue({
        result: null,
        isLoading: true,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      const button = screen.getByRole('button', { name: /search/i })
      expect(button).toBeDisabled()
    })
  })

  describe('error display', () => {
    it('should show error message when error exists', () => {
      mockUseENSResolver.mockReturnValue({
        result: null,
        isLoading: false,
        error: 'ENS name not found',
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      expect(screen.getByText('ENS name not found')).toBeInTheDocument()
    })

    it('should hide empty state when error is shown', () => {
      mockUseENSResolver.mockReturnValue({
        result: null,
        isLoading: false,
        error: 'Some error',
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      expect(screen.queryByText(/Enter an ENS name above to explore/i)).not.toBeInTheDocument()
    })
  })

  describe('success display', () => {
    it('should show address display when resolution is successful', () => {
      mockUseENSResolver.mockReturnValue({
        result: {
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          ensName: 'vitalik.eth',
          isValid: true,
        },
        isLoading: false,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      // Component shows truncated address (0xd8dA...6045) - may appear multiple times (desktop/mobile)
      const addressElements = screen.getAllByText('0xd8dA...6045')
      expect(addressElements.length).toBeGreaterThan(0)
      // ENS name appears multiple times (quick try button, profile header, info row)
      const ensNameElements = screen.getAllByText('vitalik.eth')
      expect(ensNameElements.length).toBeGreaterThan(0)
    })

    it('should show Etherscan link for resolved address', () => {
      mockUseENSResolver.mockReturnValue({
        result: {
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          ensName: 'vitalik.eth',
          isValid: true,
        },
        isLoading: false,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      const link = screen.getByRole('link', { name: /etherscan/i })
      expect(link).toHaveAttribute(
        'href',
        'https://etherscan.io/address/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      )
    })

    it('should hide empty state when result is shown', () => {
      mockUseENSResolver.mockReturnValue({
        result: {
          address: '0x123456789012345678901234567890123456789a',
          ensName: 'test.eth',
          isValid: true,
        },
        isLoading: false,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      expect(screen.queryByText(/Enter an ENS name above to explore/i)).not.toBeInTheDocument()
    })

    it('should not show result if isValid is false', () => {
      mockUseENSResolver.mockReturnValue({
        result: {
          address: null,
          ensName: 'test.eth',
          isValid: false,
          error: 'Not found',
        },
        isLoading: false,
        error: 'Not found',
        resolve: mockResolve,
        reset: mockReset,
      })

      render(<ENSResolver />)

      // Error should be shown
      expect(screen.getByText('Not found')).toBeInTheDocument()
      // But not the profile display
      expect(screen.queryByText('General Info')).not.toBeInTheDocument()
    })
  })

  describe('integration flow', () => {
    it('should complete full resolution flow', async () => {
      const { rerender } = render(<ENSResolver />)

      // Step 1: Enter ENS name
      const input = screen.getByPlaceholderText(/Enter ENS name/i)
      await userEvent.type(input, 'vitalik.eth')

      // Step 2: Click resolve
      const button = screen.getByRole('button', { name: /search/i })
      fireEvent.click(button)

      expect(mockResolve).toHaveBeenCalledWith('vitalik.eth')

      // Step 3: Simulate loading state
      mockUseENSResolver.mockReturnValue({
        result: null,
        isLoading: true,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })
      rerender(<ENSResolver />)

      const spinner = document.querySelector('.retro-spinner')
      expect(spinner).toBeInTheDocument()

      // Step 4: Simulate success
      mockUseENSResolver.mockReturnValue({
        result: {
          address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          ensName: 'vitalik.eth',
          isValid: true,
        },
        isLoading: false,
        error: null,
        resolve: mockResolve,
        reset: mockReset,
      })
      rerender(<ENSResolver />)

      // Check truncated address is shown (may appear multiple times for desktop/mobile)
      const addressElements = screen.getAllByText('0xd8dA...6045')
      expect(addressElements.length).toBeGreaterThan(0)
    })
  })

  describe('quick try buttons', () => {
    it('should render quick try buttons', () => {
      render(<ENSResolver />)

      expect(screen.getByText('vitalik.eth')).toBeInTheDocument()
      expect(screen.getByText('nick.eth')).toBeInTheDocument()
      expect(screen.getByText('brantly.eth')).toBeInTheDocument()
    })

    it('should resolve when quick try button is clicked', async () => {
      render(<ENSResolver />)

      const quickTryButton = screen.getByRole('button', { name: 'vitalik.eth' })
      fireEvent.click(quickTryButton)

      expect(mockResolve).toHaveBeenCalledWith('vitalik.eth')
    })
  })
})
