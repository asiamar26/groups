"use client"

import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import { Loader2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { GroupCard } from "@/components/groups/GroupCard"
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { GroupWithMemberInfo } from "@/types/groups"

const GROUP_CATEGORIES = [
  "Study",
  "Project",
  "Research",
  "Social",
  "Sports",
  "Gaming",
  "Other",
] as const

const PRIVACY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Public", value: "public" },
  { label: "Private", value: "private" },
] as const

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithMemberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from("groups")
          .select(`
            *,
            group_members (
              user_id,
              role
            )
          `)
          .order("created_at", { ascending: false })

        if (debouncedSearchQuery) {
          query = query.ilike("name", `%${debouncedSearchQuery}%`)
        }

        if (selectedCategory) {
          query = query.eq("category", selectedCategory)
        }

        if (selectedPrivacy !== "all") {
          query = query.eq("is_private", selectedPrivacy === "private")
        }

        const { data, error } = await query

        if (error) throw error

        setGroups(data || [])
      } catch (error) {
        console.error("Error fetching groups:", error)
        toast({
          title: "Error",
          description: "Failed to load groups. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [debouncedSearchQuery, selectedCategory, selectedPrivacy, toast])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? undefined : value)
  }

  const handlePrivacyChange = (value: string) => {
    setSelectedPrivacy(value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Create Group</Button>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden gap-4 md:flex">
          <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {GROUP_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPrivacy} onValueChange={handlePrivacyChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Privacy" />
            </SelectTrigger>
            <SelectContent>
              {PRIVACY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {(selectedCategory || selectedPrivacy !== "all") && (
                  <Badge variant="secondary" className="ml-2">
                    {(selectedCategory ? 1 : 0) + (selectedPrivacy !== "all" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {GROUP_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Privacy</label>
                  <Select value={selectedPrivacy} onValueChange={handlePrivacyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIVACY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : groups.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <div className="flex h-[200px] items-center justify-center text-center">
          <div className="space-y-2">
            <p className="text-lg font-medium">No groups found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Create a group to get started"}
            </p>
          </div>
        </div>
      )}

      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
} 