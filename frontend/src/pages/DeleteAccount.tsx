import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const DeleteAccount = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${baseURL}/api/delete-account/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      
      const text = await res.text();
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch (_) {}
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error deleting account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md shadow-2xl border-2 border-red-200">
          <CardHeader className="flex flex-col items-center gap-2 bg-red-50 rounded-t-lg pb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600 mb-1">Delete Account</CardTitle>
            <div className="text-center text-muted-foreground text-sm">
              This action cannot be undone. All your data will be permanently deleted.
            </div>
          </CardHeader>
          <CardContent className="py-8 px-6">
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Warning:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your account will be permanently deleted</li>
                      <li>All your profile data will be lost</li>
                      <li>Your cart and favorites will be removed</li>
                      <li>This action cannot be reversed</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Enter your password to confirm
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  placeholder="Your password"
                />
              </div>
              
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              
              <button
                type="submit"
                className="w-full py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                disabled={loading || !password}
              >
                {loading ? (
                  'Deleting Account...'
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete My Account
                  </>
                )}
              </button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-muted text-foreground rounded-md font-medium hover:bg-accent transition-colors"
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

export default DeleteAccount; 