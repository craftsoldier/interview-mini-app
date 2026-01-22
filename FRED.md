# ENS Profile Viewer - Phase 1: Name Resolution

## Project Overview

The ENS Profile Viewer is a web application that enables users to resolve Ethereum Name Service (ENS) names to Ethereum addresses and view associated profile information. This document outlines Phase 1 of the project, which focuses on ENS name resolution functionality.

## What is ENS?

Ethereum Name Service (ENS) is a distributed, open, and extensible naming system based on the Ethereum blockchain. ENS maps human-readable names like "vitalik.eth" to machine-readable identifiers such as Ethereum addresses, content hashes, and metadata. Think of it as the Web3 equivalent of DNS (Domain Name System), making blockchain addresses more accessible and user-friendly.

Key benefits of ENS:
- Replaces complex hexadecimal addresses with memorable names
- Supports reverse resolution (address to name)
- Decentralized and censorship-resistant
- Supports multiple cryptocurrencies and content hashes

## Phase 1: Scope and Features

Phase 1 establishes the foundation of the application with core ENS resolution capabilities:

### Core Features
1. **ENS Name Input Field**
   - User-friendly input component for entering ENS names
   - Real-time validation feedback
   - Support for .eth and other ENS TLDs

2. **ENS Name Validation**
   - Format validation (e.g., valid characters, proper structure)
   - Client-side validation before blockchain queries
   - Clear error messaging for invalid formats

3. **ENS to Address Resolution**
   - Connect to Ethereum network via provider (Infura/Alchemy)
   - Query ENS registry to resolve names to Ethereum addresses
   - Display resolved Ethereum address
   - Handle loading states during resolution

4. **Error Handling**
   - Graceful handling of non-existent ENS names
   - Network error management
   - User-friendly error messages
   - Retry mechanisms for transient failures

### Out of Scope for Phase 1
- Profile data display (avatars, social links, etc.) - reserved for Phase 2
- Reverse resolution (address to ENS name)
- Multiple ENS name batch processing
- ENS name registration or management

## Technical Stack

### Frontend Framework
**Next.js 14+ (with App Router)**
- Server-side rendering capabilities
- Built-in API routes for backend logic
- Excellent performance and SEO
- TypeScript support out of the box

**Alternative: React 18+ (with Vite)**
- Faster development experience
- More lightweight for simple applications
- Greater flexibility in architecture

### Web3 Libraries

**Primary Recommendation: viem**
```
npm install viem
```
- Modern, lightweight, and TypeScript-first
- Excellent ENS support with built-in utilities
- Better tree-shaking and bundle size
- Superior type safety

**Alternative: ethers.js v6**
```
npm install ethers
```
- Mature and widely adopted
- Extensive documentation and community support
- Robust ENS resolution methods

### Ethereum Provider

**Infura**
- Free tier available (100,000 requests/day)
- Reliable and well-established
- Simple setup with API key

**Alchemy**
- More generous free tier
- Enhanced APIs and debugging tools
- Better analytics dashboard

**Public RPC Endpoints**
- No API key required (for development only)
- Rate-limited and less reliable
- Not recommended for production

### Additional Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^14.0.0",
    "viem": "^2.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.3.0"
  }
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Ethereum provider API key (Infura or Alchemy)
- Basic understanding of React and async JavaScript

### Installation Steps

1. **Clone and Install Dependencies**
```bash
# Navigate to project directory
cd interview-mini-app

# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

2. **Environment Configuration**

Create a `.env.local` file in the root directory:

```env
# Ethereum Provider Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
# OR
NEXT_PUBLIC_INFURA_PROJECT_ID=your_infura_project_id_here

