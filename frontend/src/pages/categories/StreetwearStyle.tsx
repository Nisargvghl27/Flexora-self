
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Zap, Users, Calendar, Eye, Heart, ShoppingBag } from 'lucide-react';

const StreetwearStyle = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Streetwear Style"
          subtitle="Urban fashion with attitude and edge"
          backgroundGradient="from-accent/30 to-primary/20"
        />

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="bg-card rounded-xl p-8 border border-border mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">About Streetwear Style</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Streetwear style is rooted in urban culture and youth movements, combining 
                    comfort with bold statements. It's characterized by oversized fits, 
                    graphic elements, and a mix of high and low fashion that reflects 
                    contemporary street culture.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Key Elements</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Statement Pieces</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Graphic hoodies and tees</li>
                        <li>• Oversized outerwear</li>
                        <li>• Bold sneakers</li>
                        <li>• Statement accessories</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Urban Essentials</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Distressed denim</li>
                        <li>• Cargo pants</li>
                        <li>• Baseball caps</li>
                        <li>• Chain jewelry</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Urban Expression</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Streetwear is more than fashion—it's a form of self-expression that 
                    reflects personal style and cultural identity. It's about mixing high-end 
                    pieces with affordable finds to create unique, authentic looks.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Style Stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>32.1K followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>95.6K style views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span>21.8K likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>All year round</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-black rounded"></div>
                    <div className="h-12 bg-gray-600 rounded"></div>
                    <div className="h-12 bg-red-500 rounded"></div>
                    <div className="h-12 bg-yellow-400 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/streetwear/products"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Streetwear Products
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

export default StreetwearStyle;