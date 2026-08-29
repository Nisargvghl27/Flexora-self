import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Sparkles, Heart, Eye, MessageCircle, ShoppingBag } from 'lucide-react';

const MinimalistStyle = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Minimalist Style"
          subtitle="Clean lines, neutral colors, and functional designs for a modern and simple style"
          backgroundGradient="from-primary/30 to-accent/20"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">The Art of Less is More</h2>
            </div>
            
            <div className="bg-card rounded-xl p-8 border border-border mb-8">
              <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                Minimalist fashion is about curating a wardrobe that focuses on quality over quantity. 
                It's characterized by clean lines, neutral color palettes, and timeless pieces that work together seamlessly.
              </p>
              
              <h3 className="text-xl font-semibold mb-4">Essential Minimalist Pieces:</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Tops:</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• White button-down shirt</li>
                    <li>• Black turtleneck</li>
                    <li>• Neutral cashmere sweater</li>
                    <li>• Basic t-shirts in white, black, gray</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Bottoms:</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Tailored black trousers</li>
                    <li>• Dark wash jeans</li>
                    <li>• A-line midi skirt</li>
                    <li>• Wide-leg pants</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-accent/10 rounded-lg p-6">
                <h4 className="font-semibold mb-3">Color Palette:</h4>
                <p className="text-muted-foreground">
                  Stick to a neutral base of black, white, gray, beige, and navy. Add subtle touches with 
                  muted earth tones like camel, olive, or soft pastels for variety.
                </p>
              </div>
            </div>

            <div className="text-center text-muted-foreground">
              <p className="text-lg">24 curated minimalist looks available</p>
              <div className="flex items-center justify-center gap-6 mt-4 mb-8">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>2.1K followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>15.3K views</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>234 discussions</span>
                </div>
              </div>
              
              {/* Shop Products Button */}
              <Link 
                to="/categories/minimalist/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Minimalist Products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MinimalistStyle;
