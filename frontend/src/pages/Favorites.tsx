
import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Eye, MessageCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';
import { apiService, WishlistItem } from '../services/api';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { PageTransition } from '../components/PageTransition';
import { formatPrice } from '../lib/utils';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, undefined, []);
      
      if (user?.username) {
        // Logged in: Fetch products from API and merge with non-product local favorites
        const res = await apiService.getWishlist();
        if (res.data) {
          const apiFavorites = res.data.map((item: WishlistItem) => ({
            ...item.product,
            id: item.product_id, // ensure ID is product ID for rendering
            wishlist_id: item.id, // the actual wishlist record ID
            type: 'product'
          }));
          
          // Get any non-product favorites from localStorage
          const nonProductFavorites = savedFavorites.filter((fav: any) => fav.type !== 'product');
          
          setFavorites([...apiFavorites, ...nonProductFavorites]);
        }
      } else {
        // Guest: Just use localStorage
        setFavorites(savedFavorites);
      }
      setIsLoading(false);
    };
    
    loadFavorites();
  }, [user]);

  const handleRemoveFromFavorites = async (itemId: string, itemType?: string, wishlistId?: string) => {
    if (user && itemType === 'product') {
      // Remove from API
      const res = wishlistId 
        ? await apiService.removeWishlistItem(wishlistId) 
        : await apiService.removeWishlistItemByProduct(itemId);
        
      if (res.error) {
        toast.error(res.error);
        return;
      }
    } else {
      // Remove from localStorage
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, undefined, []);
      const updatedLocalStorage = savedFavorites.filter((item: any) => !(item.id === itemId && (itemType ? item.type === itemType : true)));
      setStorageData(STORAGE_KEYS.FAVORITES, updatedLocalStorage);
    }
    
    // Update local state
    const updatedFavorites = favorites.filter(item => !(item.id === itemId && (itemType ? item.type === itemType : true)));
    setFavorites(updatedFavorites);
    toast.success("Removed from favorites");
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  return (
    <PageTransition>
      <Navigation />
      
      <main className="flex-1">
        <PageHero 
          title="Your Favorites" 
          subtitle="Your collection of liked styles and inspirations"
          backgroundGradient="from-primary/20 via-accent/10 to-secondary/20"
        />
        
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {favorites.length === 0 ? (
              <div className="animate-fade-in">
                <EmptyState
                  icon={Heart}
                  title="No favorites yet"
                  description="Start exploring our amazing collection and Heart the styles you love to see them here!"
                  actionLabel="Explore products"
                  actionLink="/products"
                />
              </div>
            ) : isLoading ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">Loading favorites...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((item, index) => (
                  item.type === 'product' ? (
                    <article 
                      key={item.id}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                    >
                      <a href={`/products/${item.id}`} className="block">
                        <div className="h-64 bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center hover:scale-105 transition-transform duration-300 overflow-hidden">
                          <img
                            src={item.image_url || '/placeholder.svg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="text-lg font-bold text-primary mb-2">{formatPrice(item.price)}</div>
                        </div>
                      </a>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFromFavorites(item.id, 'product', item.wishlist_id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                        style={{ position: 'absolute', top: 12, right: 12 }}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </article>
                  ) : (
                    <article 
                      key={item.id}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                    >
                      <div className="relative">
                        <div className={`h-64 bg-gradient-to-br ${item.image} flex items-center justify-center hover:scale-105 transition-transform duration-300`}>
                          <Eye className="w-8 h-8 text-primary/60" />
                        </div>
                        <button
                          onClick={() => handleRemoveFromFavorites(item.id, item.type)}
                          className="absolute top-3 right-3 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.author && (
                        <p className="text-sm text-muted-foreground mb-3">
                          by {item.author}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-current text-primary" />
                            <span>{item.likes || 0}</span>
                          </div>
                          {item.comments && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{item.comments}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default Favorites;
