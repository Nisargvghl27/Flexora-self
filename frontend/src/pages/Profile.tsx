import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { useAuth } from '../App';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Trash2, Users, UserCheck, UserPlus, UserX, UserMinus, Calendar, Clock, Shield, Edit, Settings, ShoppingCart, Heart, PenTool } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import AddressManager from '../components/AddressManager';
import { getStorageData, getStorageKey, STORAGE_KEYS } from '../lib/storage';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accountStats, setAccountStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteItems: 0,
    reviews: 0
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState('');
  const [isCommunityMember, setIsCommunityMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(true);

  // Default avatar options (same as EditProfile)
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

  // Get member since date from profile data or localStorage
  const getMemberSince = () => {
    console.log('Profile data in getMemberSince:', profile);
    console.log('Profile date_joined:', profile?.date_joined);
    
    // Use profile date_joined if available (actual signup date)
    if (profile?.date_joined) {
      console.log('Using profile date_joined:', profile.date_joined);
      return profile.date_joined;
    }
    
    // Fallback to localStorage or current date (username-specific)
    const memberSinceKey = user?.username ? `flexora-member-since-${user.username}` : 'flexora-member-since';
    const memberSince = localStorage.getItem(memberSinceKey);
    console.log('localStorage member-since:', memberSince);
    
    if (!memberSince) {
      const now = new Date().toISOString();
      localStorage.setItem(memberSinceKey, now);
      console.log('Setting new member-since:', now);
      return now;
    }
    return memberSince;
  };

  // Update last login
  const updateLastLogin = () => {
    if (!user?.username) return;
    const lastLoginKey = `flexora-last-login-${user.username}`;
    localStorage.setItem(lastLoginKey, new Date().toISOString());
  };

  // Get last login
  const getLastLogin = () => {
    if (!user?.username) return new Date().toISOString();
    const lastLoginKey = `flexora-last-login-${user.username}`;
    return localStorage.getItem(lastLoginKey) || new Date().toISOString();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format date for "time ago" display
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return formatDate(dateString);
  };

  // Check if user is a community member
  const checkCommunityMembership = async () => {
    console.log('🔍 Checking community membership for user:', user);
    console.log('🔍 Profile data:', profile);
    
    // Use profile email if available, fallback to user email
    const userEmail = profile?.email || user?.email;
    
    if (!userEmail) {
      console.log('❌ No user email found in profile or user object, skipping membership check');
      setMembershipLoading(false);
      return;
    }

    console.log('📧 User email from profile:', userEmail);

    try {
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Token exists:', !!token);
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/community-member-check/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 API Response status:', res.status);
      
      if (res.ok) {
        const text = await res.text();
        let data: any = {};
        try { if (text) data = JSON.parse(text); } catch (_) {}
        console.log('✅ API Response data:', data);
        const isMember = data.is_community_member || false;
        console.log('👤 Is community member:', isMember);
        setIsCommunityMember(isMember);
      } else {
        console.log('❌ API call failed with status:', res.status);
        const errorText = await res.text();
        console.log('❌ Error response:', errorText);
        setIsCommunityMember(false);
      }
    } catch (error) {
      console.error('💥 Error checking community membership:', error);
      setIsCommunityMember(false);
    } finally {
      setMembershipLoading(false);
    }
  };

  // Calculate account stats from localStorage
  useEffect(() => {
    if (!user?.username) {
      console.log('No user username available');
      return;
    }
    
    console.log('Loading data for user:', user.username);
    
    // Read placed orders from localStorage with username-specific key
    const ordersData = getStorageData(STORAGE_KEYS.ORDERS, user.username, []);
    const favorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    
    console.log(`Loading data for user ${user.username}:`, { ordersData, favorites });
    console.log('Storage keys being used:', {
      ordersKey: getStorageKey(STORAGE_KEYS.ORDERS, user.username),
      favoritesKey: getStorageKey(STORAGE_KEYS.FAVORITES, user.username)
    });
    
    setOrders(ordersData);
    setAccountStats({
      totalOrders: ordersData.length,
      totalSpent: ordersData.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
      favoriteItems: favorites.length,
      reviews: 0 // Placeholder for future review system
    });

    // Update last login on profile load
    updateLastLogin();
  }, [user?.username]);

  // Load saved addresses from localStorage
  useEffect(() => {
    if (!user?.username) return;
    
    const savedAddressesData = getStorageData(STORAGE_KEYS.SAVED_ADDRESSES, user.username, []);
    setSavedAddresses(savedAddressesData);
    
    // Set default address (first one or the one marked as default)
    const defaultAddr = savedAddressesData.find((addr: any) => addr.isDefault) || savedAddressesData[0];
    setDefaultAddress(defaultAddr?.address || '');
  }, [user?.username]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');
        const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const res = await fetch(`${baseURL}/api/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const text = await res.text();
        let data: any = {};
        try { if (text) data = JSON.parse(text); } catch (_) {}
        console.log('Profile data received:', data);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Error loading profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, navigate]);

  // Separate useEffect for community membership check
  useEffect(() => {
    if (profile?.email && !loading) {
      console.log('🚀 Profile email available, checking community membership');
      checkCommunityMembership();
    }
  }, [profile?.email, loading]);

  // Debug useEffect to track state changes
  useEffect(() => {
    console.log('📊 State Update - isCommunityMember:', isCommunityMember, 'membershipLoading:', membershipLoading);
  }, [isCommunityMember, membershipLoading]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-lg shadow-2xl border-2 border-primary/20">
          <CardHeader className="flex flex-col items-center gap-2 bg-primary/10 rounded-t-lg pb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg mb-2 overflow-hidden">
              {profile?.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : profile?.selected_avatar ? (
                <div className={`w-full h-full flex items-center justify-center ${defaultAvatars.find(av => av.id === profile.selected_avatar)?.color}`}>
                  {defaultAvatars.find(av => av.id === profile.selected_avatar)?.emoji}
                </div>
              ) : (
                profile?.username?.[0]?.toUpperCase() || <User className="w-12 h-12" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-primary mb-1">{profile?.username}</CardTitle>
            <div className="text-muted-foreground text-sm">Welcome to your profile page</div>
          </CardHeader>
          <CardContent className="py-8 px-6">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <div className="space-y-8">
                {/* Account Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium">{formatDate(getMemberSince())}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Last Login</p>
                        <p className="font-medium">{formatTimeAgo(getLastLogin())}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Account Status</p>
                        <p className="font-medium text-green-600">Active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Account Type</p>
                        <p className="font-medium">{profile?.account_type ? profile.account_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Username</p>
                        <p className="font-medium">{profile?.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {/* Address Section */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Addresses</p>
                        </div>
                      </div>
                      
                      {savedAddresses.length > 0 ? (
                        <div className="space-y-2">
                          {savedAddresses.slice(0, 2).map((address: any) => (
                            <div key={address.id} className="flex items-start gap-2 p-2 bg-white rounded border">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-700">{address.name}</span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{address.address}</p>
                              </div>
                            </div>
                          ))}
                          {savedAddresses.length > 2 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{savedAddresses.length - 2} more addresses
                            </p>
                          )}
                          <Link 
                            to="/edit-profile" 
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Manage all addresses →
                          </Link>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-2">No addresses saved</p>
                          <Link 
                            to="/edit-profile" 
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Add your first address →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Statistics */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    Account Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{accountStats.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">${accountStats.totalSpent.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{accountStats.favoriteItems}</p>
                      <p className="text-sm text-gray-600">Favorites</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{accountStats.reviews}</p>
                      <p className="text-sm text-gray-600">Reviews</p>
                    </div>
                  </div>
                </div>

                {/* Past Orders Section */}
                {orders.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-orange-600" />
                        Past Orders
                      </h3>
                      <button
                        onClick={() => setShowOrders(!showOrders)}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {showOrders ? 'Hide Orders' : 'View Orders'}
                      </button>
                    </div>
                    
                    {showOrders && (
                      <div className="space-y-3">
                        {orders.slice(-3).reverse().map((order, index) => (
                          <div key={order.id} className="bg-white rounded-lg p-4 border border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium text-gray-800">Order #{order.id}</p>
                                <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">${order.total.toFixed(2)}</p>
                                <p className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  {order.status}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p><strong>Items:</strong> {order.items.length} product(s)</p>
                              <p><strong>Customer:</strong> {order.customerInfo?.name}</p>
                            </div>
                          </div>
                        ))}
                        {orders.length > 3 && (
                          <div className="text-center pt-2">
                            <Link
                              to="/past-orders"
                              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                              View {orders.length - 3} more orders →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Quick Actions
                  </h3>
                  <div className={`grid grid-cols-1 ${isCommunityMember ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3`}>
                    <Link to="/edit-profile" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors">
                      <Edit className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Edit Profile</span>
                    </Link>
                    <Link to="/cart" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors">
                      <ShoppingCart className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">View Cart</span>
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors">
                      <Heart className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">My Favorites</span>
                    </Link>
                    {isCommunityMember && (
                      <Link to="/write-blog" className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors">
                        <PenTool className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Write a Blog</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 items-center pb-8">
            <button
              onClick={logout}
              className="w-40 py-2 px-4 bg-destructive text-destructive-foreground rounded-md font-semibold hover:bg-destructive/90 transition-colors shadow"
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/delete-account')}
              className="w-40 py-2 px-4 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors shadow flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile; 