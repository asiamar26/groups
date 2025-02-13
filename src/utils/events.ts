import { supabase } from '@/lib/supabase/config'
import { Database } from '@/lib/database.types'

export type EventAttendanceStatus = 'attending' | 'maybe' | 'not_attending'

export type Event = {
  id: string
  groupId: string
  creatorId: string
  title: string
  description: string | null
  location: string | null
  startTime: string
  endTime: string
  maxAttendees: number | null
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
  }
  attendees: {
    id: string
    email: string
    displayName: string | null
    avatarUrl: string | null
    status: EventAttendanceStatus
  }[]
  userAttendanceStatus?: EventAttendanceStatus | null
}

export async function getGroupEvents(groupId: string): Promise<{ data: Event[], error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:creator_id (
          id,
          email,
          display_name,
          avatar_url
        ),
        attendees:event_attendees (
          user:user_id (
            id,
            email,
            display_name,
            avatar_url
          ),
          status
        )
      `)
      .eq('group_id', groupId)
      .order('start_time', { ascending: true })

    if (error) throw error

    const formattedEvents: Event[] = events.map(event => ({
      id: event.id,
      groupId: event.group_id,
      creatorId: event.creator_id,
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.start_time,
      endTime: event.end_time,
      maxAttendees: event.max_attendees,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      creator: {
        id: event.creator.id,
        email: event.creator.email,
        displayName: event.creator.display_name,
        avatarUrl: event.creator.avatar_url
      },
      attendees: event.attendees.map((attendee: any) => ({
        id: attendee.user.id,
        email: attendee.user.email,
        displayName: attendee.user.display_name,
        avatarUrl: attendee.user.avatar_url,
        status: attendee.status
      })),
      userAttendanceStatus: event.attendees.find((a: any) => a.user.id === user.id)?.status || null
    }))

    return { data: formattedEvents, error: null }
  } catch (error) {
    console.error('Error getting events:', error)
    return { data: [], error: error as Error }
  }
}

export async function createEvent(
  groupId: string,
  data: {
    title: string
    description?: string
    location?: string
    startTime: string
    endTime: string
    maxAttendees?: number
  }
): Promise<{ data: Event | null, error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        group_id: groupId,
        creator_id: user.id,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        start_time: data.startTime,
        end_time: data.endTime,
        max_attendees: data.maxAttendees || null
      })
      .select(`
        *,
        creator:creator_id (
          id,
          email,
          display_name,
          avatar_url
        ),
        attendees:event_attendees (
          user:user_id (
            id,
            email,
            display_name,
            avatar_url
          ),
          status
        )
      `)
      .single()

    if (error) throw error

    const formattedEvent: Event = {
      id: event.id,
      groupId: event.group_id,
      creatorId: event.creator_id,
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.start_time,
      endTime: event.end_time,
      maxAttendees: event.max_attendees,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      creator: {
        id: event.creator.id,
        email: event.creator.email,
        displayName: event.creator.display_name,
        avatarUrl: event.creator.avatar_url
      },
      attendees: [],
      userAttendanceStatus: null
    }

    return { data: formattedEvent, error: null }
  } catch (error) {
    console.error('Error creating event:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateEventAttendance(
  eventId: string,
  status: EventAttendanceStatus
): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is already attending
    const { data: existingAttendance, error: checkError } = await supabase
      .from('event_attendees')
      .select()
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existingAttendance) {
      // Update existing attendance
      const { error: updateError } = await supabase
        .from('event_attendees')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', user.id)

      if (updateError) throw updateError
    } else {
      // Create new attendance
      const { error: insertError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status
        })

      if (insertError) throw insertError
    }

    return { error: null }
  } catch (error) {
    console.error('Error updating event attendance:', error)
    return { error: error as Error }
  }
} 