import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Heart, MessageCircle, Share2, Image as ImageIcon, Send, Trash2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import { apiService } from '../services/api';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
  author_name: string;
  avatar_url: string | null;
}

const CommunityFeed = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('accessToken');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const fetchPosts = async () => {
    try {
      const res = await apiService.getCommunityFeed();
      if (res.error) throw new Error(res.error);
      setPosts(res.data?.posts || res.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedPosts = async () => {
    if (!user) return;
    try {
      const res = await apiService.getLikedCommunityPosts();
      if (!res.error && res.data) {
        setLikedPosts(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchLikedPosts();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post');
      return;
    }
    if (!newPostContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('content', newPostContent);
      if (newPostImage) formData.append('image', newPostImage);

      const res = await apiService.createCommunityPost(formData);

      if (res.error) throw new Error(res.error || 'Failed to create post');
      
      const newPost = res.data?.post || res.data;
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setNewPostImage(null);
      setImagePreview(null);
      toast.success('Posted successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    
    // Optimistic update
    const isLiked = likedPosts.includes(postId);
    setLikedPosts(isLiked ? likedPosts.filter(id => id !== postId) : [...likedPosts, postId]);
    setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p));

    try {
      await apiService.likeCommunityPost(postId);
    } catch (err) {
      // Revert on error
      setLikedPosts(isLiked ? [...likedPosts, postId] : likedPosts.filter(id => id !== postId));
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) } : p));
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await apiService.deleteCommunityPost(postId);
      if (res.error) throw new Error(res.error || 'Failed to delete post');
      
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <div className="max-w-2xl mx-auto pt-24 px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">Community Feed</h1>

        {user && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-8">
            <form onSubmit={handleSubmit}>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your fashion thoughts..."
                className="w-full resize-none outline-none text-foreground placeholder:text-muted-foreground bg-transparent min-h-[100px]"
              />
              
              {imagePreview && (
                <div className="relative mb-4 mt-2 inline-block">
                  <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setNewPostImage(null); }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <label className="cursor-pointer text-primary hover:bg-primary/10 p-2 rounded-full transition-colors flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Add Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                
                <button
                  type="submit"
                  disabled={isSubmitting || (!newPostContent.trim() && !newPostImage)}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading feed...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-xl shadow-sm border border-border">
              <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map(post => {
              const isLiked = likedPosts.includes(post.id);
              return (
                <div key={post.id} className="bg-card rounded-xl shadow-sm border border-border p-5 overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                        {post.avatar_url ? (
                          <img src={post.avatar_url} alt={post.author_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                            {post.author_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{post.author_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {(user?.id === post.user_id || user?.role === 'admin') && (
                      <button onClick={() => handleDelete(post.id)} className="text-muted-foreground hover:text-red-500 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.image_url && (
                    <div className="mb-4 rounded-xl overflow-hidden bg-muted">
                      <img src={post.image_url} alt="Post attachment" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-border">
                    <button 
                      onClick={() => toggleLike(post.id)} 
                      className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'} transition-colors`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Comment</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
