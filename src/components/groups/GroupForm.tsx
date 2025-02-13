import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGroup } from '@/contexts/GroupContext';
import { GroupPrivacy } from '@/utils/groups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const groupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private'] as const),
  categories: z.string().optional(),
  coverImage: z.string().url().optional(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface GroupFormProps {
  groupId?: string;
  defaultValues?: Partial<GroupFormValues>;
  onSuccess?: () => void;
}

export function GroupForm({ groupId, defaultValues, onSuccess }: GroupFormProps) {
  const { createGroup, updateGroup } = useGroup();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      privacy: 'public',
      categories: '',
      coverImage: '',
      ...defaultValues,
    },
  });

  const onSubmit = async (values: GroupFormValues) => {
    try {
      if (groupId) {
        await updateGroup(groupId, {
          name: values.name,
          description: values.description || null,
          privacy: values.privacy,
          categories: values.categories ? values.categories.split(',').map(c => c.trim()) : null,
          coverImage: values.coverImage || null,
        });
      } else {
        await createGroup(
          values.name,
          values.description,
          values.privacy
        );
      }
      onSuccess?.();
      form.reset();
    } catch (error) {
      console.error('Error submitting group form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormDescription>
                Choose a unique name for your group
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your group"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a brief description of your group's purpose
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Control who can see and join your group
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter categories (comma-separated)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add categories to help others find your group
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter cover image URL"
                  type="url"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add a cover image for your group (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {groupId ? 'Update Group' : 'Create Group'}
        </Button>
      </form>
    </Form>
  );
} 