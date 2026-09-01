import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Suggestions from '../components/Suggestions';
import { Eye, EyeOff } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { apiService } from '../services/api';

const Login = () => {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }
    try {
      const res = await apiService.login({ username, password });
      
      if (!res.error && res.data?.access) {
        login(username, res.data.access, res.data.refresh);
        setError('');
        navigate('/');
      } else if (res.status === 403 && res.rawErrorData?.email) {
        setError(res.rawErrorData.detail || 'Email not verified.');
        setTimeout(() => navigate('/verify-email'), 1500);
      } else {
        setError(res.error || res.rawErrorData?.detail || res.rawErrorData?.error || 'Login failed.');
      }
    } catch (err) {
      setError('An error occurred.');
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
            <CardTitle className="text-center">Login to Flexora</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">Username</label>
                <Suggestions
                  value={username}
                  onChange={setUsername}
                  placeholder=""
                  className="w-full"
                  type="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
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
                <div className="text-right mt-1">
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>
              {error && <div className="text-destructive text-sm text-center font-medium" role="alert" aria-live="assertive">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="text-sm text-center mt-4 text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
            </div>
          </CardContent>
        </Card>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Login; 
