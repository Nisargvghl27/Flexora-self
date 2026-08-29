
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Heart, X, ShoppingCart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { User, Users, UserCheck, UserPlus, UserX, UserMinus } from 'lucide-react';
import { useAuth } from '../App';
import { getStorageData, STORAGE_KEYS } from '../lib/storage';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [lookbookPersona, setLookbookPersona] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    const updateCartCount = () => {
      if (!user?.username) return;
      
      const cart = getStorageData(STORAGE_KEYS.CART, user.username, []);
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [user?.username]);

  // Fetch profile picture when user is logged in
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            console.log('No access token found');
            return;
          }
          
          const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
          const res = await fetch(`${baseURL}/api/profile/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (res.ok) {
            const text = await res.text();
            let data: any = {};
            try { if (text) data = JSON.parse(text); } catch (_) {}
            console.log('Profile data received:', data);
            if (data.profile_picture) {
              console.log('Setting profile picture:', data.profile_picture);
              setProfilePicture(data.profile_picture);
            } else {
              console.log('No profile picture found in response');
              setProfilePicture('');
            }
            if (data.selected_avatar) {
              setSelectedAvatar(data.selected_avatar);
            } else {
              setSelectedAvatar('');
            }
            if (data.is_staff || data.is_superuser) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } else {
            console.error('Failed to fetch profile:', res.status);
            setProfilePicture('');
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
          setProfilePicture('');
        }
      } else {
        setProfilePicture('');
      }
    };

    fetchProfilePicture();
  }, [user]);

  // Debug: Log current profile picture state
  useEffect(() => {
    console.log('Current profile picture state:', profilePicture);
  }, [profilePicture]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        // Refetch profile picture when profile is updated
        const fetchProfilePicture = async () => {
          try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const res = await fetch(`${baseURL}/api/profile/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (res.ok) {
              const text = await res.text();
              let data: any = {};
              try { if (text) data = JSON.parse(text); } catch (_) {}
              if (data.profile_picture) {
                setProfilePicture(data.profile_picture);
              }
              if (data.is_staff || data.is_superuser) {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }
            }
          } catch (error) {
            console.error('Error refetching profile picture:', error);
          }
        };
        
        fetchProfilePicture();
      }
    };

    // Listen for custom event when profile is updated
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user]);

  // Lookbook persona from localStorage
  useEffect(() => {
    setLookbookPersona(localStorage.getItem('flexora-last-persona'));
    const onStorage = () => setLookbookPersona(localStorage.getItem('flexora-last-persona'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Trending', path: '/trending-looks' },
    { name: 'Categories', path: '/style-categories' },
    { name: 'Spotlights', path: '/student-spotlights' },
    { name: 'Collections', path: '/collections' },
    { name: 'Products', path: '/products' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
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

              {/* Lookbook Button */}
              {lookbookPersona ? (
                <NavLink
                  to={`/lookbook/${lookbookPersona}`}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-accent-foreground hover:text-primary hover:bg-accent'
                    }`
                  }
                >
                  <span role="img" aria-label="lookbook">✨</span> Your Lookbook
                </NavLink>
              ) : (
                <NavLink
                  to="/quiz"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 flex items-center gap-1 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-accent-foreground hover:text-primary hover:bg-accent'
                    }`
                  }
                >
                  <span role="img" aria-label="quiz">📝</span> Take the Quiz
                </NavLink>
              )}

              {/* Favorites Heart Icon */}
              <div className="flex items-center gap-4 align-middle h-full">
                <NavLink
                  to="/favorites"
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
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
                    `relative flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`
                  }
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
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
                          setProfilePicture('');
                        }}
                        onLoad={() => {
                          console.log('Profile picture loaded successfully:', profilePicture);
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
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
              aria-expanded="false"
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
            {/* Lookbook Button Mobile */}
            {lookbookPersona ? (
              <NavLink
                to={`/lookbook/${lookbookPersona}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200 flex items-center gap-1 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-accent-foreground hover:text-primary hover:bg-accent'
                  }`
                }
              >
                <span role="img" aria-label="lookbook">✨</span> Your Lookbook
              </NavLink>
            ) : (
              <NavLink
                to="/quiz"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200 flex items-center gap-1 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-accent-foreground hover:text-primary hover:bg-accent'
                  }`
                }
              >
                <span role="img" aria-label="quiz">📝</span> Take the Quiz
              </NavLink>
            )}
            {/* Mobile Favorites and Cart Links */}
            <div className="flex items-center gap-2">
              <NavLink
                to="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
                aria-label="Favorites"
              >
                <Heart className="w-5 h-5" />
                Favorites
              </NavLink>
              <NavLink
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`
                }
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
              </NavLink>
            </div>
            {/* Mobile Account Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="ml-4 cursor-pointer">
                  <Avatar className="w-12 h-12 border-2 border-primary shadow-lg">
                    <AvatarImage 
                      src={profilePicture} 
                      alt={user?.username}
                      onError={(e) => {
                        console.error('Failed to load profile picture (mobile):', profilePicture);
                        setProfilePicture('');
                      }}
                      onLoad={() => {
                        console.log('Profile picture loaded successfully (mobile):', profilePicture);
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
                    <DropdownMenuItem disabled>Signed in as <b>{user.username}</b></DropdownMenuItem>
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
      )}
    </nav>
  );
};

export default Navigation;