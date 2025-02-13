'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

interface EventsProps {
  groupId: string
}

export function Events({ groupId }: EventsProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-6">
      {/* Create Event Button */}
      <div className="flex justify-end">
        <Button>
          Create Event
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {/* Upcoming Events */}
        <div>
          <h3 className="font-medium mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {/* Sample Event Card */}
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Date Box */}
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                    <span className="text-2xl font-bold text-primary">15</span>
                    <span className="text-sm text-primary">Mar</span>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h4 className="font-medium">Monthly Meetup</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Join us for our monthly community gathering where we'll discuss upcoming projects and share updates.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>6:00 PM - 8:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Community Center</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>12 attending</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/groups/${groupId}/events/1`}>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h3 className="font-medium mb-4">Past Events</h3>
          <div className="space-y-4">
            {/* Sample Past Event */}
            <Card className="p-4 opacity-75">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Date Box */}
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted rounded-lg">
                    <span className="text-2xl font-bold">01</span>
                    <span className="text-sm">Feb</span>
                  </div>

                  {/* Event Details */}
                  <div>
                    <h4 className="font-medium">Project Workshop</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      A hands-on workshop where we collaborated on various projects and shared knowledge.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>2:00 PM - 5:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Tech Hub</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>18 attended</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/groups/${groupId}/events/2`}>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 