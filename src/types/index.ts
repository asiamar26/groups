export interface User {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  skills: string[];
  languages: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  memberCount: number;
  banner?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  groupId: string;
  attachments?: string[];
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
} 