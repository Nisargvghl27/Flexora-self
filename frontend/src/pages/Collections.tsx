
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Eye, MessageCircle, Palette, Layers, ShoppingBag } from 'lucide-react';
import { useAuth } from '../App';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';

const Collections = () => {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [favoriteCollections, setFavoriteCollections] = useState<Set<number>>(new Set());

  const collections = [
    {
      id: 1,
      title: "Summer Vibes Collection",
      designer: "Emma Chen",
      category: "Casual",
      season: "Summer 2024",
      itemCount: 24,
      views: 1234,
      likes: 234,
      description: "A vibrant collection perfect for sunny days and warm nights.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753987054/82c14db07a56b00953b6d2d0b35cff7a_wjhuas.jpg",
      slug: "summer-vibes"
    },
    {
      id: 2,
      title: "Elegant Evening Wear",
      designer: "Alex Rivera",
      category: "Formal",
      season: "Fall 2023",
      itemCount: 18,
      views: 1876,
      likes: 187,
      description: "Sophisticated dresses and suits for your special occasions.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753987176/6963ab890bbc454007356ecd0250d101_ugpsxp.jpg",
      slug: "elegant-evening-wear"
    },
    {
      id: 3,
      title: "Bohemian Dream",
      designer: "Sophie Laurent",
      category: "Bohemian",
      season: "Spring 2024",
      itemCount: 31,
      views: 2987,
      likes: 298,
      description: "Flowing fabrics and earthy tones for the free-spirited soul.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753987234/42b63da69ea98a553aa307e0f691935a_fvoi4k.jpg",
      slug: "bohemian-dream"
    },
    {
      id: 4,
      title: "Street Style Essentials",
      designer: "David Kim",
      category: "Streetwear",
      season: "Winter 2023",
      itemCount: 27,
      views: 1567,
      likes: 156,
      description: "Urban-inspired outfits for the fashion-forward individual.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753987332/4e6a23ab6a69693cb7898445617b8170_c54mwt.jpg",
      slug: "street-style-essentials"
    },
    {
      id: 5,
      title: "Minimalist Chic",
      designer: "Olivia White",
      category: "Minimalist",
      season: "Summer 2024",
      itemCount: 19,
      views: 2145,
      likes: 214,
      description: "Clean lines and neutral colors for a timeless, understated look.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753987411/18c4254e3196ad1fce93d92a6bd9c7cd_phxcpq.jpg",
      slug: "minimalist-chic"
    },
    {
      id: 6,
      title: "Vintage Revival",
      designer: "Ryan Green",
      category: "Vintage",
      season: "Fall 2023",
      itemCount: 35,
      views: 3256,
      likes: 325,
      description: "Classic styles reimagined for the modern era.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753987494/2f53d20d76df87c83ab6c5ce73020e3d_s9t6ff.jpg",
      slug: "vintage-revival"
    }
  ];

  const handleLike = (collectionId: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(collectionId)) {
        newLiked.delete(collectionId);
      } else {
        newLiked.add(collectionId);
      }
      return newLiked;
    });
  };

  // Load favorites when user is available
  useEffect(() => {
    if (user?.username) {
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
      const favoriteIds = new Set(savedFavorites.map((fav: any) => fav.id).filter((id: any) => typeof id === 'number')) as Set<number>;
      setFavoriteCollections(favoriteIds);
    }
  }, [user?.username]);

  const handleFavorite = (collection: any) => {
    if (!user?.username) return;
    
    const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    const isAlreadyFavorite = savedFavorites.some((fav: any) => fav.id === collection.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...savedFavorites, { ...collection, type: 'collection' }];
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoriteCollections(prev => new Set([...prev, collection.id]));
    } else {
      const updatedFavorites = savedFavorites.filter((fav: any) => fav.id !== collection.id);
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoriteCollections(prev => {
        const newFavs = new Set(prev);
        newFavs.delete(collection.id);
        return newFavs;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Collections"
          subtitle="Curated fashion collections from talented designers and students"
          backgroundGradient="from-accent/20 to-primary/30"
        />

        {/* Collections Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Featured Collections
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection, index) => (
                <article 
                  key={collection.id} 
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link to={`/collections/${collection.slug}`}>
                    <div className="relative h-64 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={collection.image} 
                        alt={collection.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                        {collection.itemCount} items
                      </div>
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Link 
                        to={`/categories/${collection.category.toLowerCase()}/products`}
                        className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        {collection.category}
                      </Link>
                    </div>
                    <Link to={`/collections/${collection.slug}`}>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                        {collection.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>by {collection.designer}</span>
                      <span>{collection.season}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button
                          onClick={() => handleLike(collection.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            likedPosts.has(collection.id) ? 'text-primary' : 'hover:text-primary'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(collection.id) ? 'fill-current' : ''}`} />
                          <span>{collection.likes + (likedPosts.has(collection.id) ? 1 : 0)}</span>
                        </button>
                        <div className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                          <span>{collection.views}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleFavorite(collection)}
                        className="transition-colors hover:scale-110 transform hover:text-primary"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    <Link 
                      to={`/categories/${collection.category.toLowerCase()}/products`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      View {collection.category} Products
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Collections;