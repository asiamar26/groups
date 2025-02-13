'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/config'
import { Switch } from '@/components/ui/Switch'
import { toast } from 'sonner'

interface PrivacySettings {
  hide_email: boolean
  approve_followers: boolean
  show_activity: boolean
  allow_messages: boolean
}

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    hide_email: false,
    approve_followers: true,
    show_activity: true,
    allow_messages: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPrivacySettings()
  }, [])

  const loadPrivacySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setSettings({
          hide_email: data.hide_email,
          approve_followers: data.approve_followers,
          show_activity: data.show_activity,
          allow_messages: data.allow_messages,
        })
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error)
      toast.error('Failed to load privacy settings')
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      setSettings(prev => ({ ...prev, [key]: value }))
      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Error updating privacy setting:', error)
      toast.error('Failed to update setting')
      // Revert the setting if update failed
      setSettings(prev => ({ ...prev }))
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage how your information is displayed and shared.
        </p>
      </div>

      <div className="mt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Hide email address</h4>
              <p className="text-sm text-gray-500">Hide your email address from your public profile</p>
            </div>
            <Switch
              checked={settings.hide_email}
              onCheckedChange={(checked: boolean) => updateSetting('hide_email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Approve followers</h4>
              <p className="text-sm text-gray-500">Approve new followers before they can follow you</p>
            </div>
            <Switch
              checked={settings.approve_followers}
              onCheckedChange={(checked: boolean) => updateSetting('approve_followers', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Show activity</h4>
              <p className="text-sm text-gray-500">Show your activity status to other users</p>
            </div>
            <Switch
              checked={settings.show_activity}
              onCheckedChange={(checked: boolean) => updateSetting('show_activity', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Allow messages</h4>
              <p className="text-sm text-gray-500">Allow other users to send you direct messages</p>
            </div>
            <Switch
              checked={settings.allow_messages}
              onCheckedChange={(checked: boolean) => updateSetting('allow_messages', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
