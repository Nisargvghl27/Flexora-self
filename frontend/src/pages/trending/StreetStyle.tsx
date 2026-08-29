
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const StreetStyle = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="StreetStyle: Urban Fashion Trends"
          subtitle="Explore the edgy, ever-evolving world of streetwear that defines youth culture"
          backgroundGradient="from-primary/30 to-secondary"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Kenji Tanaka</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>2 days ago</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <h2 className="text-2xl font-bold mb-4">The Pulse of Urban Fashion</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Street style is all about self-expression, attitude, and capturing the vibe of the city. 
                  It's where fashion meets function, often blending retro elements with bold modern twists.
                  What started on sidewalks has now shaped runways and global trends.
                </p>
                
                <h3 className="text-xl font-semibold mb-4">Key Elements:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Oversized hoodies and graphic tees</li>
                  <li>• Chunky sneakers and statement footwear</li>
                  <li>• Crossbody bags and layered accessories</li>
                  <li>• Distressed denim and cargo pants</li>
                  <li>• Bucket hats and bold caps</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <Heart className="w-5 h-5" />
                    <span>456 likes</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                    <span>67 comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>2.3K views</span>
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

export default StreetStyle;