# Network Configuration (mainnet recommended for production)
NEXT_PUBLIC_ETHEREUM_NETWORK=mainnet
```

3. **Start Development Server**
```bash
npm run dev
# Application will be available at http://localhost:3000
```

4. **Build for Production**
```bash
npm run build
npm run start
```

## Architecture Overview

### Project Structure

```
interview-mini-app/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx            # Root layout
│   │   └── api/                  # API routes (optional)
│   │       └── resolve-ens/
│   │           └── route.ts      # Server-side ENS resolution
│   ├── components/               # React components
│   │   ├── ENSInput.tsx          # ENS name input component
│   │   ├── ENSResolver.tsx       # Main resolver component
│   │   ├── AddressDisplay.tsx    # Resolved address display
│   │   └── ErrorMessage.tsx      # Error display component
│   ├── lib/                      # Utility functions and configs
│   │   ├── ens.ts                # ENS resolution logic
│   │   ├── validation.ts         # Input validation utilities
│   │   └── ethereum.ts           # Ethereum provider setup
│   ├── types/                    # TypeScript type definitions
│   │   └── ens.ts                # ENS-related types
│   └── hooks/                    # Custom React hooks
│       └── useENSResolver.ts     # ENS resolution hook
├── public/                       # Static assets
├── .env.local                    # Environment variables (gitignored)
├── package.json
├── tsconfig.json
└── FRED.md                       # This file
```

### Component Architecture

```
┌─────────────────────────────────────┐
│         ENSResolver (Main)          │
│  - Manages resolution state         │
│  - Coordinates child components     │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│  ENSInput   │  │ AddressDisplay   │
│  - Validate │  │ - Show address   │
│  - Capture  │  │ - Copy function  │
│    input    │  │ - Etherscan link │
└─────────────┘  └──────────────────┘
       │
┌──────▼──────────┐
│  ErrorMessage   │
│  - Display      │
│    errors       │
└─────────────────┘
```

### Data Flow

1. User enters ENS name in input field
2. Client-side validation checks format
3. Valid name triggers resolution request
4. Application queries Ethereum via provider
5. ENS registry returns Ethereum address (or error)
6. UI updates with result or error message

## API and Implementation Details

### ENS Resolution with viem

**1. Setup Ethereum Client**

```typescript
// lib/ethereum.ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  )
})
```

**2. ENS Resolution Function**

```typescript
// lib/ens.ts
import { normalize } from 'viem/ens'
import { publicClient } from './ethereum'

export interface ENSResolutionResult {
  address: string | null
  ensName: string
  isValid: boolean
  error?: string
}

