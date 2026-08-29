
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, Layers, Calendar, User, Tag, ShoppingBag } from 'lucide-react';

const BohemianDream = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Bohemian Dream"
          subtitle="Flowing fabrics and earthy tones for the free-spirited soul"
          backgroundGradient="from-secondary to-primary/20"
        />

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="bg-card rounded-xl p-8 border border-border mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Layers className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Collection Overview</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    The Bohemian Dream collection celebrates freedom of expression through fashion. 
                    Featuring flowing silhouettes, natural fabrics, and intricate patterns inspired 
                    by global cultures and artistic traditions.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Featured Pieces</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Dresses & Skirts</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Embroidered maxi dress</li>
                        <li>• Tiered peasant skirt</li>
                        <li>• Kimono-style wrap dress</li>
                        <li>• Fringe hem midi dress</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Tops & Accessories</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Crochet crop tops</li>
                        <li>• Bell-sleeve blouses</li>
                        <li>• Layered necklace sets</li>
                        <li>• Woven crossbody bags</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Design Philosophy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This collection draws inspiration from nomadic cultures, vintage textiles, and handcrafted artistry. 
                    Every piece tells a story of wanderlust and creative expression, perfect for those who march to their own beat.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Collection Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Designer: Sophie Laurent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Season: Spring 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>Category: Bohemian</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span>31 total items</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Engagement</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Likes</span>
                      </div>
                      <span className="font-medium">298</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Views</span>
                      </div>
                      <span className="font-medium">3.0K</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-amber-600 rounded"></div>
                    <div className="h-12 bg-orange-700 rounded"></div>
                    <div className="h-12 bg-emerald-600 rounded"></div>
                    <div className="h-12 bg-rose-400 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/bohemian/products"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BohemianDream;
