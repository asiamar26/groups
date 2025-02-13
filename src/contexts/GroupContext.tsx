import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as groupService from '@/utils/groups';
import type { Group, GroupMember, GroupPrivacy, MemberRole, MemberStatus } from '@/utils/groups';

interface GroupContextType {
  groups: Group[];
  currentGroup: Group | null;
  groupMembers: GroupMember[];
  isLoading: boolean;
  error: Error | null;
  loadGroups: () => Promise<void>;
  loadGroup: (groupId: string) => Promise<void>;
  loadGroupMembers: (groupId: string) => Promise<void>;
  createGroup: (name: string, description?: string, privacy?: GroupPrivacy) => Promise<void>;
  updateGroup: (groupId: string, updates: { name?: string; description?: string | null; privacy?: GroupPrivacy; categories?: string[] | null; cover_image?: string | null }) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  updateMemberRole: (groupId: string, userId: string, role: MemberRole) => Promise<void>;
  updateMemberStatus: (groupId: string, userId: string, status: MemberStatus) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await groupService.getGroups();
      if (error) throw error;
      setGroups(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGroup = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await groupService.getGroup(groupId);
      if (error) throw error;
      setCurrentGroup(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGroupMembers = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await groupService.getGroupMembers(groupId);
      if (error) throw error;
      setGroupMembers(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (name: string, description?: string, privacy?: GroupPrivacy) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await groupService.createGroup({ name, description, privacy });
      if (error) throw error;
      setGroups(prev => [...prev, data!]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGroup = useCallback(async (groupId: string, updates: { name?: string; description?: string | null; privacy?: GroupPrivacy; categories?: string[] | null; cover_image?: string | null }) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await groupService.updateGroup(groupId, updates);
      if (error) throw error;
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...data } : g));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(prev => prev ? { ...prev, ...data } : prev);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup?.id]);

  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await groupService.deleteGroup(groupId);
      if (error) throw error;
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup?.id]);

  const joinGroup = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await groupService.joinGroup(groupId);
      if (error) throw error;
      await loadGroups();
      if (currentGroup?.id === groupId) {
        await loadGroupMembers(groupId);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups, loadGroupMembers, currentGroup?.id]);

  const leaveGroup = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await groupService.leaveGroup(groupId);
      if (error) throw error;
      await loadGroups();
      if (currentGroup?.id === groupId) {
        await loadGroupMembers(groupId);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadGroups, loadGroupMembers, currentGroup?.id]);

  const updateMemberRole = useCallback(async (groupId: string, userId: string, role: MemberRole) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await groupService.updateMemberRole(groupId, userId, role);
      if (error) throw error;
      if (currentGroup?.id === groupId) {
        await loadGroupMembers(groupId);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadGroupMembers, currentGroup?.id]);

  const updateMemberStatus = useCallback(async (groupId: string, userId: string, status: MemberStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await groupService.updateMemberStatus(groupId, userId, status);
      if (error) throw error;
      if (currentGroup?.id === groupId) {
        await loadGroupMembers(groupId);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [loadGroupMembers, currentGroup?.id]);

  useEffect(() => {
    if (user) {
      loadGroups();
    } else {
      setGroups([]);
      setCurrentGroup(null);
      setGroupMembers([]);
    }
  }, [user, loadGroups]);

  const value = {
    groups,
    currentGroup,
    groupMembers,
    isLoading,
    error,
    loadGroups,
    loadGroup,
    loadGroupMembers,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    updateMemberRole,
    updateMemberStatus,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
} 