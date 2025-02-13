'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/config'
import { Switch } from '@/components/ui/Switch'
import { toast } from 'react-hot-toast'

interface PrivacySettings {
  hideEmail: boolean
  approveFollowers: boolean
  showActivity: boolean
  allowMessages: boolean
}

export default function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>({
    hideEmail: false,
    approveFollowers: false,
    showActivity: true,
    allowMessages: true
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
          hideEmail: data.hide_email || false,
          approveFollowers: data.approve_followers || false,
          showActivity: data.show_activity ?? true,
          allowMessages: data.allow_messages ?? true
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
      setSettings(prev => ({ ...prev, [key]: value }))

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          hide_email: key === 'hideEmail' ? value : settings.hideEmail,
          approve_followers: key === 'approveFollowers' ? value : settings.approveFollowers,
          show_activity: key === 'showActivity' ? value : settings.showActivity,
          allow_messages: key === 'allowMessages' ? value : settings.allowMessages,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
      toast.success('Settings updated successfully')
    } catch (error) {
      console.error('Error updating privacy setting:', error)
      toast.error('Failed to update settings')
      // Revert the setting if update failed
      setSettings(prev => ({ ...prev, [key]: !value }))
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading settings...</div>
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Hide Email Address</h3>
            <p className="text-sm text-gray-500">Hide your email address from your public profile</p>
          </div>
          <Switch
            checked={settings.hideEmail}
            onCheckedChange={(checked) => updateSetting('hideEmail', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Approve Followers</h3>
            <p className="text-sm text-gray-500">Manually approve new follower requests</p>
          </div>
          <Switch
            checked={settings.approveFollowers}
            onCheckedChange={(checked) => updateSetting('approveFollowers', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Show Activity</h3>
            <p className="text-sm text-gray-500">Show your activity status to other users</p>
          </div>
          <Switch
            checked={settings.showActivity}
            onCheckedChange={(checked) => updateSetting('showActivity', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Allow Messages</h3>
            <p className="text-sm text-gray-500">Allow other users to send you messages</p>
          </div>
          <Switch
            checked={settings.allowMessages}
            onCheckedChange={(checked) => updateSetting('allowMessages', checked)}
          />
        </div>
      </div>
    </div>
  )
} 