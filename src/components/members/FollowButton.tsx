import React from 'react';
import { Loader2 } from 'lucide-react';
import { useFollowSystem } from '@/hooks/useFollowSystem';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export default function FollowButton({ targetUserId, className = '' }: FollowButtonProps) {
  const {
    isFollowing,
    toggleFollow,
    loading
  } = useFollowSystem({ targetUserId });

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`
        w-[100px]
        h-[32px]
        text-sm
        font-medium 
        rounded-full 
        transition-colors
        duration-200
        inline-flex
        items-center 
        justify-center
        ${isFollowing
          ? 'bg-blue-600 text-white hover:bg-red-600 hover:border-red-600'
          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className="flex items-center justify-center w-full gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className="truncate">
          {isFollowing ? 'Following' : 'Follow'}
        </span>
      </span>
    </button>
  );
} 