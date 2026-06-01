import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Plus, LogOut, User, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useAuthStore } from '@/lib/auth'
import { getInitials, UPLOADS_BASE } from '@/lib/utils'

interface NavbarProps {
  onNewPost?: () => void
}

export function Navbar({ onNewPost }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto max-w-7xl px-4 h-full flex items-center gap-4">
        {/* Mobile drawer trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pt-10">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <MobileNav user={user} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground shrink-0">
          <img src="/uniplac-logo.png" alt="Uniplac" className="h-7 w-auto" />
          <span className="hidden sm:block">UniPauta</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9 bg-muted border-0 focus-visible:ring-1" placeholder="Buscar matérias..." />
          </div>
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button onClick={onNewPost} size="sm" className="hidden sm:flex gap-1.5">
                <Plus className="h-4 w-4" />
                Postar
              </Button>
              <Button onClick={onNewPost} size="icon" variant="default" className="sm:hidden">
                <Plus className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar_url ? `${UPLOADS_BASE}${user.avatar_url}` : undefined} />
                      <AvatarFallback>{getInitials(user?.display_name || 'U')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user?.username}`)}>
                    <User className="h-4 w-4" /> Meu perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/me/edit')}>
                    <Edit3 className="h-4 w-4" /> Editar perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function MobileNav({ user, isAuthenticated, onLogout }: { user: ReturnType<typeof useAuthStore>['user']; isAuthenticated: boolean; onLogout: () => void }) {
  const navigate = useNavigate()
  return (
    <nav className="flex flex-col gap-2">
      <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
        Início
      </Link>
      {isAuthenticated ? (
        <>
          <Link to={`/profile/${user?.username}`} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            Meu Perfil
          </Link>
          <Link to="/me/edit" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            Editar Perfil
          </Link>
          <Link to="/post/new" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            Nova Matéria
          </Link>
          <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium text-destructive text-left">
            Sair
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            Entrar
          </Link>
          <Link to="/register" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            Cadastrar
          </Link>
        </>
      )}
    </nav>
  )
}
