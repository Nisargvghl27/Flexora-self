import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Eye, MessageCircle, TrendingUp, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';
import { apiService, Blog } from '../services/api';
import { useBlogs } from '../hooks/useBlogs';
import { useSearchParams } from 'react-router-dom';

const TrendingLooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [favoritePosts, setFavoritePosts] = useState<Set<string>>(new Set());
  
  // Use URL params for filtering
  const activeCategory = searchParams.get('category') || 'All';
  const tagQuery = searchParams.get('tag') || undefined;
  const authorQuery = searchParams.get('author') || undefined;
  const searchQuery = searchParams.get('search') || '';
  
  const [searchInput, setSearchInput] = useState(searchQuery);

  const { blogs, loading, error, refetch } = useBlogs({
    tag: tagQuery,
    author: authorQuery,
    search: searchQuery || undefined
  });

  const filters = ['All', 'Minimalist', 'Vintage', 'Streetwear', 'Bohemian', 'Formal', 'Casual'];

  const setActiveFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    if (filter === 'All') {
      params.delete('category');
    } else {
      params.set('category', filter);
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  // Filter blogs based on active filter and exclude Test Blog Post
  const filteredBlogs = activeCategory === 'All'
    ? blogs.filter(blog => blog.title !== 'Test Blog Post')
    : blogs.filter(blog => blog.category === activeCategory && blog.title !== 'Test Blog Post');

  const handleLike = async (blogId: string) => {
    try {
      const response = await apiService.likeBlog(blogId);
      
      if (response.error) {
        console.error('Error liking blog:', response.error);
        return;
      }

      // Update local state
      setLikedPosts(prev => {
        const newLiked = new Set(prev);
        if (newLiked.has(blogId)) {
          newLiked.delete(blogId);
        } else {
          newLiked.add(blogId);
        }
        return newLiked;
      });

             // Note: In a real app, you might want to refetch the blogs or update the cache
       // For now, we'll just update the local state optimistically
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  // Load favorites when user is available
  useEffect(() => {
    if (user?.username) {
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
      const favoriteIds = new Set(savedFavorites.map((fav: any) => fav.id).filter((id: any) => typeof id === 'string')) as Set<string>;
      setFavoritePosts(favoriteIds);
    }
  }, [user?.username]);

  const handleFavorite = (blog: Blog) => {
    if (!user?.username) return;
    
    const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    const isAlreadyFavorite = savedFavorites.some((fav: any) => fav.id === blog.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...savedFavorites, { ...blog, type: 'blog' }];
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoritePosts(prev => new Set([...prev, blog.id]));
    } else {
      const updatedFavorites = savedFavorites.filter((fav: any) => fav.id !== blog.id);
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoritePosts(prev => {
        const newFavs = new Set(prev);
        newFavs.delete(blog.id);
        return newFavs;
      });
    }
  };

  // Generate gradient class based on blog data
  const getGradientClass = (blog: Blog, index: number) => {
    const gradients = [
      "from-primary/30 to-secondary",
      "from-accent to-muted-foreground",
      "from-secondary to-background",
      "from-background to-primary/30",
      "from-muted-foreground to-accent",
      "from-secondary to-muted-foreground",
      "from-primary/20 to-accent/20",
      "from-secondary/20 to-primary/30",
      "from-accent/30 to-primary/20",
      "from-accent/20 to-secondary/30"
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <PageHero 
          title="Trending Looks"
          subtitle="Discover the hottest fashion trends and styles from our community"
          backgroundGradient="from-accent/30 to-secondary/20"
        />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading trending blogs...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <PageHero 
          title="Trending Looks"
          subtitle="Discover the hottest fashion trends and styles from our community"
          backgroundGradient="from-accent/30 to-secondary/20"
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load trending blogs</p>
                         <button 
               onClick={refetch} 
               className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
             >
               Try Again
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
          title="Trending Looks"
          subtitle="Discover the hottest fashion trends and styles from our community"
          backgroundGradient="from-accent/30 to-secondary/20"
        />

        {/* Filters and Search */}
        <section className="py-8 px-6 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Filter by Category:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeCategory === filter
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="flex max-w-sm w-full gap-2">
                <input 
                  type="text" 
                  placeholder="Search blogs..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Search
                </button>
              </form>
            </div>
            
            {/* Active Filters Display */}
            {(tagQuery || authorQuery) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {tagQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                    Tag: {tagQuery}
                    <button onClick={() => {
                      const p = new URLSearchParams(searchParams);
                      p.delete('tag');
                      setSearchParams(p);
                    }} className="ml-1 hover:text-primary">&times;</button>
                  </span>
                )}
                {authorQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                    Author: {authorQuery}
                    <button onClick={() => {
                      const p = new URLSearchParams(searchParams);
                      p.delete('author');
                      setSearchParams(p);
                    }} className="ml-1 hover:text-primary">&times;</button>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Trending Posts Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                What's Trending Now
              </h2>
            </div>
            
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No blogs found for the selected category.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog, index) => {
                  let imageUrl = '/placeholder.svg';
                  if (blog.cover_image_url) {
                    imageUrl = blog.cover_image_url;
                  } else if (blog.cover_image) {
                    if (blog.cover_image.startsWith('http')) {
                      imageUrl = blog.cover_image;
                    } else if (blog.cover_image.startsWith('/')) {
                      imageUrl = `http://localhost:8000${blog.cover_image}`;
                    } else {
                      imageUrl = `http://localhost:8000/media/${blog.cover_image}`;
                    }
                  }

                  return (
                    <Link 
                      key={blog.id}
                      to={`/trending/${blog.slug}`}
                      className="block"
                    >
                      <article 
                        className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`relative h-64 bg-gradient-to-br ${getGradientClass(blog, index)} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
                          {imageUrl !== '/placeholder.svg' ? (
                            <img 
                              src={imageUrl} 
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Eye className="w-8 h-8 text-primary/60" />
                          )}
                          {blog.is_trending && (
                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Hot
                            </div>
                          )}
                        </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2 justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {blog.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {blog.time_ago}
                            </span>
                          </div>
                          {(blog as any).reading_time && (
                            <span className="text-xs text-muted-foreground font-medium">
                              {(blog as any).reading_time}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          by {blog.author}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleLike(blog.id);
                              }}
                              className={`flex items-center gap-1 transition-colors ${
                                likedPosts.has(blog.id) ? 'text-primary' : 'hover:text-primary'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPosts.has(blog.id) ? 'fill-current' : ''}`} />
                              <span>{blog.likes_count + (likedPosts.has(blog.id) ? 1 : 0)}</span>
                            </button>
                            <div className="flex items-center gap-1 hover:text-primary transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{blog.comments_count}</span>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleFavorite(blog);
                            }}
                            className="transition-colors hover:scale-110 transform hover:text-primary"
                          >
                            <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TrendingLooks;
