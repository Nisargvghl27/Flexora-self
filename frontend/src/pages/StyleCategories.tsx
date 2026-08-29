import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import { useAuth } from '../App';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';

const StyleCategories = () => {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [favoritePosts, setFavoritePosts] = useState<Set<number>>(new Set());

  const categories = [
    {
      name: 'Minimalist',
      description: 'Clean lines, neutral colors, and functional designs for a modern and simple style.',
      image: 'https://res.cloudinary.com/dlpuuekkl/image/upload/v1754023681/ed6992640292b1390dacd70bd14eb883_eomvq3.jpg',
      count: 24,
      gradient: 'from-primary/30 to-accent/20',
      link: '/categories/minimalist'
    },
    {
      name: 'Vintage',
      description: 'Classic cuts, retro prints, and timeless accessories inspired by past decades.',
      image: 'https://res.cloudinary.com/dlpuuekkl/image/upload/v1754023754/1458452e3a59cfcd7de95a391dbf8f3c_wu9tob.jpg',
      count: 31,
      gradient: 'from-secondary/30 to-primary/20',
      link: '/categories/vintage'
    },
    {
      name: 'Streetwear',
      description: 'Bold graphics, oversized fits, and urban-inspired elements for a trendy and edgy style.',
      image: 'https://res.cloudinary.com/dlpuuekkl/image/upload/v1754023828/be2838c5be147c154656b2a6759c5cbb_uasjgn.jpg',
      count: 27,
      gradient: 'from-accent/30 to-primary/20',
      link: '/categories/streetwear'
    },
    {
      name: 'Bohemian',
      description: 'Earthy tones, vintage patterns, and relaxed silhouettes for a free-spirited and eclectic style.',
      image: 'https://res.cloudinary.com/dlpuuekkl/image/upload/v1754024898/d89c9c96b2e3cd6fed259664e60527e3_jpsdyt.jpg',
      count: 18,
      gradient: 'from-accent/20 to-secondary/30',
      link: '/categories/bohemian'
    },
    {
      name: 'Formal',
      description: 'Sophisticated fabrics, tailored designs, and elegant details for a polished and refined style.',
      image: 'https://res.cloudinary.com/dlpuuekkl/image/upload/v1754024009/8d2042c922054d05fd4dfc7bd197118b_loopi0.jpg',
      count: 19,
      gradient: 'from-primary/20 to-secondary/30',
      link: '/categories/formal'
    },
    {
      name: 'Casual',
      description: 'Comfortable fabrics, effortless silhouettes, and stylish accents for a relaxed yet put-together style.',
      image: 'https://res.cloudinary.com/dlpuuekkl/image/upload/v1754024065/462431de5eab01e6f00ea6a0c1a31cfc_avzade.jpg',
      count: 35,
      gradient: 'from-secondary/20 to-accent/30',
      link: '/categories/casual'
    },
  ];

  const styleCards = [
    {
      id: 1,
      title: "Effortless Summer Style",
      author: "Emma Chen",
      likes: 234,
      comments: 18,
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754024148/8d662f1c5143ca1c3f0ac344fe1cc4a2_njjfqx.jpg"
    },
    {
      id: 2,
      title: "Sustainable Fashion Choices",
      author: "Alex Rivera",
      likes: 187,
      comments: 23,
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754024207/e232f46b97412f967b1229acf553e24a_gwap12.jpg"
    },
    {
      id: 3,
      title: "Mixing Vintage with Modern",
      author: "Sophie Laurent",
      likes: 298,
      comments: 31,
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754024280/95e5888f354aa3b9a31e6c07ea4d0ed3_s1jqny.jpg"
    }
  ];

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      return newLiked;
    });
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
        <PageHero 
          title="Style Categories"
          subtitle="Explore different fashion aesthetics and find your perfect style"
          backgroundGradient="from-primary/20 to-accent/30"
        />

        {/* Categories Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  to={category.link}
                  className="block"
                >
                  <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-48 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20`}></div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">
                          {category.count} items
                        </span>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Styles */}
        <section className="py-16 px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              Featured Styles
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {styleCards.map((card, index) => (
                <article 
                  key={card.id} 
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="h-48 relative overflow-hidden hover:scale-105 transition-transform duration-300">
                    <img 
                      src={card.image} 
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      by {card.author}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(card.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            likedPosts.has(card.id) ? 'text-primary' : 'hover:text-primary'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(card.id) ? 'fill-current' : ''}`} />
                          <span>{card.likes + (likedPosts.has(card.id) ? 1 : 0)}</span>
                        </button>
                        <div className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{card.comments}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleFavorite(card)}
                        className="transition-colors hover:scale-110 transform hover:text-primary"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
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

export default StyleCategories;