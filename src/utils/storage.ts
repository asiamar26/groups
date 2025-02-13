import { supabase } from '@/lib/supabase/config'

/**
 * Uploads a profile picture to Supabase Storage
 * @param userId The ID of the user
 * @param file The file or blob to upload
 * @returns The URL of the uploaded file
 * @throws Error if the upload fails
 */
export async function uploadProfilePicture(userId: string, file: File | Blob): Promise<string> {
  try {
    // Create a unique file name
    const fileName = `${userId}-${Date.now()}.jpg`
    const filePath = `${userId}/${fileName}`

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        contentType: 'image/jpeg'
      })

    if (uploadError) throw uploadError

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw new Error('Failed to upload profile picture')
  }
}

/**
 * Deletes a profile picture from Supabase Storage
 * @param userId The ID of the user
 * @param url The URL of the file to delete
 */
export async function deleteProfilePicture(userId: string, url: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const path = url.split('/').slice(-2).join('/')
    
    // Delete the file from Supabase Storage
    const { error } = await supabase.storage
      .from('avatars')
      .remove([path])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting profile picture:', error)
    throw new Error('Failed to delete profile picture')
  }
} 