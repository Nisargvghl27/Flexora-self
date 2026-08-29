
import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, Layers, Calendar, User, Tag, ShoppingBag } from 'lucide-react';

const StreetStyleEssentials = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Street Style Essentials"
          subtitle="Urban-inspired outfits for the fashion-forward individual"
          backgroundGradient="from-accent/20 to-secondary/30"
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
                    The Street Style Essentials collection captures the energy and creativity of urban fashion. 
                    Bold graphics, contemporary cuts, and versatile pieces that seamlessly transition from 
                    day to night, perfect for the modern city dweller.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Featured Pieces</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Tops & Outerwear</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Graphic print hoodies</li>
                        <li>• Oversized bomber jackets</li>
                        <li>• Cropped leather jackets</li>
                        <li>• Statement t-shirts</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Bottoms & Accessories</h4>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• High-waisted cargo pants</li>
                        <li>• Distressed denim jeans</li>
                        <li>• Chunky sneakers</li>
                        <li>• Urban backpacks</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-8 border border-border">
                  <h3 className="text-xl font-semibold mb-4">Design Philosophy</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This collection celebrates individual expression through street culture and contemporary design. 
                    Each piece is designed to make a statement while maintaining comfort and functionality for everyday wear.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Collection Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Designer: David Kim</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Season: Winter 2023</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span>Category: Streetwear</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span>27 total items</span>
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
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Views</span>
                      </div>
                      <span className="font-medium">1.6K</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="h-12 bg-gray-900 rounded"></div>
                    <div className="h-12 bg-red-600 rounded"></div>
                    <div className="h-12 bg-blue-600 rounded"></div>
                    <div className="h-12 bg-green-600 rounded"></div>
                  </div>
                </div>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <Link 
                    to="/categories/streetwear/products"
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

export default StreetStyleEssentials;
