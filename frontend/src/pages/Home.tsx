
import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import FashionStyleQuiz from '../components/FashionStyleQuiz';
import { Sparkles, TrendingUp, ShoppingBag, Heart, Eye, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';
import { apiService } from '../services/api';
import { formatPrice } from '../lib/utils';

interface HomeProps {
  openQuiz?: boolean;
}

const Home = ({ openQuiz = false }: HomeProps) => {
  const { user } = useAuth();
  const [isQuizOpen, setIsQuizOpen] = useState(openQuiz);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [favoritePosts, setFavoritePosts] = useState<Set<number>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recently viewed
    const saved = getStorageData(STORAGE_KEYS.RECENTLY_VIEWED, undefined, []);
    setRecentlyViewed(saved.slice(0, 4)); // Show up to 4 items

    const onStorage = () => {
      setRecentlyViewed(getStorageData(STORAGE_KEYS.RECENTLY_VIEWED, undefined, []).slice(0, 4));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (openQuiz) setIsQuizOpen(true);
  }, [openQuiz]);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Discover Your Style",
      description: "Take our personalized quiz to find your unique fashion aesthetic"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Latest Trends",
      description: "Stay ahead with the newest fashion trends and style inspirations"
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Curated Products",
      description: "Shop from a wide range of handpicked fashion products"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Curated Collections",
      description: "Explore handpicked fashion collections from talented designers"
    }
  ];

  const categories = [
    { name: 'Dresses', slug: 'dresses' },
    { name: 'Tops', slug: 'tops' },
    { name: 'Bottoms', slug: 'bottoms' },
    { name: 'Outerwear', slug: 'outerwear' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Activewear', slug: 'activewear' },
  ];

  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const res = await apiService.getBlogs({ trending: true, limit: 3 });
        if (res.data?.results) {
          setTrendingPosts(res.data.results);
        } else {
          setTrendingPosts([]);
        }
      } catch (err) {
        console.error("Failed to fetch trending posts", err);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  const handleLike = async (postId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Optimistic UI update
    setTrendingPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = likedPosts.has(postId);
        return {
          ...post,
          likes_count: isLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1
        };
      }
      return post;
    }));

    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });

    // Actual API call
    const res = await apiService.engageBlog(postId, 'like');
    if (res.error) {
      // Revert if failed (simplified for brevity)
    }
  };

  // Load favorites when user is available
  useEffect(() => {
    if (user?.username) {
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
      const favoriteIds = new Set(savedFavorites.map((fav: any) => fav.id).filter((id: any) => typeof id === 'number')) as Set<number>;
      setFavoritePosts(favoriteIds);
    }
  }, [user?.username]);

  const handleFavorite = (post: any) => {
    if (!user?.username) return;
    
    const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    const isAlreadyFavorite = savedFavorites.some((fav: any) => fav.id === post.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...savedFavorites, { ...post, type: 'post' }];
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoritePosts(prev => new Set([...prev, post.id]));
    } else {
      const updatedFavorites = savedFavorites.filter((fav: any) => fav.id !== post.id);
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoritePosts(prev => {
        const newFavs = new Set(prev);
        newFavs.delete(post.id);
        return newFavs;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <Hero />
        
        {/* Features Section */}
        <section className="py-16 px-6 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Flex Your Aura
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover, create, and share your unique fashion story
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                >
                  <div className="text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop by Category Section */}
        <section className="py-16 px-6 bg-secondary/30 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Shop by Category
              </h2>
              <Link to="/products" className="text-primary hover:text-primary/80 font-medium transition-colors">
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.slug} 
                  to={`/category/${category.slug}`}
                  className="group relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-accent/30 border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors z-10" />
                  <span className="relative z-20 font-display font-bold text-xl text-foreground tracking-wide group-hover:scale-110 transition-transform duration-300">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Posts Section */}
        <section className="py-16 px-6 bg-card/50 animate-slide-in-right">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Trending This Week
              </h2>
              <Link to="/trending" className="text-primary hover:text-primary/80 font-medium transition-colors">
                View All
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {loadingTrending ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-card rounded-xl border border-border overflow-hidden h-72 animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : trendingPosts.length > 0 ? (
                trendingPosts.map((post, index) => {
                  let imageUrl = '/placeholder.svg';
                  if (post.cover_image_url) {
                    imageUrl = post.cover_image_url;
                  } else if (post.cover_image) {
                    if (post.cover_image.startsWith('http')) {
                      imageUrl = post.cover_image;
                    } else if (post.cover_image.startsWith('/')) {
                      imageUrl = `http://localhost:8000${post.cover_image}`;
                    } else {
                      imageUrl = `http://localhost:8000/media/${post.cover_image}`;
                    }
                  }

                  return (
                    <Link to={`/blog/${post.slug}`} key={post.id} className="block animate-fade-in">
                      <article
                        className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="h-48 overflow-hidden bg-muted">
                          <img 
                            src={imageUrl} 
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      <div className="p-4">
                        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          by {post.author}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={e => { e.preventDefault(); handleLike(post.id); }}
                              className={`flex items-center gap-1 transition-colors ${
                                likedPosts.has(post.id) ? 'text-primary' : 'hover:text-primary'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                              <span>{post.likes_count || 0}</span>
                            </button>
                            <div className="flex items-center gap-1 hover:text-primary transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments_count || 0}</span>
                            </div>
                          </div>
                          <button
                            onClick={e => { e.preventDefault(); handleFavorite(post); }}
                            className={`transition-colors hover:scale-110 transform hover:text-primary ${favoritePosts.has(post.id) ? 'text-primary' : ''}`}
                          >
                            <Heart className={`w-4 h-4 ${favoritePosts.has(post.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        </div>
                      </article>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No trending posts available right now.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="py-16 px-6 bg-secondary/30">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">Continue Browsing</h2>
                  <p className="text-muted-foreground">Pick up right where you left off</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recentlyViewed.map(product => (
                  <Link key={product.id} to={`/products/${product.id}`} className="group block">
                    <div className="bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <div className="aspect-[4/5] overflow-hidden bg-secondary relative">
                        <img 
                          src={product.image_url || '/placeholder.svg'} 
                          alt={product.name} 
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-primary font-medium mb-1">{product.category}</div>
                        <h3 className="font-bold text-foreground mb-1 line-clamp-1">{product.name}</h3>
                        <div className="font-bold text-lg">{formatPrice(product.price)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 px-6 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">
              Ready to Discover Your Style?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take our personalized style quiz and unlock your fashion potential
            </p>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-primary/90 shadow-lg hover:shadow-xl"
            >
              Start Style Quiz
            </button>
          </div>
        </section>
      </main>

      <FashionStyleQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      
      <Footer />
    </div>
  );
};

export default Home;
