import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Heart, LogOut, Menu, X, Tag, ShoppingCart, Settings, Layers, Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children, currentTab, setCurrentTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-card text-white min-h-screen">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white tracking-wider font-display">FLEXORA ADMIN</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                  currentTab === item.id 
                    ? 'bg-primary text-primary-foreground font-semibold' 
                    : 'text-muted-foreground hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 w-full px-4 py-2 text-muted-foreground hover:text-white transition-colors mb-2"
          >
            Go to Main Site
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-card text-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white tracking-wider font-display">FLEXORA ADMIN</h2>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg transition-colors ${
                      currentTab === item.id 
                        ? 'bg-primary text-primary-foreground font-semibold' 
                        : 'text-muted-foreground hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-muted-foreground hover:text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-lg">{navItems.find(i => i.id === currentTab)?.label}</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex bg-card border-b border-border px-8 py-4 items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{navItems.find(i => i.id === currentTab)?.label}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Admin: {user?.username}</span>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
