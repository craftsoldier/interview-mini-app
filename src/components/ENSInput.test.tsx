import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ENSInput } from './ENSInput'

describe('ENSInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render input element', () => {
      render(<ENSInput {...defaultProps} />)

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should display current value', () => {
      render(<ENSInput {...defaultProps} value="vitalik.eth" />)

      expect(screen.getByDisplayValue('vitalik.eth')).toBeInTheDocument()
    })

    it('should show placeholder when empty', () => {
      render(<ENSInput {...defaultProps} placeholder="Enter ENS name" />)

      expect(screen.getByPlaceholderText('Enter ENS name')).toBeInTheDocument()
    })

    it('should use default placeholder', () => {
      render(<ENSInput {...defaultProps} />)

      expect(screen.getByPlaceholderText('vitalik.eth')).toBeInTheDocument()
    })

    it('should have aria-label for accessibility', () => {
      render(<ENSInput {...defaultProps} />)

      expect(screen.getByLabelText('ENS name input')).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('should call onChange when typing', async () => {
      const onChange = vi.fn()
      render(<ENSInput {...defaultProps} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'test')

      expect(onChange).toHaveBeenCalledTimes(4)
      // Each keystroke calls onChange with the new character
      // since value starts empty and component is controlled
      expect(onChange).toHaveBeenNthCalledWith(1, 't')
      expect(onChange).toHaveBeenNthCalledWith(2, 'e')
      expect(onChange).toHaveBeenNthCalledWith(3, 's')
      expect(onChange).toHaveBeenNthCalledWith(4, 't')
    })

    it('should call onSubmit when pressing Enter', async () => {
      const onSubmit = vi.fn()
      render(<ENSInput {...defaultProps} onSubmit={onSubmit} />)

      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('should not call onSubmit when pressing Enter while disabled', () => {
      const onSubmit = vi.fn()
      render(<ENSInput {...defaultProps} onSubmit={onSubmit} disabled />)

      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should not call onSubmit for other keys', () => {
      const onSubmit = vi.fn()
      render(<ENSInput {...defaultProps} onSubmit={onSubmit} />)

      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Tab' })
      fireEvent.keyDown(input, { key: 'Escape' })
      fireEvent.keyDown(input, { key: 'a' })

      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      render(<ENSInput {...defaultProps} disabled />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should not be disabled by default', () => {
      render(<ENSInput {...defaultProps} />)

      expect(screen.getByRole('textbox')).not.toBeDisabled()
    })
  })

  describe('styling', () => {
    it('should apply custom className', () => {
      render(<ENSInput {...defaultProps} className="custom-class" />)

      const input = screen.getByRole('textbox')
      expect(input.className).toContain('custom-class')
    })
  })

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = vi.fn()
      render(<ENSInput {...defaultProps} ref={ref} />)

      expect(ref).toHaveBeenCalled()
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement)
    })
  })
})
