
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { apiService, Product as ApiProduct } from '../services/api';
import { Heart, Star, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';

const CategoryProducts = () => {
  const { category } = useParams<{ category: string }>();
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const categoryName = category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getProductsByCategory(categoryName);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setProducts(response.data);
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchProducts();
    }
  }, [categoryName]);

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

  const getGradientForCategory = (category: string) => {
    switch (category) {
      case 'Minimalist':
        return 'from-primary/30 to-accent/20';
      case 'Bohemian':
        return 'from-accent/20 to-secondary/30';
      case 'Formal':
        return 'from-secondary/30 to-primary/20';
      case 'Streetwear':
        return 'from-accent/30 to-primary/20';
      case 'Vintage':
        return 'from-secondary/20 to-accent/30';
      case 'Casual':
        return 'from-primary/20 to-secondary/30';
      default:
        return 'from-primary/20 to-accent/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading products...</span>
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
          title={`${categoryName} Products`}
          subtitle={`Discover our curated ${categoryName.toLowerCase()} collection`}
          backgroundGradient={getGradientForCategory(categoryName)}
        />

        {/* Breadcrumb */}
        <section className="py-6 px-6 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/products" className="hover:text-primary flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                All Products
              </Link>
              <span>/</span>
              <span className="text-foreground">{categoryName}</span>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {error ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Products</h2>
                <p className="text-muted-foreground mb-6">
                  {error}
                </p>
                <Link 
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse All Products
                </Link>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">No Products Found</h2>
                <p className="text-muted-foreground mb-6">
                  We don't have any products in the {categoryName} category yet.
                </p>
                <Link 
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse All Products
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-foreground">
                    {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                  </h2>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <article 
                      key={product.id}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link to={`/products/${product.id}`}>
                        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-12 h-12 text-primary/60" />
                          )}
                          {product.stock_quantity > 20 && (
                            <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                              Featured
                            </div>
                          )}
                          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                            <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Low Stock
                            </div>
                          )}
                          {product.stock_quantity === 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Out of Stock
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                          {product.brand && (
                            <span className="text-xs text-muted-foreground">
                              {product.brand}
                            </span>
                          )}
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
                            (New)
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-foreground">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleLike(product.id)}
                            className={`transition-colors hover:scale-110 transform ${
                              likedProducts.has(product.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        <div className="mt-3 text-sm text-muted-foreground">
                          Stock: {product.stock_quantity} available
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryProducts;