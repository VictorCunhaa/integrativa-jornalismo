import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { LeftSidebar, RightSidebar } from './Sidebar'

export function AppLayout() {
  const navigate = useNavigate()

  function handleNewPost() {
    navigate('/post/new')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNewPost={handleNewPost} />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_280px] gap-6">
          <aside className="hidden lg:block">
            <LeftSidebar onNewPost={handleNewPost} />
          </aside>
          <section className="min-w-0">
            <Outlet />
          </section>
          <aside className="hidden xl:block">
            <RightSidebar />
          </aside>
        </div>
      </main>
    </div>
  )
}
