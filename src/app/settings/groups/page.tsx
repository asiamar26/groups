'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/config'
import { Switch } from '@/components/ui/Switch'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface GroupSettings {
  auto_accept_invites: boolean
  show_groups_publicly: boolean
  allow_group_invites: boolean
  notify_new_group_posts: boolean
  show_group_activity: boolean
  default_post_visibility: 'public' | 'members' | 'admins'
}

export default function GroupSettingsPage() {
  const [settings, setSettings] = useState<GroupSettings>({
    auto_accept_invites: false,
    show_groups_publicly: true,
    allow_group_invites: true,
    notify_new_group_posts: true,
    show_group_activity: true,
    default_post_visibility: 'members'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<GroupSettings | null>(null)

  useEffect(() => {
    loadGroupSettings()
  }, [])

  const loadGroupSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('user_group_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setSettings(data)
        setOriginalSettings(data)
      } else {
        setOriginalSettings(settings)
      }
    } catch (error) {
      console.error('Error loading group settings:', error)
      toast.error('Failed to load group settings')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = (key: keyof GroupSettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      setHasChanges(!isEqual(newSettings, originalSettings))
      return newSettings
    })
  }

  const saveAllSettings = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('user_group_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setOriginalSettings(settings)
      setHasChanges(false)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Simple deep equality check for our settings object
  const isEqual = (obj1: any, obj2: any) => {
    if (!obj2) return false
    return JSON.stringify(obj1) === JSON.stringify(obj2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to Settings Button */}
      <div className="flex items-center justify-between">
        <Link 
          href="/settings"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Link>

        <button
          onClick={saveAllSettings}
          disabled={!hasChanges || isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Group Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage your group preferences and default settings.
        </p>
      </div>

      <div className="mt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-accept group invites</h4>
              <p className="text-sm text-gray-500">Automatically accept invites from groups</p>
            </div>
            <Switch
              checked={settings.auto_accept_invites}
              onCheckedChange={(checked: boolean) => updateSetting('auto_accept_invites', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Show groups publicly</h4>
              <p className="text-sm text-gray-500">Allow others to see which groups you're in</p>
            </div>
            <Switch
              checked={settings.show_groups_publicly}
              onCheckedChange={(checked: boolean) => updateSetting('show_groups_publicly', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Allow group invites</h4>
              <p className="text-sm text-gray-500">Let others invite you to groups</p>
            </div>
            <Switch
              checked={settings.allow_group_invites}
              onCheckedChange={(checked: boolean) => updateSetting('allow_group_invites', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">New post notifications</h4>
              <p className="text-sm text-gray-500">Get notified about new posts in your groups</p>
            </div>
            <Switch
              checked={settings.notify_new_group_posts}
              onCheckedChange={(checked: boolean) => updateSetting('notify_new_group_posts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Show group activity</h4>
              <p className="text-sm text-gray-500">Display your group activity in your profile</p>
            </div>
            <Switch
              checked={settings.show_group_activity}
              onCheckedChange={(checked: boolean) => updateSetting('show_group_activity', checked)}
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Default post visibility</h4>
            <p className="text-sm text-gray-500">Choose who can see your posts by default</p>
            <div className="mt-2 space-y-2">
              {['public', 'members', 'admins'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value={option}
                    checked={settings.default_post_visibility === option}
                    onChange={(e) => updateSetting('default_post_visibility', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-white rounded-md shadow-lg p-4 flex items-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
          <span className="text-sm text-gray-600">Saving changes...</span>
        </div>
      )}
    </div>
  )
} 
