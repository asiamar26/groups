import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Upload, Globe, Lock, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createGroup } from '@/lib/groups'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const groupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  privacy: z.enum(['public', 'private', 'secret']),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  coverImage: z.string().optional()
})

type FormData = z.infer<typeof groupSchema>

const CATEGORIES = [
  'Technology',
  'Gaming',
  'Art',
  'Music',
  'Sports',
  'Education',
  'Business',
  'Entertainment',
  'Science',
  'Health',
  'Travel',
  'Food',
  'Fashion',
  'Photography',
  'Books',
  'Movies',
  'Pets',
  'Fitness',
  'DIY',
  'Other',
]

export function CreateGroupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<string>('')
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      privacy: 'public',
      categories: [],
      coverImage: ''
    }
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Here you would typically upload to your storage service
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file)
      setCoverImage(url)
      form.setValue('coverImage', url)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      console.error('Error uploading image:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const result = await createGroup({
        name: data.name,
        description: data.description,
        privacy: data.privacy,
        categories: data.categories,
        coverImage: data.coverImage || null
      })
      
      if (result.error) throw result.error
      
      toast({
        title: "Success",
        description: "Group created successfully!"
      })
      onSuccess?.()
    } catch (error) {
      console.error('Error creating group:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create group",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8">
        {/* Cover Image Upload */}
        <div className="space-y-2">
          <FormLabel>Cover Image</FormLabel>
          <div className="flex items-center gap-4">
            {coverImage ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => {
                    setCoverImage('')
                    form.setValue('coverImage', '')
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <label
                  htmlFor="cover-image"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG or GIF (MAX. 2MB)
                    </p>
                  </div>
                  <input
                    id="cover-image"
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Group Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormDescription>
                Choose a unique and descriptive name for your group
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what your group is about..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a clear description to help others understand the purpose of your group
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Privacy Setting */}
        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select privacy setting" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-xs text-muted-foreground">Anyone can see and join</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="private" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-xs text-muted-foreground">Members must be approved</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="secret" className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Secret</div>
                      <div className="text-xs text-muted-foreground">Hidden from search, invite-only</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose who can see and join your group
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categories */}
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={field.value.includes(category) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const newCategories = field.value.includes(category)
                        ? field.value.filter((c) => c !== category)
                        : [...field.value, category]
                      field.onChange(newCategories)
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <FormDescription>
                Select categories that best describe your group (at least one)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sticky bottom-0 flex justify-end mt-8 pt-4 border-t bg-background">
          <Button 
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto min-w-[200px]",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Group...
              </>
            ) : (
              'Create Group'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 