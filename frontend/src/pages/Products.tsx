import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Star, ShoppingBag, Filter, SortAsc, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/ui/skeleton';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';
import { useProducts, useCategories } from '../hooks/useProducts';
import { Product } from '../services/api';
import { ProductCardSkeleton } from '../components/Skeletons';
import { EmptyState } from '../components/EmptyState';
import { PageTransition } from '../components/PageTransition';
import { formatPrice } from '../lib/utils';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const limit = 12;

  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [favoriteProducts, setFavoriteProducts] = useState<Set<string>>(new Set());
  const [cartMessage, setCartMessage] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1); // Reset page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page on category or sort change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortBy]);

  // Use API hooks
  const { products, loading: productsLoading, error: productsError, total, totalPages } = useProducts(
    selectedCategory !== 'All' ? selectedCategory : undefined,
    undefined,
    searchQuery,
    sortBy,
    page,
    limit
  );
  const { categories, loading: categoriesLoading } = useCategories();

  // Load user-specific favorites when user is available
  useEffect(() => {
    if (user?.username) {
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
      setFavoriteProducts(new Set(savedFavorites.filter((item: any) => item.type === 'product').map((item: any) => item.id)));
    }
  }, [user?.username]);

  // Server-side filtering/sorting handles this now

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
    <PageTransition>
      <Navigation />
      <Toaster />
      
      <main className="w-full">
        <div className="hidden md:block">
          <PageHero 
            title="All Products" 
            subtitle="Discover our complete collection of fashion items"
          />
        </div>
        <div className="md:hidden pt-8 px-6 pb-2">
          <h1 className="text-3xl font-display font-bold text-foreground">All Products</h1>
        </div>

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Search, Filters and Sorting */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <SortAsc className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name A-Z</option>
                  </select>
                </div>
              </div>

              <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
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
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState 
                icon={Search} 
                title="No products found" 
                description="We couldn't find any products matching your search or filter criteria." 
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchInput('');
                  setSelectedCategory('All');
                  setSortBy('newest');
                }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product, index) => (
                  <article 
                    key={product.id}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <Link to={`/products/${product.id}`}>
                      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        {product.average_rating && product.average_rating >= 4.5 && product.review_count && product.review_count > 50 && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </div>
                        )}
                        {product.stock_quantity === 0 ? (
                          <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium">
                            Out of Stock
                          </div>
                        ) : product.stock_quantity < 10 ? (
                          <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Low Stock
                          </div>
                        ) : null}
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
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.average_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({product.review_count || 0} reviews)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart
                            className={`w-5 h-5 cursor-pointer ${favoriteProducts.has(product.id) ? 'fill-current text-primary' : ''}`}
                            onClick={() => handleFavorite(product)}
                          />
                          <button
                            onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                            disabled={product.stock_quantity === 0}
                            className={`ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-all sm:opacity-0 sm:group-hover:opacity-100 ${
                              product.stock_quantity === 0 
                                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                            aria-label="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4 inline-block sm:mr-1" />
                            <span className="hidden sm:inline">
                              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </span>
                            <span className="sm:hidden">
                              {product.stock_quantity === 0 ? 'Out' : 'Add'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!productsLoading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-card text-foreground"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= page - 1 && pageNumber <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            page === pageNumber
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border hover:bg-card text-foreground'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === page - 2 ||
                      pageNumber === page + 2
                    ) {
                      return <span key={pageNumber} className="w-10 h-10 flex items-center justify-center text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-card text-foreground"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default Products;
