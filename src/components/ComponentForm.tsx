'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase/config'

interface ComponentFormProps {
  initialData?: any
  onClose: () => void
  onSubmit: () => void
}

interface AccessibilityData {
  aria_role: string
  aria_label: string
  keyboard_support: string[]
  screen_reader_text: string
  wcag_guidelines: string[]
}

interface AccessibilityTestingData {
  screen_readers_tested: string[]
  keyboard_testing: string[]
  automated_tools: string[]
  manual_testing_checklist: string[]
}

export default function ComponentForm({ initialData, onClose, onSubmit }: ComponentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'ui',
    file_path: initialData?.file_path || '',
    description: initialData?.description || '',
    purpose: initialData?.purpose || '',
    version: initialData?.version || '1.0.0',
    dependencies: initialData?.dependencies || [],
    props_schema: initialData?.props_schema || {},
    usage_examples: initialData?.usage_examples || [],
    accessibility: initialData?.accessibility || {
      aria_role: '',
      aria_label: '',
      keyboard_support: [],
      screen_reader_text: '',
      wcag_guidelines: []
    },
    accessibility_testing: initialData?.accessibility_testing || {
      screen_readers_tested: [],
      keyboard_testing: [],
      automated_tools: [],
      manual_testing_checklist: []
    }
  })

  const [newDependency, setNewDependency] = useState('')
  const [newExample, setNewExample] = useState({ title: '', code: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (initialData) {
        // Update existing component
        const { error } = await supabase
          .from('components')
          .update(formData)
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        // Create new component
        const { error } = await supabase
          .from('components')
          .insert([formData])

        if (error) throw error
      }

      onSubmit()
    } catch (error) {
      console.error('Error saving component:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addDependency = () => {
    if (newDependency.trim()) {
      setFormData(prev => ({
        ...prev,
        dependencies: [...prev.dependencies, newDependency.trim()]
      }))
      setNewDependency('')
    }
  }

  const removeDependency = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter((_: string, i: number) => i !== index)
    }))
  }

  const addExample = () => {
    if (newExample.title && newExample.code) {
      setFormData(prev => ({
        ...prev,
        usage_examples: [...prev.usage_examples, { ...newExample }]
      }))
      setNewExample({ title: '', code: '' })
    }
  }

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      usage_examples: prev.usage_examples.filter((_: any, i: number) => i !== index)
    }))
  }

  const addKeyboardSupport = (support: string) => {
    if (support.trim()) {
      setFormData(prev => ({
        ...prev,
        accessibility: {
          ...prev.accessibility,
          keyboard_support: [...prev.accessibility.keyboard_support, support.trim()]
        }
      }))
    }
  }

  const addWcagGuideline = (guideline: string) => {
    if (guideline.trim()) {
      setFormData(prev => ({
        ...prev,
        accessibility: {
          ...prev.accessibility,
          wcag_guidelines: [...prev.accessibility.wcag_guidelines, guideline.trim()]
        }
      }))
    }
  }

  const addTestingItem = (category: string, item: string) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        accessibility_testing: {
          ...prev.accessibility_testing,
          [category]: [...prev.accessibility_testing[category], item.trim()]
        }
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
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

        <div>
          <label className="block text-sm font-medium text-gray-700">File Path</label>
          <input
            type="text"
            value={formData.file_path}
            onChange={(e) => setFormData(prev => ({ ...prev, file_path: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Purpose</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Version</label>
          <input
            type="text"
            value={formData.version}
            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Dependencies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dependencies</label>
        <div className="space-y-2">
          {formData.dependencies.map((dep: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{dep}</span>
              <button
                type="button"
                onClick={() => removeDependency(index)}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newDependency}
              onChange={(e) => setNewDependency(e.target.value)}
              placeholder="Add dependency..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addDependency}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Usage Examples</label>
        <div className="space-y-4">
          {formData.usage_examples.map((example: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{example.title}</h4>
                <button
                  type="button"
                  onClick={() => removeExample(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <pre className="bg-gray-50 p-3 rounded-lg text-sm">
                <code>{example.code}</code>
              </pre>
            </div>
          ))}
          <div className="border rounded-lg p-4">
            <input
              type="text"
              value={newExample.title}
              onChange={(e) => setNewExample(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Example title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              value={newExample.code}
              onChange={(e) => setNewExample(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Code example..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addExample}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Add Example
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Information */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900">Accessibility Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">ARIA Role</label>
          <input
            type="text"
            value={formData.accessibility.aria_role}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              accessibility: {
                ...prev.accessibility,
                aria_role: e.target.value
              }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ARIA Label</label>
          <input
            type="text"
            value={formData.accessibility.aria_label}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              accessibility: {
                ...prev.accessibility,
                aria_label: e.target.value
              }
            }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Screen Reader Text</label>
          <textarea
            value={formData.accessibility.screen_reader_text}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              accessibility: {
                ...prev.accessibility,
                screen_reader_text: e.target.value
              }
            }))}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Keyboard Support */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Keyboard Support</label>
          <div className="space-y-2">
            {formData.accessibility.keyboard_support.map((support: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{support}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      accessibility: {
                        ...prev.accessibility,
                        keyboard_support: prev.accessibility.keyboard_support.filter((_: string, i: number) => i !== index)
                      }
                    }))
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add keyboard support (e.g., 'Tab to focus')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addKeyboardSupport(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* WCAG Guidelines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WCAG Guidelines</label>
          <div className="space-y-2">
            {formData.accessibility.wcag_guidelines.map((guideline: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{guideline}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      accessibility: {
                        ...prev.accessibility,
                        wcag_guidelines: prev.accessibility.wcag_guidelines.filter((_: string, i: number) => i !== index)
                      }
                    }))
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add WCAG guideline (e.g., '2.1.1 Keyboard')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addWcagGuideline(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Testing */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900">Accessibility Testing</h3>

        {/* Screen Readers Tested */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Screen Readers Tested</label>
          <div className="space-y-2">
            {formData.accessibility_testing.screen_readers_tested.map((reader: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{reader}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      accessibility_testing: {
                        ...prev.accessibility_testing,
                        screen_readers_tested: prev.accessibility_testing.screen_readers_tested.filter((_: string, i: number) => i !== index)
                      }
                    }))
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add screen reader (e.g., 'NVDA')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTestingItem('screen_readers_tested', e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Manual Testing Checklist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Manual Testing Checklist</label>
          <div className="space-y-2">
            {formData.accessibility_testing.manual_testing_checklist.map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{item}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      accessibility_testing: {
                        ...prev.accessibility_testing,
                        manual_testing_checklist: prev.accessibility_testing.manual_testing_checklist.filter((_: string, i: number) => i !== index)
                      }
                    }))
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add testing item (e.g., 'Keyboard navigation tested')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTestingItem('manual_testing_checklist', e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#4070F4] text-white rounded-lg hover:bg-[#3060E0] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Component' : 'Add Component'}
        </button>
      </div>
    </form>
  )
} 