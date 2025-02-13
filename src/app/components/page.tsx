'use client'

import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Eye, Code2, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase/config'

interface Component {
  id: string
  name: string
  type: string
  file_path: string
  description: string
  purpose: string
  version: string
  dependencies: any[]
  props_schema: Record<string, any>
  usage_examples: Array<{
    title: string
    code: string
  }>
  created_at: string
  updated_at: string
}

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComponents()
  }, [])

  async function fetchComponents() {
    try {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('name')

      if (error) throw error
      setComponents(data || [])
    } catch (error) {
      console.error('Error fetching components:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredComponents = components.filter(component => {
    const searchString = `${component.name} ${component.description} ${component.purpose}`
      .toLowerCase()
    return (
      (!searchQuery || searchString.includes(searchQuery.toLowerCase())) &&
      (!typeFilter || component.type === typeFilter)
    )
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Component Library</h1>
          <p className="text-sm text-gray-600">Browse and manage your UI components</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#4070F4] hover:bg-[#3060E0] transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="page">Page</option>
            <option value="layout">Layout</option>
            <option value="feature">Feature</option>
            <option value="ui">UI</option>
            <option value="form">Form</option>
            <option value="modal">Modal</option>
            <option value="card">Card</option>
            <option value="button">Button</option>
            <option value="input">Input</option>
          </select>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComponents.map((component) => (
          <div
            key={component.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              {/* Component Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                  <p className="text-sm text-gray-500">{component.type}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              </div>

              {/* Component Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{component.description}</p>

              {/* Component Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Code2 className="h-4 w-4 mr-2" />
                  <span className="truncate">{component.file_path}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">v{component.version}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedComponent(component)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </button>
                <button className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Component Details Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedComponent.name}</h2>
                  <p className="text-sm text-gray-500">{selectedComponent.type}</p>
                </div>
                <button 
                  onClick={() => setSelectedComponent(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Purpose */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Purpose</h3>
                  <p className="text-gray-600">{selectedComponent.purpose}</p>
                </div>

                {/* Props Schema */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Props</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <code>{JSON.stringify(selectedComponent.props_schema, null, 2)}</code>
                  </pre>
                </div>

                {/* Usage Examples */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Examples</h3>
                  {selectedComponent.usage_examples.map((example, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{example.title}</h4>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>

                {/* Dependencies */}
                {selectedComponent.dependencies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Dependencies</h3>
                    <ul className="list-disc list-inside text-gray-600">
                      {selectedComponent.dependencies.map((dep, index) => (
                        <li key={index}>{dep}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2">{new Date(selectedComponent.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2">{new Date(selectedComponent.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 