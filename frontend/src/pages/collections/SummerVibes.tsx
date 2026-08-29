
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, Layers, Calendar, User, Tag, ShoppingBag } from 'lucide-react';

const SummerVibes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Summer Vibes Collection"
          subtitle="A vibrant collection perfect for sunny days and warm nights"
          backgroundGradient="from-primary/30 to-accent"
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
                    The Summer Vibes Collection captures the essence of carefree summer days with lightweight fabrics, 
                    vibrant colors, and breezy silhouettes. Each piece is designed to keep you comfortable and stylish 
                    whether you're lounging by the beach or exploring the city.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Featured Pieces</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Dresses & Skirts</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Flowy maxi dress in sunset orange</li>
                        <li>• Wrap midi dress with tropical print</li>
                        <li>• Pleated mini skirt in coral</li>
                        <li>• Tiered sundress in white cotton</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Tops & Accessories</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Off-shoulder peasant blouse</li>
                        <li>• Cropped linen shirt</li>
                        <li>• Woven straw hat collection</li>
                        <li>• Beaded statement necklaces</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Design Philosophy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This collection draws inspiration from coastal living and the joy of summer adventures. 
                    We've focused on breathable fabrics like linen and cotton, incorporating hand-painted prints 
                    that reflect the beauty of sunset skies and ocean waves.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Collection Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Designer: Emma Chen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Season: Summer 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>Category: Casual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span>24 total items</span>
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
                      <span className="font-medium">234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Views</span>
                      </div>
                      <span className="font-medium">1.2K</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-orange-200 rounded"></div>
                    <div className="h-12 bg-coral-300 rounded"></div>
                    <div className="h-12 bg-sky-200 rounded"></div>
                    <div className="h-12 bg-yellow-100 rounded"></div>
                  </div>
                </div>

                {/* Shop Collection Button */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/collections/summer-vibes/products"
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

export default SummerVibes;