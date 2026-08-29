
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const BohemianVibes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Bohemian Vibes: Free-Spirited Fashion"
          subtitle="Embrace earthy tones, flowy silhouettes, and a carefree approach to personal style"
          backgroundGradient="from-primary/30 to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Maya Silva</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>5 days ago</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <h2 className="text-2xl font-bold mb-4">The Soul of Boho Fashion</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Bohemian fashion celebrates individuality, freedom, and connection to nature. 
                  It’s a mix of vintage flair, global influences, and relaxed comfort, perfect for expressing your inner wanderer.
                </p>
                
                <h3 className="text-xl font-semibold mb-4">Key Elements:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Flowy maxi dresses and skirts</li>
                  <li>• Earthy colors and floral prints</li>
                  <li>• Fringe bags and layered jewelry</li>
                  <li>• Wide-brim hats and headbands</li>
                  <li>• Crochet tops and bell-bottom pants</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <Heart className="w-5 h-5" />
                    <span>298 likes</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                    <span>23 comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>980 views</span>
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

export default BohemianVibes;