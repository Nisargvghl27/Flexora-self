import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import TrendSwipePopup from '../components/TrendSwipePopup';
import { ArrowLeft, Sparkles, ShoppingBag, Star, Heart } from 'lucide-react';
import { toast } from "sonner";
import { lookbookApi, productApi, Product, Lookbook as LookbookType, LookbookItem as LookbookItemType } from '../services/lookbookApi';
import { useAuth } from '../App';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';

interface LookbookItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  designer: string;
  rating: number;
  reviews: number;
  featured?: boolean;
  trending?: boolean;
  sizes?: string[];
  colors?: string[];
}

interface PersonaData {
  title: string;
  description: string;
  color: string;
  recommendations: string[];
  items: LookbookItem[];
  trendingStyles: string[];
}

// Convert Product to LookbookItem
const convertProductToLookbookItem = (product: Product): LookbookItem => {
  // Handle image URL properly
  let imageUrl = '/placeholder.jpg'; // Default fallback
  
  if (product.image_url) {
    imageUrl = product.image_url;
  } else if (product.image) {
    // If image is a relative path, make it absolute
    if (product.image.startsWith('/')) {
      imageUrl = `http://localhost:8000${product.image}`;
    } else if (product.image.startsWith('http')) {
      imageUrl = product.image;
    } else {
      imageUrl = `http://localhost:8000/media/${product.image}`;
    }
  }
  
  console.log('Converting product image:', { 
    original_image_url: product.image_url, 
    original_image: product.image, 
    final_image: imageUrl 
  });
  
  return {
    id: product.id,
    title: product.name,
    description: product.description,
    category: product.category || 'General',
    price: product.price,
    originalPrice: undefined, // Backend doesn't have originalPrice
    image: imageUrl,
    designer: product.brand || 'Unknown Designer',
    rating: 4.5, // Default rating since backend doesn't have this
    reviews: Math.floor(Math.random() * 100) + 10, // Random reviews count
    featured: product.stock_quantity > 20, // Use stock as featured indicator
    trending: product.stock_quantity > 20,
    sizes: ['XS', 'S', 'M', 'L', 'XL'], // Default sizes
    colors: ['Black', 'White', 'Gray'] // Default colors
  };
};

