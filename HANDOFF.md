# ENS Profile Viewer - Phase 2 Handoff

## Current Status: Phase 1 Complete ✓

Phase 1 (ENS Name Resolution) is fully implemented and functional:
- ✓ ENS name input with validation
- ✓ Resolve ENS names to Ethereum addresses
- ✓ Display resolved address with copy and Etherscan link
- ✓ Error handling and loading states
- ✓ Responsive UI with Tailwind CSS

**Git Commit:** `50e01d6` - "Implement Phase 1: ENS Name Resolution"

---

## Phase 2: Display All ENS Profile Records

### Objective
Extend the application to fetch and display **ALL populated ENS text records and profile data** from the Ethereum blockchain, not just the resolved address.

### What's Missing
Currently, the app only displays the Ethereum address. According to ENS specifications (ENSIP-5, ENSIP-12, ENSIP-18), ENS names can store much more information:

### Required Data to Display

#### 1. **Text Records** (ENSIP-5 Standard Keys)
Fetch and display all standard text records:
- `avatar` - Profile image/NFT (ENSIP-12 compliant)
- `description` - Biography/profile description
- `display` - Canonical display name
- `email` - Email address
- `url` - Website URL
- `location` - Geographic location
- `notice` - Legal notice
- `keywords` - Comma-separated keywords
- `com.github` - GitHub username
- `com.twitter` - Twitter/X handle
- `com.discord` - Discord handle
- `org.telegram` - Telegram handle
- `com.reddit` - Reddit username
- `snapshot` - Snapshot voting profile
- `eth.ens.delegate` - ENS governance delegate

#### 2. **Multi-Chain Addresses** (ENSIP-9)
Display cryptocurrency addresses for other blockchains:
- Bitcoin (BTC)
- Litecoin (LTC)
- Dogecoin (DOGE)
- Other chains via SLIP44 coin type

#### 3. **Content Hash** (ENSIP-7)
- IPFS/Swarm content hash for decentralized websites
- Display as clickable link if present

#### 4. **Avatar Display** (ENSIP-12)
Special handling for avatars:
- Support URL-based avatars
- Support NFT-based avatars (ERC-721/ERC-1155)
  - Format: `eip155:1/erc721:0xContractAddress/tokenId`
  - Format: `eip155:1/erc1155:0xContractAddress/tokenId`

### Implementation Requirements

#### Technical Approach

**1. Update ENS Resolution Logic**
- Extend `src/lib/ens.ts` to fetch text records using `publicClient.getEnsText()`
- Create a function to fetch multiple text records in parallel
- Add avatar resolution support

**2. Create New Components**
- `ENSProfile.tsx` - Main profile display component
- `ENSAvatar.tsx` - Avatar display with NFT support
- `ENSTextRecords.tsx` - Display all text records in organized sections
- `ENSAddresses.tsx` - Display multi-chain addresses
- `SocialLinks.tsx` - Social media links with icons

**3. Update Data Types**
- Extend `src/types/ens.ts` to include:
  ```typescript
  interface ENSTextRecords {
    avatar?: string
    description?: string
    display?: string
    email?: string
    url?: string
    location?: string
    notice?: string
    keywords?: string
    github?: string
    twitter?: string
    discord?: string
    telegram?: string
    reddit?: string
    [key: string]: string | undefined  // For custom records
  }

  interface ENSProfileData {
    address: string
    ensName: string
    textRecords: ENSTextRecords
    contentHash?: string
    otherAddresses: {
      [coinType: string]: string
    }
  }
  ```

**4. UI/UX Design**
- Card-based layout for profile sections
- Avatar prominently displayed at top
- Organized sections:
  - Basic Info (display name, description)
  - Contact (email, url, location)
  - Social Media (with platform icons)
  - Blockchain Addresses (multi-chain)
  - Additional Records (content hash, keywords, etc.)
- Only show sections that have data (hide empty sections)
- Visual indicators for verified records

#### Code Examples to Implement

**Fetching Text Records:**
```typescript
// src/lib/ens.ts
import { publicClient } from './ethereum'
import { normalize } from 'viem/ens'

const TEXT_RECORD_KEYS = [
  'avatar',
  'description',
  'display',
  'email',
  'url',
  'location',
  'notice',
  'keywords',
  'com.github',
  'com.twitter',
  'com.discord',
  'org.telegram',
  'com.reddit',
  'snapshot',
  'eth.ens.delegate'
]

export async function fetchENSTextRecords(ensName: string) {
  const normalizedName = normalize(ensName)

  // Fetch all text records in parallel
  const recordPromises = TEXT_RECORD_KEYS.map(async (key) => {
    try {
      const value = await publicClient.getEnsText({
        name: normalizedName,
        key: key
      })
      return { key, value }
    } catch {
      return { key, value: null }
    }
  })

  const results = await Promise.allSettled(recordPromises)

  const records: ENSTextRecords = {}
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.value) {
      records[result.value.key] = result.value.value
    }
  })

  return records
}
```

