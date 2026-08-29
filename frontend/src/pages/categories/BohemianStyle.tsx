import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Leaf, Heart, Eye, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const BohemianStyle = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Bohemian Style"
          subtitle="Earthy tones, vintage patterns, and relaxed silhouettes for a free-spirited and eclectic style"
          backgroundGradient="from-accent/20 to-secondary/30"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Leaf className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Embrace Your Free Spirit</h2>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-border mb-8">
              <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                Bohemian fashion celebrates individuality, creativity, and a carefree attitude. 
                It's about mixing textures, patterns, and vintage pieces to create looks that tell your unique story.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Boho Essentials:</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Key Pieces:</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Flowing maxi dresses</li>
                    <li>• Embroidered peasant blouses</li>
                    <li>• Wide-leg palazzo pants</li>
                    <li>• Vintage denim jackets</li>
                    <li>• Crochet cardigans</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Accessories:</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Layered jewelry</li>
                    <li>• Fringe bags</li>
                    <li>• Wide-brimmed hats</li>
                    <li>• Colorful scarves</li>
                    <li>• Ankle boots or sandals</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-accent/10 rounded-lg p-6">
                <h4 className="font-semibold mb-3">Styling Tips:</h4>
                <p className="text-muted-foreground">
                  Layer different textures and patterns fearlessly. Mix vintage finds with modern pieces, 
                  and don't be afraid to pile on the accessories. The key is to look effortlessly put-together 
                  while expressing your artistic soul.
                </p>
              </div>
            </div>

            <div className="text-center text-muted-foreground">
              <p className="text-lg">18 bohemian inspiration looks</p>
              <div className="flex items-center justify-center gap-6 mt-4 mb-8">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>1.8K followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>12.7K views</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>189 discussions</span>
                </div>
              </div>
              
              {/* Shop Products Button */}
              <Link 
                to="/categories/bohemian/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Bohemian Products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BohemianStyle;