// Convert LookbookItem to TrendSwipePopup Product format
const convertToSwipeProduct = (item: LookbookItem): { id: number; name: string; images: string[]; tags: string[]; } => {
  // Ensure we have a valid image URL from the backend product data
  const imageUrl = item.image && item.image !== '/placeholder.jpg' ? item.image : null;
  
  return {
    id: parseInt(item.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for swipe component
    name: item.title,
    images: imageUrl ? [imageUrl] : [], // Only include valid image URLs
    tags: [item.category, item.designer, `$${item.price}`]
  };
};

// Static persona metadata
const getPersonaMetadata = (persona: string): Omit<PersonaData, 'items'> => {
  const metadata: Record<string, Omit<PersonaData, 'items'>> = {
    'minimalist-style': {
      title: "Minimalist Style Lookbook",
      description: "Clean lines, quality over quantity, and timeless pieces that speak to your sophisticated aesthetic.",
      color: "from-gray-400 to-gray-600",
      recommendations: [
        "Invest in high-quality basics",
        "Stick to a neutral color palette",
        "Focus on clean silhouettes",
        "Choose versatile pieces that mix and match"
      ],
      trendingStyles: ["Capsule Wardrobe", "Neutral Tones", "Clean Lines", "Quality Basics"]
    },
    'bohemian-style': {
      title: "Bohemian Style Lookbook",
      description: "Free-spirited and artistic pieces that celebrate your creative expression and love for eclectic style.",
      color: "from-amber-400 to-orange-500",
      recommendations: [
        "Mix patterns and textures freely",
        "Layer jewelry and accessories",
        "Choose flowing, comfortable fabrics",
        "Embrace earthy and warm tones"
      ],
      trendingStyles: ["Free Spirit", "Artistic Expression", "Layered Looks", "Earthy Tones"]
    },
    'vintage-style': {
      title: "Vintage Style Lookbook",
      description: "Timeless elegance and classic sophistication that reflects your appreciation for fashion history.",
      color: "from-rose-400 to-pink-500",
      recommendations: [
        "Look for quality vintage pieces",
        "Embrace classic silhouettes",
        "Choose sophisticated accessories",
        "Mix vintage with modern touches"
      ],
      trendingStyles: ["Classic Elegance", "Timeless Fashion", "Sophisticated Look", "Retro Vibes"]
    },
    'casual-style': {
      title: "Casual Style Lookbook",
      description: "Comfortable and versatile pieces that maintain style while prioritizing ease and practicality.",
      color: "from-blue-400 to-indigo-500",
      recommendations: [
        "Choose comfortable, breathable fabrics",
        "Focus on versatile, mix-and-match pieces",
        "Keep accessories simple and practical",
        "Prioritize comfort without sacrificing style"
      ],
      trendingStyles: ["Weekend Casual", "Comfort First", "Versatile Pieces", "Easy Style"]
    },
    'streetwear-style': {
      title: "Streetwear Style Lookbook",
      description: "Urban and edgy pieces that reflect your bold, contemporary fashion sense and love for street culture.",
      color: "from-purple-400 to-pink-500",
      recommendations: [
        "Mix high and low fashion",
        "Embrace bold graphics and logos",
        "Layer pieces for depth",
        "Choose comfortable, statement pieces"
      ],
      trendingStyles: ["Urban Edge", "Bold Graphics", "Layered Street Style", "Contemporary Cool"]
    },
    'formal-style': {
      title: "Formal Style Lookbook",
      description: "Sophisticated and elegant pieces that showcase your refined taste and professional demeanor.",
      color: "from-emerald-400 to-teal-500",
      recommendations: [
        "Invest in quality formal pieces",
        "Choose sophisticated accessories",
        "Focus on tailored fits",
        "Maintain a polished appearance"
      ],
      trendingStyles: ["Sophisticated Elegance", "Professional Polish", "Refined Taste", "Timeless Luxury"]
    }
  };
  
  return metadata[persona] || metadata['minimalist-style'];
};

// Product Card Component
const ProductCard = ({ item, likedItems, favoriteItems, onLike, onFavorite, onAddToCart, user }: {
  item: LookbookItem,
  likedItems: Set<string>,
  favoriteItems: Set<string>,
  onLike: (id: string) => void,
  onFavorite: (item: LookbookItem) => void,
  onAddToCart: (item: LookbookItem) => void,
  user: any
}) => (
  <article className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group">
    <Link to={`/products/${item.id}`} className="block">
      <div className="h-64 bg-gradient-to-br from-primary-cream to-soft-pink flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative">
        {item.image && item.image !== '/placeholder.jpg' ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-muted-foreground">No Image</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {item.category}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          by {item.designer}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{item.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({item.reviews} reviews)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              ${item.price}
            </span>
            {item.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${item.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
    <div className="flex items-center gap-2 p-4 pt-0">
      <button
        onClick={() => onLike(item.id)}
        className={`p-2 rounded-full transition-colors ${
          likedItems.has(item.id) 
            ? 'text-red-500 bg-red-50' 
            : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
        }`}
      >
        <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
      </button>
      <button
        onClick={() => onFavorite(item)}
        className={`p-2 rounded-full transition-colors ${
          favoriteItems.has(item.id)
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
        }`}
      >
        <Heart className={`w-4 h-4 ${favoriteItems.has(item.id) ? 'fill-current' : ''}`} />
      </button>
      <button
        onClick={() => onAddToCart(item)}
        className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
      >
        <ShoppingBag className="w-3 h-3" />
        Add to Cart
      </button>
    </div>
  </article>
);

const Lookbook = () => {
  const { persona } = useParams<{ persona: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [lookbookData, setLookbookData] = useState<PersonaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrendSwipe, setShowTrendSwipe] = useState(false);
  const [swipeResults, setSwipeResults] = useState<{ liked: any[]; skipped: any[]; } | null>(null);

  // Load lookbook data from backend
  useEffect(() => {
    const loadLookbookData = async () => {
      if (!persona) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get persona metadata
        const metadata = getPersonaMetadata(persona);
        
        // Try to get or create lookbook from backend
        let lookbook: LookbookType;
        try {
          if (user) {
            lookbook = await lookbookApi.getLookbookByStyle(persona);
          } else {
            // If no user, fetch products directly
            const products = await productApi.getProductsForStyle(persona);
            const items = products.map(convertProductToLookbookItem);
            setLookbookData({ ...metadata, items });
            setLoading(false);
            return;
          }
        } catch (error) {
          // If lookbook doesn't exist, fetch products directly
          const products = await productApi.getProductsForStyle(persona);
          const items = products.map(convertProductToLookbookItem);
          setLookbookData({ ...metadata, items });
          setLoading(false);
          return;
        }
        
        // Convert lookbook items to display format
        const items = lookbook.items.map(item => convertProductToLookbookItem(item.product));
        setLookbookData({ ...metadata, items });
        
      } catch (err) {
        console.error('Error loading lookbook data:', err);
        setError('Failed to load lookbook data');
      } finally {
        setLoading(false);
      }
    };

    loadLookbookData();
  }, [persona, user]);

  // Load favorite items from localStorage
  useEffect(() => {
    if (user?.username) {
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
      const favoriteIds = new Set(savedFavorites.map((fav: any) => fav.id));
      setFavoriteItems(favoriteIds);
    }
  }, [user?.username]);

  // Load swipe results from localStorage when component mounts
  useEffect(() => {
    const loadSwipeResults = async () => {
      if (user?.username && persona) {
        const savedSwipeResults = getStorageData(STORAGE_KEYS.SWIPE_RESULTS, user.username, null);
        console.log('Loading swipe results for persona:', persona, savedSwipeResults);
        
        if (savedSwipeResults && savedSwipeResults.persona === persona) {
          const likedProductIds = savedSwipeResults.liked || [];
          const skippedProductIds = savedSwipeResults.skipped || [];
          
          console.log('Found swipe results:', { likedProductIds, skippedProductIds });
          
          if (likedProductIds.length > 0 || skippedProductIds.length > 0) {
            try {
              // Fetch all products to match against the stored IDs
              const allProducts = await productApi.getProductsForStyle(persona);
              console.log('Fetched products for matching:', allProducts.length);
              
              // Convert UUID to number for matching (same logic as homepage)
              const likedProducts = allProducts.filter(p => {
                const numericId = parseInt(p.id.replace(/-/g, '').substring(0, 8), 16);
                const isLiked = likedProductIds.includes(numericId);
                if (isLiked) {
                  console.log('Found liked product:', p.name, numericId);
                  console.log('Product image data:', { image_url: p.image_url, image: p.image });
                }
                return isLiked;
              }).map(p => {
                const converted = convertProductToLookbookItem(p);
                console.log('Converted product image:', converted.image);
                return converted;
              });
              
              const skippedProducts = allProducts.filter(p => {
                const numericId = parseInt(p.id.replace(/-/g, '').substring(0, 8), 16);
                const isSkipped = skippedProductIds.includes(numericId);
                if (isSkipped) {
                  console.log('Found skipped product:', p.name, numericId);
                  console.log('Product image data:', { image_url: p.image_url, image: p.image });
                }
                return isSkipped;
              }).map(p => {
                const converted = convertProductToLookbookItem(p);
                console.log('Converted product image:', converted.image);
                return converted;
              });
              
              console.log('Final swipe results:', { liked: likedProducts.length, skipped: skippedProducts.length });
              
              if (likedProducts.length > 0 || skippedProducts.length > 0) {
                setSwipeResults({
                  liked: likedProducts,
                  skipped: skippedProducts
                });
                console.log('Set swipe results state');
              }
            } catch (error) {
              console.error('Error loading swipe results:', error);
            }
          }
        } else {
          console.log('No matching swipe results found for persona:', persona);
        }
      }
    };
    
    loadSwipeResults();
  }, [user?.username, persona]);

  const handleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId);
      } else {
        newLiked.add(itemId);
      }
      return newLiked;
    });
  };

  const handleFavorite = (item: LookbookItem) => {
    if (!user?.username) return;
    
    const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    const isAlreadyFavorite = savedFavorites.some((fav: any) => fav.id === item.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...savedFavorites, { ...item, type: 'product' }];
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoriteItems(prev => new Set([...prev, item.id]));
      toast.success("Added to favorites!");
    } else {
      const updatedFavorites = savedFavorites.filter((fav: any) => fav.id !== item.id);
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoriteItems(prev => {
        const newFavs = new Set(prev);
        newFavs.delete(item.id);
        return newFavs;
      });
      toast.success("Removed from favorites!");
    }
  };

  const handleAddToCart = (item: LookbookItem) => {
    if (!user?.username) {
      toast.error('Please login to add items to your cart.');
      return;
    }
    
    const cart = getStorageData(STORAGE_KEYS.CART, user.username, []);
    const existing = cart.find((cartItem: any) => cartItem.id === item.id);
    
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({
        id: item.id,
        name: item.title,
        price: item.price,
        images: [item.image],
        category: item.category,
        quantity: 1
      });
    }
    
    setStorageData(STORAGE_KEYS.CART, cart, user.username);
    toast.success("Added to cart!");
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleTrendSwipe = () => {
    setShowTrendSwipe(true);
  };

  const handleSwipeComplete = async (liked: any[], skipped: any[]) => {
    setShowTrendSwipe(false);
    
    // Save swipe results to localStorage
    if (user?.username && persona) {
      const swipeData = {
        persona,
        liked: liked.map(p => p.id),
        skipped: skipped.map(p => p.id),
        timestamp: new Date().toISOString()
      };
      setStorageData(STORAGE_KEYS.SWIPE_RESULTS, swipeData, user.username);
    }
    
    // Fetch fresh products from backend API based on swipe results
    try {
      console.log('Fetching products after swipe completion...');
      
      // Fetch all products for the current persona/style
      const allProducts = await productApi.getProductsForStyle(persona || 'minimalist');
      console.log('Fetched products from API:', allProducts.length);
      
      // Convert liked products to LookbookItem format
      const likedProductItems = liked.map(swipedProduct => {
        // Find the corresponding product from API by matching ID
        const apiProduct = allProducts.find(p => {
          const numericId = parseInt(p.id.replace(/-/g, '').substring(0, 8), 16);
          return numericId === swipedProduct.id;
        });
        
        if (apiProduct) {
          return convertProductToLookbookItem(apiProduct);
        } else {
          // Fallback to the swipe product data if API product not found
          return {
            id: swipedProduct.id.toString(),
            title: swipedProduct.name,
            description: swipedProduct.name,
            category: 'Fashion',
            price: 99, // Default price
            image: swipedProduct.images[0] || '/placeholder.jpg',
            designer: 'Designer',
            rating: 4.5,
            reviews: 10,
            sizes: ['S', 'M', 'L'],
            colors: ['Black', 'White']
          };
        }
      });
      
      // Convert skipped products to LookbookItem format
      const skippedProductItems = skipped.map(swipedProduct => {
        const apiProduct = allProducts.find(p => {
          const numericId = parseInt(p.id.replace(/-/g, '').substring(0, 8), 16);
          return numericId === swipedProduct.id;
        });
        
        if (apiProduct) {
          return convertProductToLookbookItem(apiProduct);
        } else {
          return {
            id: swipedProduct.id.toString(),
            title: swipedProduct.name,
            description: swipedProduct.name,
            category: 'Fashion',
            price: 99,
            image: swipedProduct.images[0] || '/placeholder.jpg',
            designer: 'Designer',
            rating: 4.5,
            reviews: 10,
            sizes: ['S', 'M', 'L'],
            colors: ['Black', 'White']
          };
        }
      });
      
      console.log('Processed swipe results:', {
        liked: likedProductItems.length,
        skipped: skippedProductItems.length
      });
      
      // Update swipe results with properly formatted product data
      setSwipeResults({
        liked: likedProductItems,
        skipped: skippedProductItems
      });
      
      toast.success(`Trend swipe complete! You liked ${liked.length} items. Products loaded from database.`);
      
    } catch (error) {
      console.error('Error fetching products after swipe:', error);
      
      // Fallback to original swipe data if API call fails
      setSwipeResults({ liked, skipped });
      toast.success(`Trend swipe complete! You liked ${liked.length} items.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Loading Your Lookbook...</h1>
            <p className="text-muted-foreground">Curating the perfect pieces for your style</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !lookbookData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error || 'Lookbook Not Found'}
            </h1>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Use all items since lookbook is already personalized by quiz
  const displayItems = lookbookData.items;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <PageHero
        title={lookbookData.title}
        subtitle={lookbookData.description}
        backgroundGradient="from-pink-100 via-rose-50 to-pink-50"
      />







      {/* Trend Swipe Results */}
      {swipeResults && (
        <>
          {/* Results Header with Clear Button */}
          <section className="py-6 px-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                  Trend Swipe Results
                </h2>
                <p className="text-muted-foreground">
                  Based on your preferences, here are your liked and skipped products
                </p>
              </div>
              <button
                onClick={() => setSwipeResults(null)}
                className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
              >
                Clear Results
              </button>
            </div>
          </section>
          
          {/* Liked Products Section */}
          {swipeResults.liked.length > 0 && (
            <section className="py-8 px-6 bg-green-50/50">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="font-display text-2xl font-bold text-green-700">
                    Products You Liked ({swipeResults.liked.length} items)
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {swipeResults.liked.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      item={product}
                      likedItems={likedItems}
                      favoriteItems={favoriteItems}
                      onLike={handleLike}
                      onFavorite={handleFavorite}
                      onAddToCart={handleAddToCart}
                      user={user}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
          
          {/* Skipped Products Section */}
          {swipeResults.skipped.length > 0 && (
            <section className="py-8 px-6 bg-red-50/50">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h2 className="font-display text-2xl font-bold text-red-700">
                    Products You Skipped ({swipeResults.skipped.length} items)
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {swipeResults.skipped.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      item={product}
                      likedItems={likedItems}
                      favoriteItems={favoriteItems}
                      onLike={handleLike}
                      onFavorite={handleFavorite}
                      onAddToCart={handleAddToCart}
                      user={user}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Products Grid - Only show when no swipe results */}
      {!swipeResults && (
        <section className="py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Your Curated Collection ({displayItems.length} items)
              </h2>
            </div>
          
          {displayItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayItems.map(item => (
                <ProductCard
                  key={item.id}
                  item={item}
                  likedItems={likedItems}
                  favoriteItems={favoriteItems}
                  onLike={handleLike}
                  onFavorite={handleFavorite}
                  onAddToCart={handleAddToCart}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items found for this category.</p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* Trending Styles */}
      <section className="py-16 px-6 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">
            Trending in {lookbookData.title.replace(' Lookbook', '')}
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {lookbookData.trendingStyles.map(style => (
              <span
                key={style}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            Love Your Style Persona?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Take the quiz again or explore more styles to discover new fashion possibilities
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-primary/90"
            >
              Take Quiz Again
            </button>
            <button
              onClick={() => navigate('/trending-looks')}
              className="px-6 py-3 bg-card text-foreground border border-border rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-card/80"
            >
              Explore Trending Styles
            </button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Floating Sparkle Button */}
      <button
        onClick={handleTrendSwipe}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label="Open Trend Swipe"
      >
        <Sparkles className="w-8 h-8" />
      </button>
      
      {/* Trend Swipe Popup */}
      {lookbookData && (
        <TrendSwipePopup
          persona={persona || ''}
          products={lookbookData.items.map(convertToSwipeProduct)}
          isOpen={showTrendSwipe}
          onClose={() => setShowTrendSwipe(false)}
          onComplete={handleSwipeComplete}
        />
      )}
    </div>
  );
};

export default Lookbook;
