
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Heart, X, ShoppingCart, Bell, Sun, Moon, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { User, Users, UserCheck, UserPlus, UserX, UserMinus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from 'next-themes';
import { getStorageData, STORAGE_KEYS } from '../lib/storage';
import { apiService } from '../services/api';
import { useProfile } from '../hooks/useProfile';
import { useCartCount } from '../hooks/useCartCount';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { products: searchResults, loading: searchLoading } = useProducts(undefined, undefined, debouncedQuery, undefined, 1, 4);
  const { user, logout } = useAuth();
  const { cartCount } = useCartCount();
  const { theme, setTheme } = useTheme();
  
  const { profile, refetchProfile } = useProfile();
  
  const profilePicture = profile?.profile_picture || '';
  const selectedAvatar = profile?.selected_avatar || '';
  const isAdmin = profile?.is_staff || profile?.is_superuser || false;

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Default avatar options
  const defaultAvatars = [
    { id: 'avatar1', emoji: '😊', color: 'bg-gradient-to-br from-blue-400 to-blue-600', name: 'Happy' },
    { id: 'avatar2', emoji: '🤖', color: 'bg-gradient-to-br from-purple-400 to-purple-600', name: 'Robot' },
    { id: 'avatar3', emoji: '🦄', color: 'bg-gradient-to-br from-pink-400 to-pink-600', name: 'Unicorn' },
    { id: 'avatar4', emoji: '🐱', color: 'bg-gradient-to-br from-orange-400 to-orange-600', name: 'Cat' },
    { id: 'avatar5', emoji: '🦁', color: 'bg-gradient-to-br from-yellow-400 to-yellow-600', name: 'Lion' },
    { id: 'avatar6', emoji: '🐼', color: 'bg-gradient-to-br from-gray-400 to-gray-600', name: 'Panda' },
    { id: 'avatar7', emoji: '🦊', color: 'bg-gradient-to-br from-red-400 to-red-600', name: 'Fox' },
    { id: 'avatar8', emoji: '🐸', color: 'bg-gradient-to-br from-green-400 to-green-600', name: 'Frog' },
    { id: 'avatar9', emoji: '🐙', color: 'bg-gradient-to-br from-indigo-400 to-indigo-600', name: 'Octopus' },
    { id: 'avatar10', emoji: '🦋', color: 'bg-gradient-to-br from-teal-400 to-teal-600', name: 'Butterfly' },
    { id: 'avatar11', emoji: '🦅', color: 'bg-gradient-to-br from-sky-400 to-sky-600', name: 'Eagle' },
    { id: 'avatar12', emoji: '🐬', color: 'bg-gradient-to-br from-cyan-400 to-cyan-600', name: 'Dolphin' },
    { id: 'avatar13', emoji: '🦕', color: 'bg-gradient-to-br from-emerald-400 to-emerald-600', name: 'Dinosaur' },
    { id: 'avatar14', emoji: '🦒', color: 'bg-gradient-to-br from-amber-400 to-amber-600', name: 'Giraffe' },
    { id: 'avatar15', emoji: '🦘', color: 'bg-gradient-to-br from-rose-400 to-rose-600', name: 'Kangaroo' },
    { id: 'avatar16', emoji: '🦥', color: 'bg-gradient-to-br from-lime-400 to-lime-600', name: 'Sloth' },
  ];

  // Fetch profile is now handled by useProfile hook

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const unreadRes = await apiService.getUnreadNotificationCount();
          if (!unreadRes.error && unreadRes.data) {
            setUnreadCount(unreadRes.data.unread_count || 0);
          }

          const notifRes = await apiService.getNotifications(5);
          if (!notifRes.error && notifRes.data) {
            setNotifications(notifRes.data.results || notifRes.data || []);
          }
        } catch (e) {
          console.error('Failed to fetch notifications', e);
        }
      }
    };
    fetchNotifications();
    
    // Poll every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      refetchProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [refetchProfile]);

  // Handle Escape key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: 'Products', path: '/products' },
    { name: 'Community', path: '/community' },
    { name: 'Designs', path: '/designs' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-medium">
        Skip to main content
      </a>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-primary/20">
                <img 
                  src="/flexora-logo.png" 
                  alt="FLEXORA Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-foreground tracking-wide">
                  FLEXORA
                </div>
                <div className="text-xs text-primary font-medium -mt-1">
                  Flex your Aura
                </div>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              {/* Theme Toggle, Notifications, Favorites, Cart */}
              <div className="flex items-center gap-2 align-middle h-full">
                
                {/* Search Toggle */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 animate-in spin-in-180" /> : <Moon className="w-5 h-5 animate-in spin-in-90" />}
                </button>

                {/* Notifications Bell (Only if logged in) */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200" aria-label="Notifications">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="flex justify-between items-center px-4 py-2 border-b">
                        <span className="font-bold">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <DropdownMenuItem key={notif.id} className={`flex flex-col items-start p-3 border-b cursor-pointer ${notif.is_read ? 'opacity-60' : 'bg-primary/5'}`} onClick={() => markAsRead(notif.id)}>
                              <span className="font-semibold text-sm">{notif.title}</span>
                              <span className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</span>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <NavLink
                  to="/favorites"
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`
                  }
                  aria-label="Favorites"
                >
                  <Heart className="w-5 h-5" />
                </NavLink>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `relative flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`
                  }
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {user && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border border-background shadow">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
              </div>
              {/* Account Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="ml-4 cursor-pointer">
                    <Avatar className="w-12 h-12 border-2 border-primary shadow-lg">
                      <AvatarImage 
                        src={profilePicture} 
                        alt={user?.username}
                        onError={(e) => {
                          console.error('Failed to load profile picture:', profilePicture);
                        }}
                        onLoad={() => {
                        }}
                        className="object-cover w-full h-full"
                      />
                      <AvatarFallback>
                        {profilePicture ? (
                          user?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />
                        ) : selectedAvatar ? (
                          <div className={`w-full h-full flex items-center justify-center ${defaultAvatars.find(av => av.id === selectedAvatar)?.color}`}>
                            {defaultAvatars.find(av => av.id === selectedAvatar)?.emoji}
                          </div>
                        ) : (
                          user?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user ? (
                    <>
                      <DropdownMenuItem disabled>Signed in as <b className="ml-1">{user.username}</b></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <NavLink to="/admin" className="text-primary font-bold">Admin Panel</NavLink>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <NavLink to="/profile">Profile</NavLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <NavLink to="/login">Login</NavLink>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <NavLink to="/signup">Sign Up</NavLink>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Main menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-sm">
            <div className="px-3 py-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-accent text-foreground rounded-lg pl-10 pr-4 py-2 border-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </form>
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            {/* Admin Panel Link for Mobile */}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200 flex items-center gap-1 text-primary`
                }
              >
                Admin Panel
              </NavLink>
            )}
          </div>
        </div>
      )}

      {/* Global Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm animate-fade-in flex flex-col items-center pt-32 px-4">
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-accent text-foreground hover:bg-primary/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full max-w-3xl animate-scale-in">
            <h2 className="text-3xl font-display font-bold mb-6 text-center">What are you looking for?</h2>
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-4 py-4 md:text-xl border-b-2 border-border bg-transparent focus:border-primary outline-none transition-colors"
                placeholder="Search for dresses, tops, collections..."
              />
            </form>
            
            <div className="mt-8 flex flex-wrap gap-2 justify-center text-sm">
              <span className="text-muted-foreground mt-1">Popular:</span>
              {['Summer Collection', 'Dresses', 'Activewear', 'Accessories'].map(term => (
                <button 
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    navigate(`/products?search=${encodeURIComponent(term)}`);
                    setIsSearchOpen(false);
                  }}
                  className="px-3 py-1 rounded-full bg-accent hover:bg-primary/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Live Search Results */}
            {debouncedQuery.trim() && (
              <div className="mt-8 bg-card rounded-xl border border-border shadow-lg p-4 overflow-hidden">
                {searchLoading ? (
                  <div className="flex justify-center p-4"><span className="text-muted-foreground">Searching...</span></div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground px-2">Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.map((product) => (
                        <NavLink
                          key={product.id}
                          to={`/products/${product.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-16 h-16 rounded-md object-cover" onError={e => { e.currentTarget.src = '/placeholder.svg'; }} />
                          <div>
                            <p className="font-semibold text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-sm text-primary">{formatPrice(product.price)}</p>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                    <div className="pt-4 text-center border-t border-border">
                      <button
                        onClick={handleSearch}
                        className="text-primary hover:underline text-sm font-semibold"
                      >
                        View all results for "{debouncedQuery}"
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    No results found for "{debouncedQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navigation;
