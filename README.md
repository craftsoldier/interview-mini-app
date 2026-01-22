# ENS Profile Viewer

A modern web application for resolving and viewing Ethereum Name Service (ENS) profiles. This project is being developed in phases, with Phase 1 focusing on core ENS name resolution functionality.

## What is ENS?

The Ethereum Name Service (ENS) is a distributed, open, and extensible naming system based on the Ethereum blockchain. ENS maps human-readable names like "vitalik.eth" to machine-readable identifiers such as Ethereum addresses, content hashes, and metadata. It functions similarly to DNS (Domain Name System) but is built on blockchain technology, providing decentralized ownership and resolution of domain names.

## Phase 1: ENS Name Resolution

The current phase focuses on building the foundational functionality for ENS name resolution.

### Features

- **ENS Name Input**: User-friendly input field for entering ENS names (e.g., "vitalik.eth")
- **Format Validation**: Client-side validation to ensure proper ENS name format before resolution
- **Address Resolution**: Resolve ENS names to their corresponding Ethereum addresses using the ENS protocol
- **Error Handling**: Graceful handling of invalid ENS names, non-existent names, and network errors
- **Loading States**: Clear feedback during resolution process
- **Responsive Design**: Mobile-friendly interface for accessibility across devices

### What's Not Included (Coming in Phase 2)

- Profile data display (avatar, bio, social links)
- Reverse resolution (address to ENS name)
- ENS record details (text records, content hash, etc.)
- Historical data or transaction information

## Technical Stack

### Recommended Technologies

- **Frontend Framework**: React 18+ or Next.js 14+
  - Next.js recommended for SSR capabilities and better performance
  - TypeScript for type safety

- **Ethereum Integration**:
  - **ethers.js v6** or **viem**: Modern Ethereum libraries for ENS resolution
  - viem recommended for better TypeScript support and performance

- **Ethereum Provider**:
  - Infura (free tier available)
  - Alchemy (free tier available)
  - Alternative: Public RPC endpoints (not recommended for production)

- **Styling**:
  - Tailwind CSS for utility-first styling
  - shadcn/ui or similar component library for consistent UI components

- **Form Handling & Validation**:
  - React Hook Form for form management
  - Zod for schema validation

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- An Ethereum provider API key (Infura or Alchemy)
- Basic understanding of React and Ethereum concepts

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd interview-mini-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Ethereum Provider Configuration
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here
# or
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Network Configuration (default: mainnet)
NEXT_PUBLIC_ETHEREUM_NETWORK=mainnet
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Architecture Overview

### Project Structure

```
interview-mini-app/
├── src/
│   ├── app/                    # Next.js app directory (if using App Router)
│   │   ├── page.tsx           # Main landing page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ENSInput.tsx       # ENS name input component
│   │   ├── AddressDisplay.tsx # Resolved address display
│   │   └── ErrorMessage.tsx   # Error handling component
│   ├── lib/                   # Utility functions and configurations
│   │   ├── ens.ts            # ENS resolution logic
│   │   ├── validation.ts     # ENS name validation
│   │   └── ethereum.ts       # Ethereum provider setup
│   ├── hooks/                 # Custom React hooks
│   │   └── useENSResolution.ts # ENS resolution hook
│   └── types/                 # TypeScript type definitions
│       └── ens.ts            # ENS-related types
├── public/                    # Static assets
├── .env.local                # Environment variables (not in git)
└── package.json              # Project dependencies
```

### Key Components

#### ENS Resolution Flow

1. **User Input**: User enters an ENS name in the input field
2. **Validation**: Client-side validation checks format (e.g., ends with .eth)
3. **Resolution**: Application queries ENS smart contracts via provider
4. **Display**: Resolved Ethereum address is displayed to the user
5. **Error Handling**: Any errors are caught and displayed with helpful messages

#### ENS Validation Rules

- Must contain at least one dot (.)
- Must end with a valid ENS TLD (primarily .eth)
- Must contain only valid characters (alphanumeric, hyphens)
- Minimum length requirements
- No leading/trailing dots or hyphens

#### Provider Configuration

The application connects to Ethereum mainnet through a configured provider (Infura/Alchemy). The provider setup includes:

- Automatic retry logic for failed requests
- Rate limiting considerations
- Fallback mechanisms for provider unavailability

## Future Phases

### Phase 2: Profile Data Display (Planned)

- Display ENS profile avatar
- Show text records (bio, description, url, email, etc.)
- Display social media links (Twitter, GitHub, Discord, Telegram)
- Show cryptocurrency addresses (BTC, DOGE, etc.)
- Reverse resolution support

### Phase 3: Advanced Features (Planned)

- ENS subdomain support
- Historical ENS ownership data
- Multiple ENS resolution
- Export/share functionality
- Dark mode support
- ENS record editing (for connected wallet owners)

### Phase 4: Integration & Extensions (Planned)

- Wallet connection support
- Transaction history for ENS names
- Integration with other Web3 identity protocols
- Mobile application

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code Quality

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write clean, readable, and maintainable code
- Add comments for complex logic

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Vercel (Recommended for Next.js)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Alternative Platforms

- Netlify
- AWS Amplify
- Docker container deployment

## Resources

- [ENS Documentation](https://docs.ens.domains/)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [viem Documentation](https://viem.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
- [ENS Smart Contracts](https://github.com/ensdomains/ens-contracts)

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Support

For questions, issues, or suggestions:

- Open an issue on GitHub
- Contact the maintainers
- Check existing documentation and issues first

---

**Current Phase**: Phase 1 - ENS Name Resolution

**Status**: In Development

**Last Updated**: January 2026
