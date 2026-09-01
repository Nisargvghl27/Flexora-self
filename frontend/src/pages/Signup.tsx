import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, Building, Map, Eye, EyeOff } from 'lucide-react';
import { setStorageData, STORAGE_KEYS } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { apiService } from '../services/api';


const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressName, setAddressName] = useState('');
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Password requirements regex
  const passwordRequirements = [
    { label: 'At least 6 characters', test: (pw: string) => pw.length >= 6 },
    { label: 'One uppercase letter (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
    { label: 'One lowercase letter (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
    { label: 'One digit (0-9)', test: (pw: string) => /[0-9]/.test(pw) },
    { label: 'One special character (!@#$%^&*)', test: (pw: string) => /[!@#$%^&*]/.test(pw) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Enhanced validation
    if (!username || !email || !password || !confirmPassword || !phone || !address || !addressName) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    if (!isPasswordValid) {
      setError('Password does not meet all requirements.');
      setLoading(false);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    
    try {
      const res = await apiService.register({ username, email, password, phone, address });
      
      if (!res.error) {
        setError('');
        setSuccess('Registration successful! Redirecting to login...');
        
        // Store the actual signup date (username-specific)
        const signupDate = new Date().toISOString();
        setStorageData(STORAGE_KEYS.MEMBER_SINCE, signupDate, username);
        
        // Store the default address for the new user
        const defaultAddress = {
          id: `addr-${Date.now()}`,
          name: addressName,
          type: addressType,
          address: address,
          isDefault: true
        };
        
        // Store in localStorage with username-specific key
        setStorageData(STORAGE_KEYS.SAVED_ADDRESSES, [defaultAddress], username);
        
        setTimeout(() => navigate('/verify-email'), 1500);
      } else {
        setError(res.error || res.rawErrorData?.error || `Registration failed. Status: ${res.status}`);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(`Network error: ${err.message || 'Failed to connect to server'}`);
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Sign Up for Flexora</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); setSuccess(''); }}
                  className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your username (min 3 characters)"
                  minLength={3}
                  required
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
                {username && username.length < 3 && (
                  <p className="text-xs text-orange-600 mt-1" role="alert">Username must be at least 3 characters</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }}
                  className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { 
                      setPassword(e.target.value); 
                      setError(''); 
                      setSuccess('');
                      // Show requirements when user starts typing
                      if (e.target.value.length > 0) {
                        setShowPasswordRequirements(true);
                      }
                    }}
                    onFocus={() => {
                      // Show requirements when user focuses on password field
                      if (password.length > 0) {
                        setShowPasswordRequirements(true);
                      }
                    }}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Show Requirements Button */}
                {!showPasswordRequirements && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordRequirements(true)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Show password requirements
                  </button>
                )}
                
                {/* Password requirements list - only show when needed */}
                {showPasswordRequirements && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-2">Password requirements:</p>
                    <ul className="space-y-1 text-xs">
                      {passwordRequirements.map((req, idx) => (
                        <li key={idx} className={req.test(password) ? 'text-green-600 flex items-center gap-1' : 'text-muted-foreground flex items-center gap-1'}>
                          <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: req.test(password) ? '#16a34a' : '#6b7280' }}></span>
                          {req.label}
                        </li>
                      ))}
                    </ul>
                    {password && !isPasswordValid && (
                      <p className="text-xs text-destructive mt-1" role="alert">Password does not meet all requirements</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); setSuccess(''); }}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1" role="alert">Passwords do not match</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); setSuccess(''); }}
                  className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Address Information <span className="text-red-500">*</span>
                </label>
                
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted">
                  {/* Address Name */}
                  <div>
                    <label htmlFor="addressName" className="block text-sm font-medium text-foreground mb-1">
                      Address Name
                    </label>
                    <input
                      id="addressName"
                      type="text"
                      value={addressName}
                      onChange={e => { setAddressName(e.target.value); setError(''); setSuccess(''); }}
                      className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Home, Work, Grandma's House"
                      required
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                  </div>
                  
                  {/* Address Type */}
                  <div>
                    <label htmlFor="addressType" className="block text-sm font-medium text-foreground mb-1">
                      Address Type
                    </label>
                    <select
                      id="addressType"
                      value={addressType}
                      onChange={e => { setAddressType(e.target.value as 'home' | 'work' | 'other'); setError(''); setSuccess(''); }}
                      className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {/* Full Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={e => { setAddress(e.target.value); setError(''); setSuccess(''); }}
                      className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Enter the full address"
                      rows={3}
                      required
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                  </div>
                  

                </div>
              </div>
              {error && <div className="text-destructive text-sm text-center font-medium" role="alert" aria-live="assertive">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center font-medium" role="status" aria-live="polite">{success}</div>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
            <div className="text-sm text-center mt-4 text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Login</Link>
            </div>
          </CardContent>
        </Card>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Signup; 
