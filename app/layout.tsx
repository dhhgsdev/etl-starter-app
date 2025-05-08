'use client'

import './globals.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Upload,
  Map,
  Tags,
  Settings
} from 'lucide-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showSidebar, setShowSidebar] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Upload', href: '/upload', icon: <Upload size={18} /> },
    { label: 'ETL Maps', href: '/maps', icon: <Map size={18} /> },
    { label: 'Suppliers', href: '/suppliers', icon: <Tags size={18} /> },
    { label: 'Settings', href: '/settings', icon: <Settings size={18} /> },
  ]

  return (
    <html lang="en" className="dark h-full">
      <body className="flex flex-col min-h-screen bg-background text-white">
        {/* Mobile Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-gray-700 sm:hidden">
          <span className="text-lg font-semibold">ETL App</span>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-white focus:outline-none"
          >
            ☰
          </button>
        </header>

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside
            className={`fixed z-40 top-0 left-0 h-screen w-60 bg-background border-r border-gray-700 transform transition-transform duration-200
              ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
              sm:translate-x-0 sm:relative sm:z-auto`}
          >
            <div className="hidden sm:block px-4 py-4">
              <h2 className="text-lg font-semibold text-white">ETL App</h2>
            </div>

            <nav className="flex flex-col p-4 text-sm space-y-2">
              {navItems.map(({ label, href, icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                      isActive
                        ? 'bg-[#2c2c2c] text-white border-l-4 border-red-700'
                        : 'hover:text-white'
                    }`}
                  >
                    {icon}
                    <span className="truncate">{label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {showSidebar && (
            <div
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black bg-opacity-40 z-30 sm:hidden"
            />
          )}

          {/* Main Content Wrapper to avoid border merging */}
          <div className="flex-1 bg-background min-h-screen overflow-x-auto">
            <main className="px-4 sm:px-6 py-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
