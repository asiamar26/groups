export type PostVisibility = 'public' | 'private' | 'group';
export type PostType = 'text' | 'image' | 'link' | 'video';
export type MemberRole = 'member' | 'moderator' | 'admin';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  position: string | null;
  company: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  about: string | null;
  followers_count: number;
  following_count: number;
  groups_count: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  group_id: string | null;
  post_type: PostType;
  visibility: PostVisibility;
  metadata: Record<string, any>;
  attachments: string[];
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'invite';
  categories: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  cover_image: string | null;
  member_count: number;
  last_activity_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'pending' | 'blocked';
  joined_at: string;
}

export interface GroupRole {
  group_id: string;
  user_id: string;
  role: MemberRole;
  granted_by: string | null;
  granted_at: string;
}

export interface Follower {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  operation: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  changed_by: string | null;
  changed_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'group_join_approved' | 'group_join_rejected' | 'group_invite' | 'group_role_change';
  title: string;
  message: string;
  group_id: string;
  read: boolean;
  created_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'followers_count' | 'following_count' | 'groups_count'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Post, 'id' | 'created_at' | 'updated_at'>>;
      };
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          privacy: 'public' | 'private'
          categories: string[] | null
          cover_image: string | null
          member_count: number
          created_by: string | null
          created_at: string
          updated_at: string
          last_activity_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          privacy?: 'public' | 'private'
          categories?: string[] | null
          cover_image?: string | null
          member_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          privacy?: 'public' | 'private'
          categories?: string[] | null
          cover_image?: string | null
          member_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_activity_at?: string
        }
      };
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'member' | 'admin' | 'moderator'
          status: 'pending' | 'active' | 'blocked'
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'member' | 'admin' | 'moderator'
          status?: 'pending' | 'active' | 'blocked'
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'member' | 'admin' | 'moderator'
          status?: 'pending' | 'active' | 'blocked'
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      };
      group_roles: {
        Row: GroupRole;
        Insert: Omit<GroupRole, 'granted_at'>;
        Update: Partial<Omit<GroupRole, 'group_id' | 'user_id' | 'granted_at'>>;
      };
      followers: {
        Row: Follower;
        Insert: Omit<Follower, 'created_at'>;
        Update: never;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: never;
        Update: never;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      follow_user: {
        Args: { _follower_id: string; _following_id: string };
        Returns: {
          success: boolean;
          error?: string;
          data?: {
            follower: { id: string; following_count: number };
            following: { id: string; followers_count: number };
          };
        };
      };
      unfollow_user: {
        Args: { _follower_id: string; _following_id: string };
        Returns: {
          success: boolean;
          error?: string;
          data?: {
            follower: { id: string; following_count: number };
            following: { id: string; followers_count: number };
          };
        };
      };
      get_follow_status: {
        Args: { _user_id: string; _target_id: string };
        Returns: {
          success: boolean;
          error?: string;
          data?: {
            is_following: boolean;
            counts: {
              followers: number;
              following: number;
            };
          };
        };
      };
    };
    Enums: {
      post_visibility: PostVisibility;
      post_type: PostType;
      member_role: MemberRole;
    };
  };
}; 