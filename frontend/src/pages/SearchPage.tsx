import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, User2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PostCard } from '@/components/posts/PostCard'
import { useSearch, type UserSearchResult } from '@/hooks/useSearch'
import { getInitials, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS, UPLOADS_BASE } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

function ProfileCard({ profile }: { profile: UserSearchResult }) {
  const accountLabel = ACCOUNT_TYPE_LABELS[profile.account_type as keyof typeof ACCOUNT_TYPE_LABELS] ?? profile.account_type
  const accountColor = ACCOUNT_TYPE_COLORS[profile.account_type as keyof typeof ACCOUNT_TYPE_COLORS] ?? ''
  return (
    <Link
      to={`/profile/${profile.username}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={profile.avatar_url ? `${UPLOADS_BASE}${profile.avatar_url}` : undefined} />
        <AvatarFallback>{getInitials(profile.display_name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate">{profile.display_name}</span>
          <Badge variant="outline" className={`text-xs shrink-0 ${accountColor}`}>
            {accountLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
        {profile.bio && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{profile.bio}</p>
        )}
      </div>
    </Link>
  )
}

function ProfileSkeletons() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-11 w-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PostSkeletons() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(q)

  const { data, isLoading } = useSearch(q)

  const profiles = data?.profiles ?? []
  const posts = data?.posts ?? []
  const hasResults = profiles.length > 0 || posts.length > 0
  const noResults = !isLoading && q.trim().length > 0 && !hasResults

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Search input (visible on mobile / refine on any size) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 h-10"
          placeholder="Buscar perfis e matérias..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>

      {/* No query yet */}
      {!q.trim() && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Search className="h-10 w-10 opacity-30" />
          <p className="text-sm">Digite algo para buscar perfis e matérias</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && q.trim() && (
        <>
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pessoas</h2>
            <ProfileSkeletons />
          </section>
          <Separator />
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Matérias</h2>
            <PostSkeletons />
          </section>
        </>
      )}

      {/* No results */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <User2 className="h-10 w-10 opacity-30" />
          <p className="text-sm">
            Nenhum resultado encontrado para <span className="font-semibold text-foreground">"{q}"</span>
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && hasResults && (
        <>
          {/* Profiles section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Pessoas {data && data.total_profiles > 0 && <span className="font-normal normal-case">({data.total_profiles})</span>}
            </h2>
            {profiles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 px-3">Nenhum perfil encontrado.</p>
            ) : (
              <div className="space-y-1">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Posts section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Matérias {data && data.total_posts > 0 && <span className="font-normal normal-case">({data.total_posts})</span>}
            </h2>
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 px-3">Nenhuma matéria encontrada.</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