export async function resolveENSName(
  ensName: string
): Promise<ENSResolutionResult> {
  try {
    // Normalize ENS name (handles special characters, case, etc.)
    const normalizedName = normalize(ensName)

    // Resolve ENS name to address
    const address = await publicClient.getEnsAddress({
      name: normalizedName
    })

    if (!address) {
      return {
        address: null,
        ensName: normalizedName,
        isValid: false,
        error: 'ENS name not found or not registered'
      }
    }

    return {
      address,
      ensName: normalizedName,
      isValid: true
    }
  } catch (error) {
    return {
      address: null,
      ensName,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
```

**3. ENS Name Validation**

```typescript
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
```

**4. Custom React Hook**

```typescript
// hooks/useENSResolver.ts
import { useState, useCallback } from 'react'
import { resolveENSName, ENSResolutionResult } from '@/lib/ens'
import { validateENSName } from '@/lib/validation'

export function useENSResolver() {
  const [result, setResult] = useState<ENSResolutionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolve = useCallback(async (ensName: string) => {
    // Reset state
    setError(null)
    setResult(null)

    // Validate format first
    const validation = validateENSName(ensName)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid ENS name')
      return
    }

    // Resolve ENS name
    setIsLoading(true)
    try {
      const resolutionResult = await resolveENSName(ensName)
      setResult(resolutionResult)

      if (!resolutionResult.isValid) {
        setError(resolutionResult.error || 'Failed to resolve ENS name')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resolution failed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    result,
    isLoading,
    error,
    resolve,
    reset
  }
}
```

**5. Main Resolver Component**

```typescript
// components/ENSResolver.tsx
'use client'

import { useState } from 'react'
import { useENSResolver } from '@/hooks/useENSResolver'

export function ENSResolver() {
  const [inputValue, setInputValue] = useState('')
  const { result, isLoading, error, resolve } = useENSResolver()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      await resolve(inputValue.trim())
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ENS Name Resolver</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="vitalik.eth"
            className="flex-1 px-4 py-2 border rounded-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Resolving...' : 'Resolve'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}

      {result && result.isValid && result.address && (
        <div className="p-6 bg-green-50 rounded-lg">
          <h2 className="font-semibold mb-2">Resolved Address</h2>
          <p className="font-mono text-sm break-all">{result.address}</p>
          <a
            href={`https://etherscan.io/address/${result.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            View on Etherscan →
          </a>
        </div>
      )}
    </div>
  )
}
```

### Alternative: ENS Resolution with ethers.js

```typescript
// lib/ens.ts (ethers.js version)
import { ethers } from 'ethers'

const provider = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
)

export async function resolveENSName(ensName: string) {
  try {
    const address = await provider.resolveName(ensName)

    if (!address) {
      return {
        address: null,
        ensName,
        isValid: false,
        error: 'ENS name not found'
      }
    }

    return {
      address,
      ensName,
      isValid: true
    }
  } catch (error) {
    return {
      address: null,
      ensName,
      isValid: false,
      error: error instanceof Error ? error.message : 'Resolution failed'
    }
  }
}
```

## Testing Strategy

### Unit Tests
- Validation function tests
- ENS resolution mock tests
- Component rendering tests

### Integration Tests
- End-to-end ENS resolution flow
- Error handling scenarios
- Network failure simulation

### Test Cases to Cover
1. Valid ENS name resolution (e.g., "vitalik.eth")
2. Invalid format handling (e.g., "invalid", "test")
3. Non-existent ENS name (e.g., "thisnamedoesnotexist123456.eth")
4. Network errors and timeouts
5. Empty input handling
6. Special characters and normalization

## Performance Considerations

### Optimization Strategies
1. **Debouncing**: Add 300-500ms debounce to input to prevent excessive API calls
2. **Caching**: Cache resolved addresses locally (consider time-to-live)
3. **Loading States**: Clear visual feedback during resolution
4. **Rate Limiting**: Implement client-side rate limiting for API calls
5. **Error Recovery**: Automatic retry with exponential backoff

### Example Debounced Input

```typescript
import { useDebounce } from '@/hooks/useDebounce'

function ENSInput({ onResolve }: { onResolve: (name: string) => void }) {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 500)

  useEffect(() => {
    if (debouncedValue && isValidFormat(debouncedValue)) {
      onResolve(debouncedValue)
    }
  }, [debouncedValue, onResolve])

  return <input value={value} onChange={(e) => setValue(e.target.value)} />
}
```

## Security Considerations

### Best Practices
1. **Input Sanitization**: Always validate and normalize ENS names
2. **Environment Variables**: Never expose API keys in client-side code
3. **HTTPS Only**: Ensure all provider connections use HTTPS
4. **Rate Limiting**: Protect against abuse with rate limits
5. **Content Security Policy**: Implement CSP headers for XSS protection

### ENS-Specific Security
- Use official ENS normalization to prevent homograph attacks
- Validate that resolved addresses are valid Ethereum addresses
- Be aware of ENS subdomain security implications
- Consider implementing ENS name expiration checks (future enhancement)

## Deployment

### Recommended Platforms
- **Vercel**: Optimal for Next.js, zero-config deployment
- **Netlify**: Good alternative with similar features
- **AWS Amplify**: More control, enterprise features

### Environment Variables Setup
Ensure the following are configured in your deployment platform:
```
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key_here
NEXT_PUBLIC_ETHEREUM_NETWORK=mainnet
```

### Build Command
```bash
npm run build
```

### Health Check Endpoint (Optional)
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', phase: 1 })
}
```

## Future Phases

### Phase 2: ENS Profile Data Display
- Fetch and display ENS text records (avatar, description, Twitter, GitHub, etc.)
- Show ENS avatar images
- Display social media links
- Content hash resolution

### Phase 3: Advanced Features
- Reverse resolution (address to ENS name)
- Multiple ENS name batch lookup
- ENS name history and records
- Subdomain exploration
- Primary name detection

### Phase 4: Interactive Features
- ENS name availability checker
- Registration cost estimator
- Wallet connection for owned ENS names
- ENS record management interface

## Resources and Documentation

### Official ENS Documentation
- ENS Documentation: https://docs.ens.domains/
- ENS GitHub: https://github.com/ensdomains
- ENS App: https://app.ens.domains/

### Library Documentation
- viem: https://viem.sh/
- ethers.js: https://docs.ethers.org/
- Next.js: https://nextjs.org/docs

### Ethereum Providers
- Alchemy: https://www.alchemy.com/
- Infura: https://www.infura.io/
- QuickNode: https://www.quicknode.com/

### Community Resources
- ENS Discord: https://chat.ens.domains/
- Ethereum Stack Exchange: https://ethereum.stackexchange.com/

## Contributing

This project follows standard Git workflow:
1. Create a feature branch
2. Implement changes with tests
3. Submit pull request with clear description
4. Ensure all tests pass and code is linted

## License

[Specify your license here - MIT, Apache 2.0, etc.]

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-22
**Phase**: 1 - ENS Name Resolution
**Status**: Active Development
