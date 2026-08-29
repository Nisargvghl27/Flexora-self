
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const VintageRevivalT = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Vintage Revival: Retro Fashion Inspirations"
          subtitle="Step back in time with timeless trends from the '50s to the '90s that continue to inspire modern style"
          backgroundGradient="from-primary/30 to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Clara Rossi</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>6 days ago</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <h2 className="text-2xl font-bold mb-4">The Charm of Retro Style</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Vintage fashion brings back the charm of past decades—each era offering its own unique vibe and flair. From the elegance of 
                  the '50s to the boldness of the '90s, retro fashion is about expressing nostalgia with a modern twist.
                </p>
                
                <h3 className="text-xl font-semibold mb-4">Key Elements:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Polka dot dresses and A-line skirts</li>
                  <li>• High-waisted denim and flared pants</li>
                  <li>• Cat-eye sunglasses and chunky heels</li>
                  <li>• Bold prints and graphic tees</li>
                  <li>• Vintage leather jackets and bomber coats</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <Heart className="w-5 h-5" />
                    <span>387 likes</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                    <span>54 comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>1.6K views</span>
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

export default VintageRevivalT;