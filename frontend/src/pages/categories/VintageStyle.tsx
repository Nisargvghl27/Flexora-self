
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Clock, Users, Calendar, Eye, Heart, ShoppingBag } from 'lucide-react';

const VintageStyle = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Vintage Style"
          subtitle="Timeless pieces reimagined for the modern wardrobe"
          backgroundGradient="from-secondary/10 to-primary/30"
        />

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="bg-card rounded-xl p-8 border border-border mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">About Vintage Style</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Vintage style celebrates the fashion of bygone eras, bringing classic silhouettes 
                    and timeless designs into the contemporary world. This aesthetic combines nostalgia 
                    with modern sensibilities, creating looks that are both familiar and fresh.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Era Inspirations</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">1950s & 1960s</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Fit-and-flare dresses</li>
                        <li>• High-waisted skirts</li>
                        <li>• Peter Pan collars</li>
                        <li>• A-line silhouettes</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">1970s & 1980s</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Flared jeans and pants</li>
                        <li>• Bold patterns and prints</li>
                        <li>• Statement shoulders</li>
                        <li>• Retro accessories</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Modern Vintage</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Today's vintage style isn't about costume-like recreation, but rather about 
                    incorporating classic elements into contemporary wardrobes. It's about finding 
                    pieces that tell a story while fitting seamlessly into modern life.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Style Stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>18.3K followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>62.1K style views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span>11.2K likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Timeless appeal</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-amber-200 rounded"></div>
                    <div className="h-12 bg-rose-300 rounded"></div>
                    <div className="h-12 bg-emerald-200 rounded"></div>
                    <div className="h-12 bg-blue-200 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/vintage/products"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Vintage Products
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

export default VintageStyle;
