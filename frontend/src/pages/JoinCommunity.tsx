import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Button } from '../components/ui/button';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const JoinCommunity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    website: '',
    fashionInterest: '',
    whatBringsYouHere: '',
    bio: '',
    location: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fashionInterests = [
    'Streetwear',
    'Vintage',
    'Minimalist',
    'Bohemian',
    'Formal/Elegant',
    'Casual',
    'Sustainable Fashion',
    'High Fashion',
    'Street Style',
    'Other'
  ];

  const whatBringsYouHere = [
    'Discover new styles',
    'Connect with fashion community',
    'Showcase my designs',
    'Learn about fashion trends',
    'Find inspiration',
    'Network with students',
    'Support student designers',
    'Other'
  ];

  // Check authentication on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch user profile data and check membership status
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setLoadingProfile(true);
      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch user profile
        const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
        const profileResponse = await fetch(`${baseURL}/api/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (profileResponse.ok) {
          const text = await profileResponse.text();
          let profileData: any = {};
          try { if (text) profileData = JSON.parse(text); } catch (_) {}
          setUserProfile(profileData);
          
          // Auto-fill form with user data
          setFormData(prev => ({
            ...prev,
            name: profileData.username || '',
            email: profileData.email || '',
            phone: profileData.phone || ''
          }));
        }
        
        // Check if user is already a community member
        
        const membershipResponse = await fetch(`${baseURL}/api/join-community/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (membershipResponse.ok) {
          const text = await membershipResponse.text();
          let membershipData: any = {};
          try { if (text) membershipData = JSON.parse(text); } catch (_) {}
          if (membershipData.is_member) {
            setIsAlreadyMember(true);
            setMemberData(membershipData.member);
          }
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.agreeToTerms) {
      setError('Please fill in all required fields and agree to terms.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      console.log('Submitting form data:', formData);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      console.log('Current user:', user);
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${baseURL}/api/join-community/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const text = await response.text();
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch (_) {}
      console.log('Response data:', data);

      if (response.ok) {
        setSuccess(true);
        console.log('Successfully joined community:', data);
      } else {
        console.error('API Error:', data);
        setError(data.error || data.details || 'Failed to join community. Please try again.');
      }
    } catch (err) {
      console.error('Network Error:', err);
      setError('An error occurred while joining the community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication or fetching profile
  if (!user || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-lg shadow-lg">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Show existing member view
  if (isAlreadyMember) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-green-600">Welcome Back!</CardTitle>
                <p className="text-muted-foreground mt-2">
                  You are already a member of the Flexora community
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-green-600 text-6xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Community Member</h3>
                  
                  <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">Your Community Profile</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-sm text-green-700">Name</p>
                        <p className="font-medium">{memberData?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Email</p>
                        <p className="font-medium">{memberData?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Fashion Interest</p>
                        <p className="font-medium">{memberData?.fashion_interest || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700">Location</p>
                        <p className="font-medium">{memberData?.location || 'Not specified'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-green-700">Bio</p>
                        <p className="font-medium">{memberData?.bio || 'No bio provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    Thank you for being part of our fashion community! You'll receive updates about events, trends, and opportunities.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/')} variant="outline">
                      Go to Home
                    </Button>
                    <Button onClick={() => navigate('/trending-looks')}>
                      Explore Trends
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Join the Flexora Community</CardTitle>
              <p className="text-muted-foreground mt-2">
                Connect with fellow fashion enthusiasts and showcase your unique style
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Welcome back, <strong>{userProfile?.username}</strong>! Your email and phone number have been pre-filled from your profile.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-12">
                  <div className="text-green-600 text-6xl mb-4">✓</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Flexora!</h3>
                  <p className="text-muted-foreground">
                    Thank you for joining our community. We'll be in touch soon with exciting updates and opportunities.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e => handleInputChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={e => handleInputChange('location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram Handle</Label>
                      <Input
                        id="instagram"
                        type="text"
                        value={formData.instagram}
                        onChange={e => handleInputChange('instagram', e.target.value)}
                        placeholder="@yourusername"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Personal Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={e => handleInputChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fashionInterest">Fashion Interest</Label>
                      <Select value={formData.fashionInterest} onValueChange={(value) => handleInputChange('fashionInterest', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your fashion interest" />
                        </SelectTrigger>
                        <SelectContent>
                          {fashionInterests.map((interest) => (
                            <SelectItem key={interest} value={interest}>
                              {interest}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatBringsYouHere">What brings you here?</Label>
                      <Select value={formData.whatBringsYouHere} onValueChange={(value) => handleInputChange('whatBringsYouHere', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {whatBringsYouHere.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={e => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us a bit about yourself and your fashion journey..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                        required
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a> *
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={formData.subscribeNewsletter}
                        onCheckedChange={(checked) => handleInputChange('subscribeNewsletter', checked as boolean)}
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Subscribe to our newsletter for fashion updates and community news
                      </Label>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Joining Community...' : 'Join Community'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JoinCommunity; 