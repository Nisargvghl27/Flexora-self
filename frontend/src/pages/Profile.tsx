import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Trash2, Calendar, Clock, Shield, Edit, Settings, ShoppingCart, Heart, PenTool, LogOut } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { getStorageData, getStorageKey, STORAGE_KEYS } from '../lib/storage';
import { PageTransition } from '../components/PageTransition';
import { useProfile } from '../hooks/useProfile';
import { formatPrice } from '../lib/utils';
import { apiService } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { profile, isLoading: loading, error: profileError } = useProfile();
  const error = profileError ? profileError.message : '';
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

  const defaultAvatars = [
    { id: 'avatar1', emoji: '😊', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { id: 'avatar2', emoji: '🤖', color: 'bg-gradient-to-br from-purple-400 to-purple-600' },
    { id: 'avatar3', emoji: '🦄', color: 'bg-gradient-to-br from-pink-400 to-pink-600' },
    { id: 'avatar4', emoji: '🐱', color: 'bg-gradient-to-br from-orange-400 to-orange-600' },
    { id: 'avatar5', emoji: '🦁', color: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
    { id: 'avatar6', emoji: '🐼', color: 'bg-gradient-to-br from-gray-400 to-gray-600' },
    { id: 'avatar7', emoji: '🦊', color: 'bg-gradient-to-br from-red-400 to-red-600' },
    { id: 'avatar8', emoji: '🐸', color: 'bg-gradient-to-br from-green-400 to-green-600' },
    { id: 'avatar9', emoji: '🐙', color: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
    { id: 'avatar10', emoji: '🦋', color: 'bg-gradient-to-br from-teal-400 to-teal-600' },
    { id: 'avatar11', emoji: '🦅', color: 'bg-gradient-to-br from-sky-400 to-sky-600' },
    { id: 'avatar12', emoji: '🐬', color: 'bg-gradient-to-br from-cyan-400 to-cyan-600' },
    { id: 'avatar13', emoji: '🦖', color: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
    { id: 'avatar14', emoji: '🦒', color: 'bg-gradient-to-br from-amber-400 to-amber-600' },
    { id: 'avatar15', emoji: '🦘', color: 'bg-gradient-to-br from-rose-400 to-rose-600' },
    { id: 'avatar16', emoji: '🦥', color: 'bg-gradient-to-br from-lime-400 to-lime-600' },
  ];

  const getMemberSince = () => {
    if (profile?.date_joined) return profile.date_joined;
    const memberSinceKey = user?.username ? `flexora-member-since-${user.username}` : 'flexora-member-since';
    const memberSince = localStorage.getItem(memberSinceKey);
    if (!memberSince) {
      const now = new Date().toISOString();
      localStorage.setItem(memberSinceKey, now);
      return now;
    }
    return memberSince;
  };

  const updateLastLogin = () => {
    if (!user?.username) return;
    const lastLoginKey = `flexora-last-login-${user.username}`;
    localStorage.setItem(lastLoginKey, new Date().toISOString());
  };

  const getLastLogin = () => {
    if (!user?.username) return new Date().toISOString();
    return localStorage.getItem(`flexora-last-login-${user.username}`) || new Date().toISOString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTimeAgo = (dateString: string) => {
    const diffInHours = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return formatDate(dateString);
  };

  const checkCommunityMembership = async () => {
    const userEmail = profile?.email || user?.email;
    if (!userEmail) {
      setMembershipLoading(false);
      return;
    }
    try {
      const res = await apiService.checkCommunityMember();
      setIsCommunityMember(!res.error && (res.data?.is_community_member || false));
    } catch (error) {
      setIsCommunityMember(false);
    } finally {
      setMembershipLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.username) return;
    const ordersData = getStorageData(STORAGE_KEYS.ORDERS, user.username, []);
    const favorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    setOrders(ordersData);
    setAccountStats({
      totalOrders: ordersData.length,
      totalSpent: ordersData.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
      favoriteItems: favorites.length,
      reviews: 0
    });
    updateLastLogin();
  }, [user?.username]);

  useEffect(() => {
    if (!user?.username) return;
    const savedAddressesData = getStorageData(STORAGE_KEYS.SAVED_ADDRESSES, user.username, []);
    setSavedAddresses(savedAddressesData);
    const defaultAddr = savedAddressesData.find((addr: any) => addr.isDefault) || savedAddressesData[0];
    setDefaultAddress(defaultAddr?.address || '');
  }, [user?.username]);

  useEffect(() => {
    if (profile?.email && !loading) checkCommunityMembership();
  }, [profile?.email, loading]);

  if (!user) return null;

  return (
    <PageTransition>
      <Navigation />
      <main className="flex-1 py-12 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        {error && <div className="text-center text-red-500 mb-6">{error}</div>}
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <Card className="border-border shadow-md">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-5xl font-bold text-primary-foreground shadow-lg mb-4 overflow-hidden border-4 border-background">
                  {loading ? (
                    <Skeleton className="w-full h-full rounded-full" />
                  ) : profile?.profile_picture ? (
                    <img src={profile.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : profile?.selected_avatar ? (
                    <div className={`w-full h-full flex items-center justify-center ${defaultAvatars.find(av => av.id === profile.selected_avatar)?.color}`}>
                      {defaultAvatars.find(av => av.id === profile.selected_avatar)?.emoji}
                    </div>
                  ) : (
                    profile?.username?.[0]?.toUpperCase() || <User className="w-16 h-16" />
                  )}
                </div>
                {loading ? (
                  <Skeleton className="h-6 w-32 mb-1" />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground mb-1">{profile?.username}</h2>
                )}
                <p className="text-muted-foreground text-sm">{profile?.email}</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-md">
              <CardContent className="p-4 space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4 pt-2">Menu</h3>
                <Link to="/edit-profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <Edit className="w-5 h-5 text-muted-foreground" /> Edit Profile
                </Link>
                <Link to="/cart" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <ShoppingCart className="w-5 h-5 text-muted-foreground" /> View Cart
                </Link>
                <Link to="/favorites" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <Heart className="w-5 h-5 text-muted-foreground" /> My Favorites
                </Link>
                {isCommunityMember && (
                  <Link to="/write-blog" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                    <PenTool className="w-5 h-5 text-muted-foreground" /> Write a Blog
                  </Link>
                )}
                <hr className="my-2 border-border" />
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
                <button onClick={() => navigate('/delete-account')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-5 h-5" /> Delete Account
                </button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {loading ? (
              <>
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </>
            ) : (
              <>
                {/* Account Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{accountStats.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{formatPrice(accountStats.totalSpent)}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{accountStats.favoriteItems}</p>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                  </div>
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm text-center">
                    <p className="text-3xl font-bold text-primary mb-1">{accountStats.reviews}</p>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                  </div>
                </div>

                {/* Account Information */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" /> Account Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted rounded-full">
                          <User className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Username</p>
                          <p className="font-medium text-foreground">{profile?.username}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted rounded-full">
                          <Mail className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                          <p className="font-medium text-foreground">{profile?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted rounded-full">
                          <Phone className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                          <p className="font-medium text-foreground">{profile?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted rounded-full">
                          <Calendar className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                          <p className="font-medium text-foreground">{formatDate(getMemberSince())}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Addresses */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" /> Saved Addresses
                    </CardTitle>
                    <Link to="/edit-profile" className="text-sm text-primary hover:underline font-medium">Manage</Link>
                  </CardHeader>
                  <CardContent>
                    {savedAddresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.slice(0, 2).map((address: any) => (
                          <div key={address.id} className="p-4 bg-muted rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-foreground">{address.name}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{address.address}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-muted rounded-lg border border-dashed border-border">
                        <p className="text-sm text-muted-foreground mb-3">No addresses saved</p>
                        <Link to="/edit-profile" className="text-sm text-primary font-medium hover:underline">Add your first address →</Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Past Orders */}
                {orders.length > 0 && (
                  <Card className="border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" /> Recent Orders
                      </CardTitle>
                      <button onClick={() => setShowOrders(!showOrders)} className="text-sm text-primary hover:underline font-medium">
                        {showOrders ? 'Hide Orders' : 'View All'}
                      </button>
                    </CardHeader>
                    {showOrders && (
                      <CardContent>
                        <div className="space-y-4">
                          {orders.slice(-3).reverse().map((order, index) => (
                            <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg border border-border gap-4">
                              <div>
                                <p className="font-semibold text-foreground mb-1">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(order.date)} • {order.items.length} items</p>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="font-bold text-primary mb-1">{formatPrice(order.total)}</p>
                                <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">{order.status}</span>
                              </div>
                            </div>
                          ))}
                          {orders.length > 3 && (
                            <div className="text-center pt-2">
                              <Link to="/past-orders" className="text-sm text-primary font-medium hover:underline">View {orders.length - 3} more orders →</Link>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Profile;
