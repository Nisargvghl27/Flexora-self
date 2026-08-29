
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const MinimalistWardrobe = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Minimalist Wardrobe: Capsule Collection"
          subtitle="Build a versatile and timeless wardrobe with fewer, better pieces"
          backgroundGradient="from-primary/30 to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Ethan White</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>1 week ago</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <h2 className="text-2xl font-bold mb-4">The Power of Simplicity</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  A minimalist wardrobe isn’t about having less—it’s about making more with what you already have. The capsule collection is built on timeless, interchangeable pieces that reflect your personal style without clutter or excess.
                </p>
                
                <h3 className="text-xl font-semibold mb-4">Key Elements:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Neutral-toned tops and bottoms</li>
                  <li>• A classic white button-down shirt</li>
                  <li>• High-quality denim jeans</li>
                  <li>• A tailored blazer or coat</li>
                  <li>• Versatile shoes and minimal accessories</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <Heart className="w-5 h-5" />
                    <span>245 likes</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                    <span>12 comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>850 views</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MinimalistWardrobe;