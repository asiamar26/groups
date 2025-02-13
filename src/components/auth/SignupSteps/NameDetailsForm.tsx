'use client'

import React, { useState } from 'react'

interface NameDetailsFormProps {
  onSubmit: (data: { first_name: string; last_name: string }) => Promise<void>
  isLoading?: boolean
}

export default function NameDetailsForm({ onSubmit, isLoading = false }: NameDetailsFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: ''
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Both first name and last name are required')
      return
    }

    try {
      await onSubmit({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim()
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving your name')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Capitalize first letter and keep rest of the string as is
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1)
    setFormData(prev => ({ ...prev, [name]: capitalizedValue }))
    setError(null)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">What's your name?</h2>
        <p className="text-gray-600">
          Please enter your real name. This helps build trust in the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <div className="mt-1">
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              required
              value={formData.first_name}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="John"
            />
          </div>
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <div className="mt-1">
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              required
              value={formData.last_name}
              onChange={handleInputChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  )
} 