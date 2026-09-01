import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

import { apiService } from '../services/api';

const SubmitDesign = () => {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit a design.');
      return;
    }
    if (!title || !description) {
      setError('Please fill in all fields.');
      return;
    }
    if (!image) {
      setError('Please upload an image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image', image);

      const res = await apiService.submitDesign(formData);

      if (res.error) {
        throw new Error(res.error || 'Failed to submit design');
      }

      setSuccess(true);
      toast.success('Design submitted successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center py-16 px-4 mt-16">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Submit Your Design</CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You need to be logged in to submit a design.</p>
                <a href="/login" className="text-primary hover:underline font-semibold">Go to Login</a>
              </div>
            ) : success ? (
              <div className="text-center text-green-600 font-semibold py-8">Thank you for submitting your design! We will review it soon.</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Design Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Design Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-foreground mb-1">Upload Design Image</label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:font-semibold file:hover:bg-primary/90"
                    required
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-64 object-cover rounded border border-border shadow"
                      />
                    </div>
                  )}
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex justify-center items-center gap-2"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Design'}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitDesign;