
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Sparkles, Users, Calendar, Eye, Heart, ShoppingBag } from 'lucide-react';

const FormalStyle = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Formal Style"
          subtitle="Sophisticated elegance for special occasions and professional settings"
          backgroundGradient="from-accent to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="bg-card rounded-xl p-8 border border-border mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">About Formal Style</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Formal style embodies sophistication and elegance, perfect for special occasions, 
                    professional settings, and events where making a lasting impression matters. This style 
                    focuses on refined silhouettes, quality fabrics, and timeless designs that exude confidence.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Key Elements</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Evening Wear</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Elegant cocktail dresses</li>
                        <li>• Floor-length gowns</li>
                        <li>• Sophisticated blazers</li>
                        <li>• Tailored evening suits</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Professional Attire</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Power suits and separates</li>
                        <li>• Crisp button-down shirts</li>
                        <li>• Professional accessories</li>
                        <li>• Classic pumps and loafers</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Style Philosophy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Formal style is about presenting your best self with confidence and grace. 
                    It's characterized by attention to detail, impeccable fit, and the use of 
                    premium materials that stand the test of time.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Style Stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>12.5K followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>45.2K style views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span>8.7K likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Year-round appeal</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-slate-900 rounded"></div>
                    <div className="h-12 bg-slate-700 rounded"></div>
                    <div className="h-12 bg-slate-500 rounded"></div>
                    <div className="h-12 bg-slate-300 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/formal/products"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Formal Products
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

export default FormalStyle;
