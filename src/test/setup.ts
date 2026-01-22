import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_ALCHEMY_API_KEY', 'test-api-key')
vi.stubEnv('NEXT_PUBLIC_ETHEREUM_NETWORK', 'mainnet')
