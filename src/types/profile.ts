export interface Education {
  degree: string
  field: string
  school: string
  year?: number
  start_date?: string
  end_date?: string
  description?: string
}

export interface WorkExperience {
  company: string
  position: string
  start_date: string
  end_date?: string
  description?: string
  location?: string
}

export interface SocialLink {
  platform: string
  url: string
  username?: string
}

export interface Profile {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string | null
  avatar_url: string | null
  website: string | null
  bio: string | null
  phone: string | null
  city: string | null
  state: string | null
  country: string | null
  company: string | null
  position: string | null
  timezone: string | null
  languages: string[]
  skills: string[]
  education: Education[]
  work_experience: WorkExperience[]
  social_links: Record<string, SocialLink>
  interests: string[] | null
  followers_count: number
  following_count: number
  groups_count: number
  last_seen: string | null
  created_at: string
  updated_at: string
  location: string | null
  occupation: string | null
  date_of_birth: string | null
}

export interface ProfileUpdateInput {
  username?: string
  first_name?: string
  last_name?: string
  email?: string | null
  avatar_url?: string | null
  website?: string | null
  bio?: string | null
  phone?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  company?: string | null
  position?: string | null
  timezone?: string | null
  languages?: string[]
  skills?: string[]
  education?: Education[]
  work_experience?: WorkExperience[]
  social_links?: Record<string, SocialLink>
  interests?: string[] | null
  location?: string | null
  occupation?: string | null
  date_of_birth?: string | null
}

export interface ProfileResponse {
  data: Profile | null
  error: Error | null
}

export interface ProfileCounts {
  followers_count: number
  following_count: number
  groups_count: number
} 