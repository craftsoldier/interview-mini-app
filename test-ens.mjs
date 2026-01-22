// Simple test script to verify ENS resolution works with Alchemy API
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'

const apiKey = 'dv-_JJDsr6QKwogF4Xrpz'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`)
})

console.log('Testing ENS resolution with Alchemy API key...\n')

async function testENS() {
  try {
    // Test 1: vitalik.eth
    console.log('Test 1: Resolving vitalik.eth')
    const address1 = await publicClient.getEnsAddress({
      name: normalize('vitalik.eth')
    })
    console.log('✓ Resolved:', address1)
    console.log()

    // Test 2: brantly.eth
    console.log('Test 2: Resolving brantly.eth')
    const address2 = await publicClient.getEnsAddress({
      name: normalize('brantly.eth')
    })
    console.log('✓ Resolved:', address2)
    console.log()

    console.log('✓ All tests passed! Alchemy API key is working correctly.')
  } catch (error) {
    console.error('✗ Error:', error.message)
    process.exit(1)
  }
}

testENS()
