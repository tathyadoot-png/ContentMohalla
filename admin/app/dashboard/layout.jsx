import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixed width */}
      <aside className="w-64 bg-brown-800 text-white flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-x-auto bg-gray-50 p-6">{children}</main>
    </div>
  )
}
