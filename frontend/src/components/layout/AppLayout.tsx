import { Outlet, useOutletContext, useMatch } from 'react-router-dom'
import { useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { LeftSidebar, RightSidebar } from './Sidebar'

type LayoutContext = {
  setRightPanel: (node: ReactNode) => void
  clearRightPanel: () => void
}

export function useLayoutContext() {
  return useOutletContext<LayoutContext>()
}

export function AppLayout() {
  const navigate = useNavigate()
  const [rightPanel, setRightPanelState] = useState<ReactNode>(null)
  const isHome = useMatch('/')

  function handleNewPost() {
    navigate('/post/new')
  }

  const context: LayoutContext = {
    setRightPanel: (node) => setRightPanelState(node),
    clearRightPanel: () => setRightPanelState(null),
  }

  const showRightColumn = !!isHome || !!rightPanel

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNewPost={handleNewPost} />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        <div className={`grid grid-cols-1 gap-6 ${showRightColumn ? 'lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_280px]' : 'lg:grid-cols-[250px_1fr]'}`}>
          <aside className="hidden lg:block">
            <LeftSidebar onNewPost={handleNewPost} />
          </aside>
          <section className="min-w-0">
            <Outlet context={context} />
          </section>
          {showRightColumn && (
            <aside className="hidden xl:block">
              {rightPanel ?? <RightSidebar />}
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}
