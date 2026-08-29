
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, Layers, Calendar, User, Tag, ShoppingBag } from 'lucide-react';

const VintageRevival = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Vintage Revival"
          subtitle="Classic styles reimagined for the modern era"
          backgroundGradient="from-secondary/10 to-primary/30"
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
                    The Vintage Revival collection brings timeless fashion from past decades into the present. 
                    Each piece captures the essence of vintage style while incorporating modern fits and 
                    contemporary details for today's fashion enthusiasts.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Featured Pieces</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Retro Classics</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• 1950s circle skirts</li>
                        <li>• 1960s mod dresses</li>
                        <li>• 1970s flare jeans</li>
                        <li>• 1980s power blazers</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Vintage Accessories</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Classic pearl jewelry</li>
                        <li>• Retro cat-eye glasses</li>
                        <li>• Vintage-inspired handbags</li>
                        <li>• Oxford shoes</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Design Philosophy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This collection honors the craftsmanship and elegance of bygone eras while adapting 
                    these classic designs for modern lifestyles. Each piece tells a story of fashion history 
                    while remaining relevant and wearable today.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Collection Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Designer: Ryan Green</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Season: Fall 2023</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>Category: Vintage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span>35 total items</span>
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
                      <span className="font-medium">325</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Views</span>
                      </div>
                      <span className="font-medium">3.3K</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-rose-300 rounded"></div>
                    <div className="h-12 bg-emerald-400 rounded"></div>
                    <div className="h-12 bg-amber-300 rounded"></div>
                    <div className="h-12 bg-blue-400 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/vintage/products"
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

export default VintageRevival;