import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../App';
import { apiService, Blog } from '../services/api';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setError('Blog slug is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getBlog(slug);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setBlog(response.data);
        } else {
          setError('Blog not found');
        }
      } catch (err) {
        setError('Failed to load blog');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (user && blog) {
      // Load user's interaction state
      const likedPosts = getStorageData(STORAGE_KEYS.LIKED_POSTS, user.username, []);
      const favoritePosts = getStorageData(STORAGE_KEYS.FAVORITE_POSTS, user.username, []);
      
      setLiked(likedPosts.includes(blog.id));
      setFavorited(favoritePosts.includes(blog.id));
    }
  }, [user, blog]);

  const handleLike = async () => {
    if (!blog) return;

    try {
      const response = await apiService.likeBlog(blog.id);
      
      if (response.error) {
        console.error('Error liking blog:', response.error);
        return;
      }

      // Update local state
      setLiked(!liked);
      setBlog(prev => prev ? { ...prev, likes_count: liked ? prev.likes_count - 1 : prev.likes_count + 1 } : null);

      // Update storage
      const likedPosts = getStorageData(STORAGE_KEYS.LIKED_POSTS, user?.username, []);
      if (liked) {
        const newLikedPosts = likedPosts.filter(id => id !== blog.id);
        setStorageData(STORAGE_KEYS.LIKED_POSTS, newLikedPosts, user?.username);
      } else {
        setStorageData(STORAGE_KEYS.LIKED_POSTS, [...likedPosts, blog.id], user?.username);
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const handleFavorite = () => {
    if (!blog) return;

    setFavorited(!favorited);
    
    // Update storage
    const favoritePosts = getStorageData(STORAGE_KEYS.FAVORITE_POSTS, user?.username, []);
    if (favorited) {
      const newFavoritePosts = favoritePosts.filter(id => id !== blog.id);
      setStorageData(STORAGE_KEYS.FAVORITE_POSTS, newFavoritePosts, user?.username);
    } else {
      setStorageData(STORAGE_KEYS.FAVORITE_POSTS, [...favoritePosts, blog.id], user?.username);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading blog...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Blog Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The blog you are looking for does not exist.'}</p>
            <button 
              onClick={() => navigate('/trending-looks')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Back to Trending
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title={blog.title}
          subtitle={blog.excerpt}
          backgroundGradient="from-primary/30 to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by {blog.author}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{blog.time_ago}</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <div 
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-6">
                  <div 
                    className={`flex items-center gap-2 transition-colors cursor-pointer ${
                      liked ? 'text-red-500' : 'hover:text-primary'
                    }`}
                    onClick={handleLike}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    <span>{blog.likes_count} likes</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                    <span>{blog.comments_count} comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>{blog.views_count} views</span>
                  </div>
                </div>
                <button 
                  className={`flex items-center gap-2 transition-colors ${
                    favorited ? 'text-yellow-500' : 'hover:text-primary'
                  }`}
                  onClick={handleFavorite}
                >
                  <Heart className={`w-5 h-5 ${favorited ? 'fill-current' : ''}`} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail; 