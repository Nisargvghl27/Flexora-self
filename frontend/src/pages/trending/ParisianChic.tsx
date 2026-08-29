
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const ParisianChic = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Parisian Chic: Effortless Style Guide"
          subtitle="Master the art of effortless French elegance with timeless pieces"
          backgroundGradient="from-primary/30 to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Amelie Dubois</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>2 days ago</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <h2 className="text-2xl font-bold mb-4">The Essence of Parisian Style</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Parisian chic is not about following trends—it's about creating a timeless wardrobe that exudes confidence and sophistication. 
                  The key is to invest in quality basics and learn the art of effortless styling.
                </p>
                
                <h3 className="text-xl font-semibold mb-4">Key Elements:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Well-fitted blazers in neutral tones</li>
                  <li>• Classic trench coats</li>
                  <li>• High-quality silk scarves</li>
                  <li>• Perfectly tailored trousers</li>
                  <li>• Simple, elegant accessories</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <Heart className="w-5 h-5" />
                    <span>321 likes</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                    <span>45 comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>1.2K views</span>
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

export default ParisianChic;