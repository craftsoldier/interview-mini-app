import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage', () => {
  describe('rendering', () => {
    it('should display error message', () => {
      render(<ErrorMessage message="Something went wrong" />)

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should display different error messages', () => {
      const { rerender } = render(<ErrorMessage message="Error 1" />)
      expect(screen.getByText('Error 1')).toBeInTheDocument()

      rerender(<ErrorMessage message="Error 2" />)
      expect(screen.getByText('Error 2')).toBeInTheDocument()
    })

    it('should handle long error messages', () => {
      const longMessage =
        'This is a very long error message that should still be displayed correctly even though it is quite lengthy and contains a lot of text'
      render(<ErrorMessage message={longMessage} />)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle empty message', () => {
      render(<ErrorMessage message="" />)

      // Component should still render but without visible text
      const paragraph = screen.getByRole('paragraph', { hidden: true })
      expect(paragraph).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be visible to screen readers', () => {
      render(<ErrorMessage message="Error occurred" />)

      const element = screen.getByText('Error occurred')
      expect(element).toBeVisible()
    })
  })

  describe('styling', () => {
    it('should have error styling classes', () => {
      render(<ErrorMessage message="Test error" />)

      // Find the outer retro-card container
      const outerCard = screen.getByText('Test error').closest('.retro-card')
      expect(outerCard?.className).toContain('retro-card')
      expect(outerCard?.className).toContain('border-[var(--retro-red)]')
    })
  })
})
