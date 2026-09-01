
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Heart, Star, ShoppingBag, Truck, Shield, RotateCcw, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/ui/skeleton';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';
import { useProduct } from '../hooks/useProducts';
import { Product, apiService, WishlistItem, Review } from '../services/api';
import { PageTransition } from '../components/PageTransition';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import ShareButton from '../components/ui/ShareButton';
import { formatPrice } from '../lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id || '');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('Default');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug logging
  useEffect(() => {
  }, [id, product, loading, error]);

  // Track recently viewed products
  useEffect(() => {
    if (product && product.id) {
      const recentlyViewed = getStorageData(STORAGE_KEYS.RECENTLY_VIEWED, undefined, []);
      // Remove if already exists to move to front
      const filtered = recentlyViewed.filter((p: any) => p.id !== product.id);
      // Add current product to front, keeping essential info
      filtered.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        brand: product.brand,
        viewedAt: new Date().toISOString()
      });
      // Keep only last 10
      const limited = filtered.slice(0, 10);
      setStorageData(STORAGE_KEYS.RECENTLY_VIEWED, limited);
    }
  }, [product]);

  // Load favorite status when user is available
  useEffect(() => {
    const checkFavorite = async () => {
      if (user?.username && product) {
        // Logged in user: Check via API
        const res = await apiService.getWishlist();
        if (res.data) {
          const isProductFavorite = res.data.some((item: WishlistItem) => item.product_id === product.id);
          setIsFavorite(isProductFavorite);
        }
      } else if (product) {
        // Guest user: Check localStorage
        const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, undefined, []);
        const isProductFavorite = savedFavorites.some((fav: any) => fav.id === product.id && fav.type === 'product');
        setIsFavorite(isProductFavorite);
      }
    };
    checkFavorite();
  }, [user, product]);

  // Load reviews
  useEffect(() => {
    if (product?.id) {
      apiService.getProductReviews(product.id).then(res => {
        if (res.data) setReviews(res.data);
      });
    }
  }, [product?.id]);

  const hasReviewed = user ? reviews.some(r => r.user_id === user.user_id) : false;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    setSubmittingReview(true);
    const res = await apiService.addProductReview(product.id, newReviewRating, newReviewText);
    setSubmittingReview(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Review submitted!");
      // Refetch reviews
      const updatedReviews = await apiService.getProductReviews(product.id);
      if (updatedReviews.data) setReviews(updatedReviews.data);
      setNewReviewText('');
    }
  };

  if (error) {
    console.error('ProductDetail Error:', error);
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Product</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">Product ID: {id}</p>
            <Link to="/products" className="text-primary hover:underline">
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">Product ID: {id}</p>
            <Link to="/products" className="text-primary hover:underline">
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (user) {
      // Add via API for logged in users
      const res = await apiService.addToCart({
        product_id: product.id,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor
      });
      
      if (res.error) {
        toast.error(res.error);
        return;
      }
      
      toast.success("Added to cart!");
      window.dispatchEvent(new Event('cart-updated'));
    } else {
      // Add via localStorage for guests
      const cart = getStorageData(STORAGE_KEYS.CART, undefined, []);
      const existing = cart.find((item: any) => item.id === product.id && item.size === selectedSize && item.color === selectedColor);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity
        });
      }
      setStorageData(STORAGE_KEYS.CART, cart);
      toast.success("Added to cart!");
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const handleFavorite = async () => {
    if (!product) return;
    
    if (user) {
      // Toggle via API
      if (isFavorite) {
        const res = await apiService.removeWishlistItemByProduct(product.id);
        if (!res.error) {
          setIsFavorite(false);
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await apiService.addToWishlist(product.id);
        if (!res.error) {
          setIsFavorite(true);
          toast.success("Added to wishlist!");
        }
      }
    } else {
      // Toggle via localStorage
      let savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, undefined, []);
      const isAlreadyFavorite = savedFavorites.some((fav: any) => fav.id === product.id && fav.type === 'product');
      if (isAlreadyFavorite) {
        savedFavorites = savedFavorites.filter((fav: any) => !(fav.id === product.id && fav.type === 'product'));
        toast.success("Removed from favorites");
      } else {
        savedFavorites.push({ ...product, type: 'product' });
        toast.success("Added to favorites!");
      }
      setStorageData(STORAGE_KEYS.FAVORITES, savedFavorites);
      setIsFavorite(!isAlreadyFavorite);
    }
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="w-full">
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <Skeleton className="w-full h-96 rounded-xl" />
                  <div className="flex gap-4 mt-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <Skeleton className="w-20 h-20 rounded-lg" />
                  </div>
                </div>
                <div className="space-y-6">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="w-12 h-12" />
                    <Skeleton className="w-12 h-12" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <PageTransition>
      <Navigation />
      
      <main className="w-full">
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl flex items-center justify-center">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {product.category}
                      </span>
                      {product.average_rating && product.average_rating >= 4.5 && product.review_count && product.review_count > 50 && (
                        <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                          Featured
                        </span>
                      )}
                      {product.stock_quantity === 0 ? (
                        <span className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      ) : product.stock_quantity < 10 ? (
                        <span className="text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                          Low Stock
                        </span>
                      ) : null}
                    </div>
                    <ShareButton 
                      title={product.name}
                      text={`Check out ${product.name} on Flexora`}
                      url={window.location.href}
                    />
                  </div>
                  
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    {product.name}
                  </h1>
                  
                  <p className="text-lg text-muted-foreground mb-4">
                    by {product.brand || 'Flexora'}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({product.review_count || 0} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>

                  {/* Size Selection */}
                  <div>
                    <h3 className="font-semibold mb-3">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 border rounded-lg transition-colors ${
                            selectedSize === size
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <h3 className="font-semibold mb-3">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Default', hex: '#E5E7EB' }, // gray-200
                        { name: 'Black', hex: '#000000' },
                        { name: 'White', hex: '#FFFFFF' },
                        { name: 'Blue', hex: '#3B82F6' } // blue-500
                      ].map(color => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                          className={`w-10 h-10 rounded-full border-2 transition-transform ${
                            selectedColor === color.name
                              ? 'border-primary scale-110'
                              : 'border-transparent hover:scale-105 shadow-sm'
                          }`}
                          style={{ backgroundColor: color.hex, borderColor: selectedColor === color.name ? 'hsl(var(--primary))' : color.name === 'White' ? '#e5e7eb' : 'transparent' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <h3 className="font-semibold mb-3">Quantity</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 border border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock_quantity === 0}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                        product.stock_quantity === 0
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={handleFavorite}
                      className={`px-4 py-3 border rounded-lg transition-colors ml-2 ${
                        isFavorite ? 'border-primary text-primary' : 'border-border hover:border-primary'
                      }`}
                      aria-label="Favorite"
                    >
                      <Heart
                        className={`w-5 h-5 cursor-pointer ${isFavorite ? 'fill-current text-primary' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                    <div className="text-center">
                      <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Free Shipping</p>
                      <p className="text-xs text-muted-foreground">On orders over $100</p>
                    </div>
                    <div className="text-center">
                      <RotateCcw className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Easy Returns</p>
                      <p className="text-xs text-muted-foreground">30-day return policy</p>
                    </div>
                    <div className="text-center">
                      <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium">Secure Payment</p>
                      <p className="text-xs text-muted-foreground">SSL encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-20 border-t border-border pt-12">
              <h2 className="text-2xl font-bold font-display mb-8">Customer Reviews</h2>
              
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-semibold mb-6">Write a Review</h3>
                  {user ? (
                    hasReviewed ? (
                      <div className="bg-accent/10 p-6 rounded-xl border border-accent/20">
                        <p className="font-medium text-accent-foreground">You already reviewed this product.</p>
                        <p className="text-sm text-muted-foreground mt-2">Thank you for your feedback!</p>
                      </div>
                    ) : (
                      <form onSubmit={submitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-8 h-8 transition-colors ${
                                    star <= newReviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Review</label>
                          <textarea
                            required
                            rows={4}
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="What do you think about this product?"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )
                  ) : (
                    <div className="bg-muted/30 p-6 rounded-xl border border-border">
                      <p className="mb-4">Please log in to write a review.</p>
                      <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-6">Recent Reviews ({reviews.length})</h3>
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground italic">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-border pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{review.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                              />
                            ))}
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-foreground/80 mt-2">{review.review_text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default ProductDetail;
