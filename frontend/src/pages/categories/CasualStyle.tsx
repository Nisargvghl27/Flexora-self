
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Sun, Users, Calendar, Eye, Heart, ShoppingBag } from 'lucide-react';

const CasualStyle = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Casual Style"
          subtitle="Relaxed and comfortable fashion for everyday living"
          backgroundGradient="from-primary/30 to-accent"
        />

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="bg-card rounded-xl p-8 border border-border mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Sun className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">About Casual Style</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Casual style is all about comfort, practicality, and effortless elegance. 
                    It's the perfect approach for everyday wear, combining relaxed fits with 
                    stylish details that make you look put-together without trying too hard.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Essential Pieces</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Everyday Comfort</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Soft cotton t-shirts</li>
                        <li>• Comfortable jeans</li>
                        <li>• Cozy sweaters</li>
                        <li>• Relaxed sundresses</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Smart Casual</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Casual blazers</li>
                        <li>• Stylish sneakers</li>
                        <li>• Simple accessories</li>
                        <li>• Versatile layers</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Effortless Elegance</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    The beauty of casual style lies in its versatility and ease. It's about 
                    creating looks that work from morning coffee runs to evening gatherings, 
                    always prioritizing comfort without sacrificing style.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Style Stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>25.7K followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span>78.9K style views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                      <span>15.4K likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>All seasons</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-blue-100 rounded"></div>
                    <div className="h-12 bg-green-100 rounded"></div>
                    <div className="h-12 bg-yellow-100 rounded"></div>
                    <div className="h-12 bg-pink-100 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/casual/products"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop Casual Products
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

export default CasualStyle;