**Fetching Content Hash:**
```typescript
export async function fetchENSContentHash(ensName: string) {
  try {
    const normalizedName = normalize(ensName)
    const contentHash = await publicClient.getEnsResolver({
      name: normalizedName,
    }).then(resolver => resolver?.contentHash?.())
    return contentHash
  } catch {
    return null
  }
}
```

**Avatar Resolution (basic URL support):**
```typescript
export async function resolveENSAvatar(ensName: string) {
  try {
    const normalizedName = normalize(ensName)
    const avatar = await publicClient.getEnsAvatar({
      name: normalizedName
    })
    return avatar
  } catch {
    return null
  }
}
```

### Testing Requirements

**Test Cases:**
1. ENS name with full profile (e.g., `vitalik.eth`)
2. ENS name with minimal records
3. ENS name with NFT avatar
4. ENS name with no text records (only address)
5. Verify all social links are clickable and properly formatted
6. Verify avatar images load correctly
7. Test multi-chain address display

**Suggested Test ENS Names:**
- `vitalik.eth` - Well-populated profile
- `brantly.eth` - ENS founder with complete records
- `nick.eth` - Nick Johnson (ENS creator)
- `luc.eth` - Another example with social links

### UI/UX Considerations

1. **Progressive Loading:** Show address first, then load profile data
2. **Empty States:** Clear messaging when records are empty
3. **Icons:** Use appropriate icons for social platforms
4. **Copy Buttons:** Allow copying individual fields
5. **Links:** Make all URLs, social handles, and addresses clickable
6. **Mobile Responsive:** Ensure profile cards work on mobile
7. **Avatar Fallback:** Show placeholder if avatar fails to load

### File Changes Needed

**New Files:**
- `src/components/ENSProfile.tsx`
- `src/components/ENSAvatar.tsx`
- `src/components/ENSTextRecords.tsx`
- `src/components/ENSAddresses.tsx`
- `src/components/SocialLinks.tsx`

**Modified Files:**
- `src/lib/ens.ts` - Add text record fetching
- `src/types/ens.ts` - Add new types
- `src/hooks/useENSResolver.ts` - Extend to fetch profile data
- `src/components/ENSResolver.tsx` - Integrate profile display

### Resources

**ENS Documentation:**
- [ENSIP-5: Text Records](https://docs.ens.domains/ensip/5/)
- [ENSIP-12: Avatar Text Records](https://docs.ens.domains/ensip/12/)
- [ENSIP-18: Profile Text Records](https://docs.ens.domains/ensip/18/)
- [viem ENS Actions](https://viem.sh/docs/ens/actions/getEnsText.html)

**viem Methods to Use:**
- `getEnsText()` - Fetch individual text records
- `getEnsAvatar()` - Resolve avatar (with NFT support)
- `getEnsAddress()` - Fetch addresses for other coins (SLIP44)

### Success Criteria

Phase 2 is complete when:
- ✓ All standard ENS text records are fetched and displayed
- ✓ Avatar is displayed (with NFT support)
- ✓ Social media links are clickable with icons
- ✓ Multi-chain addresses are shown (if present)
- ✓ Content hash is displayed (if present)
- ✓ Empty sections are gracefully hidden
- ✓ UI is responsive and polished
- ✓ All data loads efficiently (parallel requests)

### Current Environment

- **API Key:** Already configured in `.env.local`
- **Dev Server:** `npm run dev` (http://localhost:3000)
- **Build:** `npm run build`
- **Tech Stack:** Next.js 14, viem 2.0, Tailwind CSS

---

## Next Steps

1. Read FRED.md for full context on the project
2. Review Phase 1 implementation in `src/` directory
3. Implement text record fetching in `src/lib/ens.ts`
4. Create profile display components
5. Test with well-known ENS names (vitalik.eth, brantly.eth)
6. Ensure empty states are handled gracefully
7. Commit Phase 2 when complete

---

**Questions or Issues?**
Refer to FRED.md for architectural details and ENS specification web search results for complete field lists.

**Date:** 2026-01-22
**Phase:** 1 → 2
**Status:** Ready for Phase 2 implementation
