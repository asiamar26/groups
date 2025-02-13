import React from 'react';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  variant?: 'default' | 'outline' | 'small';
  className?: string;
}

export default function FollowButton({
  targetUserId,
  variant = 'default',
  className = ''
}: FollowButtonProps) {
  const {
    isFollowing,
    toggleFollow,
    loading
  } = useFollowSystem({ targetUserId });

  // Base styles
  const baseStyles = 'flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  // Variant styles
  const variantStyles = {
    default: isFollowing
      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg'
      : 'bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg',
    outline: isFollowing
      ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg'
      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg',
    small: isFollowing
      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 px-3 py-1 text-sm rounded-md'
      : 'bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm rounded-md'
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isFollowing ? 'Unfollowing...' : 'Following...'}
        </>
      ) : (
        isFollowing ? 'Following' : 'Follow'
      )}
    </button>
  );
} 