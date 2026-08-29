import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Heart, Eye, MessageCircle, Star, Award, Users } from 'lucide-react';
import { useAuth } from '../App';
import { getStorageData, setStorageData, STORAGE_KEYS } from '../lib/storage';

const StudentSpotlights = () => {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [favoriteStudents, setFavoriteStudents] = useState<Set<number>>(new Set());

  const students = [
    {
      id: 1,
      name: "Sarah Martinez",
      specialty: "Sustainable Fashion",
      year: "Senior",
      bio: "A talented designer passionate about eco-friendly fashion.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754201052/fa6f61253506d011586fbba27a63445b_f3dfsn.jpg",
      followers: 890,
      designs: 32
    },
    {
      id: 2,
      name: "Alex Chen",
      specialty: "Streetwear",
      year: "Junior",
      bio: "Creating urban-inspired designs with a unique cultural twist.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754201310/e62c73ef83df6fb30e7b183003440e24_y1jd56.jpg",
      followers: 670,
      designs: 28
    },
    {
      id: 3,
      name: "Priya Sharma",
      specialty: "Formal Wear",
      year: "Sophomore",
      bio: "Crafting elegant and timeless pieces for special occasions.",
      image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754201353/4eff84d0cf652d620a109461b8403226_cmzfcj.jpg",
      followers: 750,
      designs: 25
    }
  ];

  const handleLike = (studentId: number) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(studentId)) {
        newLiked.delete(studentId);
      } else {
        newLiked.add(studentId);
      }
      return newLiked;
    });
  };

  // Load favorites when user is available
  useEffect(() => {
    if (user?.username) {
      const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
      const favoriteIds = new Set(savedFavorites.map((fav: any) => fav.id).filter((id: any) => typeof id === 'number')) as Set<number>;
      setFavoriteStudents(favoriteIds);
    }
  }, [user?.username]);

  const handleFavorite = (student: any) => {
    if (!user?.username) return;
    
    const savedFavorites = getStorageData(STORAGE_KEYS.FAVORITES, user.username, []);
    const isAlreadyFavorite = savedFavorites.some((fav: any) => fav.id === student.id);
    
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...savedFavorites, { ...student, type: 'student' }];
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoriteStudents(prev => new Set([...prev, student.id]));
    } else {
      const updatedFavorites = savedFavorites.filter((fav: any) => fav.id !== student.id);
      setStorageData(STORAGE_KEYS.FAVORITES, updatedFavorites, user.username);
      setFavoriteStudents(prev => {
        const newFavs = new Set(prev);
        newFavs.delete(student.id);
        return newFavs;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Student Spotlights"
          subtitle="Celebrating creativity and talent from our fashion community"
          backgroundGradient="from-secondary/30 to-primary/20"
        />

        {/* Featured Student */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <Award className="w-6 h-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Featured Designer of the Month
              </h2>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg animate-fade-in">
              <div className="h-80 bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dlpuuekkl/image/upload/v1754201201/f7f00a748f183f30b2f52ad47b400e58_gw6jmc.jpg" 
                  alt="Sarah Martinez - Featured Designer" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-5 h-5 text-primary fill-current" />
                  <span className="text-sm font-medium text-primary">Featured Designer</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  Sarah Martinez
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  A talented fashion design student known for her innovative approach to sustainable fashion. 
                  Sarah's work combines traditional craftsmanship with modern aesthetics, creating pieces that 
                  are both beautiful and environmentally conscious.
                </p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>1.2K followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>24 designs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>5 awards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Grid */}
        <section className="py-16 px-6 bg-card/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              Rising Stars
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => (
                <article 
                  key={student.id} 
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={student.image} 
                      alt={`${student.name} - ${student.specialty}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {student.specialty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {student.year}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      {student.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {student.bio}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(student.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            likedPosts.has(student.id) ? 'text-primary' : 'hover:text-primary'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(student.id) ? 'fill-current' : ''}`} />
                          <span>{student.followers + (likedPosts.has(student.id) ? 1 : 0)}</span>
                        </button>
                        <div className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                          <span>{student.designs}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleFavorite(student)}
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

export default StudentSpotlights;
