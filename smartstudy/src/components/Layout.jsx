import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from './ToastContainer';

export default function Layout({
  children,
  currentPage,
  setPage,
  collapsed,
  setCollapsed,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentPage={currentPage}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main area — push right on desktop based on sidebar width */}
      <div
        className={`
          flex-1 flex flex-col min-w-0 min-h-screen
          transition-all duration-200
          ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}
        `}
      >
        <Topbar
          currentPage={currentPage}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
