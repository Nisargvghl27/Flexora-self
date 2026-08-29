
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, Layers, Calendar, User, Tag, ShoppingBag } from 'lucide-react';

const ElegantEveningWear = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Elegant Evening Wear"
          subtitle="Sophisticated dresses and suits for your special occasions"
          backgroundGradient="from-accent to-secondary"
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
                    The Elegant Evening Wear collection features timeless pieces designed for formal occasions. 
                    From cocktail parties to black-tie events, each garment combines classic sophistication 
                    with modern cuts and luxurious fabrics.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Featured Pieces</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Dresses</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Black silk evening gown</li>
                        <li>• Navy blue cocktail dress</li>
                        <li>• Burgundy wrap dress</li>
                        <li>• Emerald green midi dress</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Suits & Accessories</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Tailored blazer set</li>
                        <li>• Statement jewelry collection</li>
                        <li>• Classic clutch bags</li>
                        <li>• Elegant heels and flats</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Design Philosophy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This collection emphasizes timeless elegance with attention to detail and quality craftsmanship. 
                    Each piece is designed to make the wearer feel confident and sophisticated at any formal event.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Collection Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Designer: Alex Rivera</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Season: Fall 2023</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>Category: Formal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span>18 total items</span>
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
                      <span className="font-medium">187</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Views</span>
                      </div>
                      <span className="font-medium">1.9K</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-slate-900 rounded"></div>
                    <div className="h-12 bg-navy-700 rounded"></div>
                    <div className="h-12 bg-red-800 rounded"></div>
                    <div className="h-12 bg-emerald-700 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/formal/products"
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

export default ElegantEveningWear;
