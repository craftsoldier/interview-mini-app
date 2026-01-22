// components/ENSResolver.tsx
'use client'

import { useState } from 'react'
import { useENSResolver } from '@/hooks/useENSResolver'
import { ENSInput } from './ENSInput'
import { AddressDisplay } from './AddressDisplay'
import { ErrorMessage } from './ErrorMessage'

export function ENSResolver() {
  const [inputValue, setInputValue] = useState('')
  const { result, isLoading, error, resolve } = useENSResolver()

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    if (inputValue.trim()) {
      await resolve(inputValue.trim())
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">ENS Name Resolver</h1>
        <p className="text-gray-600">
          Resolve Ethereum Name Service (ENS) names to their corresponding Ethereum addresses
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <ENSInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={isLoading}
            placeholder="vitalik.eth"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="
              px-8 py-3 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 active:bg-blue-800
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors duration-200
              whitespace-nowrap
            "
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Resolving...
              </span>
            ) : (
              'Resolve'
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Enter an ENS name (e.g., vitalik.eth) to resolve it to an Ethereum address
        </p>
      </form>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {result && result.isValid && result.address && (
        <div className="mb-6">
          <AddressDisplay address={result.address} ensName={result.ensName} />
        </div>
      )}

      {!error && !result && !isLoading && (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Enter an ENS name ending with .eth</li>
            <li>• The app queries the Ethereum blockchain via ENS protocol</li>
            <li>• Get the resolved Ethereum address instantly</li>
            <li>• View the address on Etherscan for more details</li>
          </ul>
        </div>
      )}
    </div>
  )
}
