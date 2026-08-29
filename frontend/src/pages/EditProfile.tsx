import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { Upload, X, User, Users, UserCheck, UserPlus, UserX, UserMinus } from 'lucide-react';
import Suggestions from '../components/Suggestions';
import AddressManager from '../components/AddressManager';

const EditProfile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    accountType: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showAddressManager, setShowAddressManager] = useState(true);

  // Default avatar options - Beautiful cartoon and modern avatars
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

  // Account type options
  const accountTypes = [
    { value: '', label: 'Select account type (optional)' },
    { value: 'student', label: 'Student' },
    { value: 'professional', label: 'Professional' },
    { value: 'fashion_enthusiast', label: 'Fashion Enthusiast' },
    { value: 'influencer', label: 'Influencer' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'other', label: 'Other' }
  ];

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
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const text = await res.text();
        let data: any = {};
        try { if (text) data = JSON.parse(text); } catch (_) {}
        setForm({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          accountType: data.account_type || ''
        });
        if (data.profile_picture) {
          setCurrentProfilePicture(data.profile_picture);
        }
        if (data.selected_avatar) {
          setSelectedAvatar(data.selected_avatar);
        }
      } catch (err: any) {
        setError(err.message || 'Error loading profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview('');
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setShowAvatarSelector(false);
    // Clear any uploaded profile picture when selecting default avatar
    setProfilePicture(null);
    setProfilePicturePreview('');
  };

  const clearAvatarSelection = () => {
    setSelectedAvatar('');
    setProfilePicture(null);
    setProfilePicturePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      if (selectedAvatar) {
        formData.append('selected_avatar', selectedAvatar);
      }
      if (form.accountType) {
        formData.append('account_type', form.accountType);
      }
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        let data: any = {};
        try { if (text) data = JSON.parse(text); } catch (_) {}
        throw new Error(data.error || 'Failed to update profile');
      }
      // Update AuthContext and localStorage if username changed
      if (form.username && form.username !== user.username) {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        login(form.username, accessToken, refreshToken);
      }
      setSuccess('Profile updated successfully!');
      
      // Dispatch custom event to update navbar profile picture
      window.dispatchEvent(new CustomEvent('profile-updated'));
      
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    }
    setLoading(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const token = localStorage.getItem('accessToken');
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/change-password/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });
      const text = await res.text();
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch (_) {}
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPasswordError(err.message || 'Error changing password');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-lg shadow-2xl border-2 border-primary/20">
          <CardHeader className="flex flex-col items-center gap-2 bg-primary/10 rounded-t-lg pb-6">
            <CardTitle className="text-2xl font-bold text-primary mb-1">Edit Profile</CardTitle>
            <div className="text-muted-foreground text-sm">Update your information</div>
          </CardHeader>
          <CardContent className="py-8 px-6">
            {loading ? (
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground overflow-hidden">
                      {profilePicturePreview ? (
                        <img 
                          src={profilePicturePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : currentProfilePicture ? (
                        <img 
                          src={currentProfilePicture} 
                          alt="Current Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : selectedAvatar ? (
                        <div className={`w-full h-full flex items-center justify-center ${defaultAvatars.find(av => av.id === selectedAvatar)?.color}`}>
                          {defaultAvatars.find(av => av.id === selectedAvatar)?.emoji}
                        </div>
                      ) : (
                        form.username?.[0]?.toUpperCase() || <User className="w-8 h-8" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                          id="profile-picture"
                        />
                        <label
                          htmlFor="profile-picture"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Photo
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/90 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          Choose Avatar
                        </button>
                      </div>
                      {(profilePicture || selectedAvatar) && (
                        <button
                          type="button"
                          onClick={clearAvatarSelection}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:bg-destructive/90 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Avatar Selector */}
                  {showAvatarSelector && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <h4 className="text-sm font-medium text-foreground mb-3">Choose Your Avatar</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {defaultAvatars.map((avatar) => (
                          <button
                            key={avatar.id}
                            type="button"
                            onClick={() => handleAvatarSelect(avatar.id)}
                            className={`w-12 h-12 rounded-full ${avatar.color} flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg ${
                              selectedAvatar === avatar.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                            }`}
                            title={avatar.name}
                          >
                            <span className="text-lg">{avatar.emoji}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground text-center">
                        Click on any avatar to select it
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="address" className="block text-sm font-medium text-foreground">
                      Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddressManager(!showAddressManager)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showAddressManager ? 'Use Address Suggestions' : 'Manage Addresses'}
                    </button>
                  </div>
                  
                  {showAddressManager ? (
                    <AddressManager
                      selectedAddress={form.address}
                      onAddressSelect={(address) => setForm({ ...form, address })}
                      onAddressesChange={() => {}}
                      className="mb-4"
                    />
                  ) : (
                    <>
                      <Suggestions
                        value={form.address}
                        onChange={(address) => setForm({ ...form, address })}
                        placeholder="Start typing your address for suggestions..."
                        className="w-full"
                        type="address"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Type at least 3 characters to see address suggestions
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <label htmlFor="accountType" className="block text-sm font-medium text-foreground mb-1">
                    Account Type
                  </label>
                  <select
                    id="accountType"
                    value={form.accountType}
                    onChange={(e) => { setForm({ ...form, accountType: e.target.value }); setError(''); setSuccess(''); }}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {accountTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">This helps us personalize your experience</p>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                {success && <div className="text-green-600 text-sm text-center">{success}</div>}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}
            <hr className="my-8" />
            {!showPasswordForm ? (
              <button
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors mb-4"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            ) : (
              <div>
                <div className="mb-4 text-lg font-semibold text-primary">Change Password</div>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-foreground mb-1">Current Password</label>
                    <input
                      id="current_password"
                      name="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-foreground mb-1">New Password</label>
                    <input
                      id="new_password"
                      name="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  {passwordError && <div className="text-red-500 text-sm text-center">{passwordError}</div>}
                  {passwordSuccess && <div className="text-green-600 text-sm text-center">{passwordSuccess}</div>}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      className="w-full py-2 px-4 bg-muted text-foreground rounded-md font-semibold hover:bg-accent transition-colors"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 items-center pb-8">
            <button
              onClick={() => navigate('/profile')}
              className="w-40 py-2 px-4 bg-muted text-foreground rounded-md font-semibold hover:bg-accent transition-colors shadow"
            >
              Cancel
            </button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile; 