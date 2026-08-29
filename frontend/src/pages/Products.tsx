import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Star, ShoppingBag, Filter, SortAsc } from 'lucide-react';
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useAuth } from '../App';
import { Skeleton } from '../components/ui/skeleton';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';
import { useProducts, useCategories } from '../hooks/useProducts';
import { Product } from '../services/api';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [favoriteProducts, setFavoriteProducts] = useState<Set<string>>(new Set());
  const [cartMessage, setCartMessage] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  // Use API hooks
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  // Load user-specific favorites when user is available
  useEffect(() => {
    if (user?.username) {
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
      setFavoriteProducts(new Set(savedFavorites.filter((item: any) => item.type === 'product').map((item: any) => item.id)));
    }
  }, [user?.username]);

  const filteredProducts = products.filter(product => 
    selectedCategory === 'All' || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'rating':
        // Since we don't have rating in the API yet, sort by stock quantity
        return b.stock_quantity - a.stock_quantity;
      case 'featured':
      default:
        // Sort by stock quantity for featured (higher stock = more featured)
        return b.stock_quantity - a.stock_quantity;
    }
  });

  const handleLike = (productId: string) => {
    setLikedProducts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(productId)) {
        newLiked.delete(productId);
      } else {
        newLiked.add(productId);
      }
      return newLiked;
    });
  };

  const handleFavorite = (product: Product) => {
    if (!user?.username) return;
    
    let savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    const isAlreadyFavorite = savedFavorites.some((fav: any) => fav.id === product.id && fav.type === 'product');
    if (isAlreadyFavorite) {
      savedFavorites = savedFavorites.filter((fav: any) => !(fav.id === product.id && fav.type === 'product'));
    } else {
      savedFavorites.push({ ...product, type: 'product' });
    }
    setStorageData(STORAGE_KEYS.FAVORITES, savedFavorites, user.username);
    setFavoriteProducts(new Set(savedFavorites.filter((item: any) => item.type === 'product').map((item: any) => item.id)));
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error('Please login to add items to your cart.');
      navigate('/login');
      return;
    }
    
    if (!user.username) {
      toast.error('User information not available.');
      return;
    }
    
    const cart = getStorageData(STORAGE_KEYS.CART, user.username, []);
    const existing = cart.find((item) => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
        selectedSize: 'M',
        selectedColor: 'Default'
      });
    }
    
    setStorageData(STORAGE_KEYS.CART, cart, user.username);
    setCartMessage(`Added ${product.name} to cart!`);
    toast.success(`Added ${product.name} to cart!`);
    
    setTimeout(() => setCartMessage(""), 3000);
  };

  if (productsError) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Error Loading Products</h2>
            <p className="text-muted-foreground">{productsError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
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
      <Toaster />
      
      <main className="w-full">
        <PageHero 
          title="All Products" 
          subtitle="Discover our complete collection of fashion items"
        />

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters and Sorting */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  All
                </button>
                {Array.from(new Set(categories)).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <SortAsc className="w-4 h-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <article key={index} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                    <Skeleton className="w-full h-64" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-16" />
                        <div className="flex gap-2">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="w-20 h-8 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product, index) => (
                  <article 
                    key={product.id}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link to={`/products/${product.id}`}>
                      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        {product.stock_quantity > 20 && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>

                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-display text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        by {product.brand || 'Flexora'}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.5</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          (124 reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground">
                            ${product.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart
                            className={`w-5 h-5 cursor-pointer ${favoriteProducts.has(product.id) ? 'fill-current text-primary' : ''}`}
                            onClick={() => handleFavorite(product)}
                          />
                          <button
                            onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                            className="ml-2 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                            aria-label="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4 inline-block mr-1" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!productsLoading && sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;