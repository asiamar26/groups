import React from 'react';
import Link from 'next/link';
import { useGroup } from '@/contexts/GroupContext';
import { Group } from '@/utils/groups';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface GroupCardProps {
  group: Group;
  onJoin: (groupId: string) => Promise<void>;
  onLeave: (groupId: string) => Promise<void>;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, onLeave }) => {
  const { user } = useAuth();
  const isMember = group.member_count > 0; // This is a simplification, you should check actual membership

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/groups/${group.id}`} className="hover:underline">
            <h3 className="text-lg font-semibold">{group.name}</h3>
          </Link>
          <p className="text-sm text-gray-500">{group.description}</p>
        </div>
        <Badge variant={group.privacy === 'public' ? 'secondary' : 'outline'}>
          {group.privacy}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
          </span>
          {group.categories?.map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
        </div>
        
        {user && (
          <Button
            variant={isMember ? 'outline' : 'default'}
            onClick={() => isMember ? onLeave(group.id) : onJoin(group.id)}
          >
            {isMember ? 'Leave' : 'Join'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export function GroupList() {
  const { groups, isLoading, error, joinGroup, leaveGroup } = useGroup();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading groups: {error.message}</p>
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No groups found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onJoin={joinGroup}
          onLeave={leaveGroup}
        />
      ))}
    </div>
  );
} 