import { Lock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Tag {
  id: number
  slug: string
  label: string
}

interface ProfileSidebarProps {
  interests: Tag[]
  postEditorias?: Tag[]
}

export function ProfileSidebar({ interests, postEditorias = [] }: ProfileSidebarProps) {
  // Show user-defined interests first; fall back to editorias derived from posts
  const tags = interests.length > 0 ? interests : postEditorias

  return (
    <div className="space-y-4">
      {/* Interests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Interesses</CardTitle>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/?editoria=${tag.slug}`}
                  className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-sky-100 hover:text-sky-700 transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum interesse cadastrado.</p>
          )}
        </CardContent>
      </Card>

      {/* Groups — placeholder */}
      <Card className="opacity-70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Grupos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" />
            <span className="text-xs">Em breve</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
