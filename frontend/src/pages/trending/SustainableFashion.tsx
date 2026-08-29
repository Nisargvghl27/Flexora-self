
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const SustainableFashion = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Sustainable Fashion: Eco-Friendly Brands"
          subtitle="Discover how to build a conscious wardrobe that's kind to the planet"
          backgroundGradient="from-accent to-muted-foreground"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Lena Green</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>3 days ago</span>
                </div>
              </div>
              
              <div className="bg-card rounded-xl p-8 border border-border mb-8">
                <h2 className="text-2xl font-bold mb-4">Building a Sustainable Wardrobe</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Fashion doesn't have to cost the earth. Learn how to make conscious choices that reduce your environmental impact 
                  while still expressing your personal style through carefully curated, eco-friendly pieces.
                </p>
                
                <h3 className="text-xl font-semibold mb-4">Top Sustainable Fashion Brands:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Patagonia - Outdoor wear with a purpose</li>
                  <li>• Everlane - Radical transparency in production</li>
                  <li>• Reformation - Sustainable women's clothing</li>
                  <li>• Eileen Fisher - Timeless, eco-conscious designs</li>
                  <li>• Veja - Ethical sneakers and accessories</li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <Heart className="w-5 h-5" />
                    <span>267 likes</span>
                  </div>
                  <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                    <MessageCircle className="w-5 h-5" />
                    <span>32 comments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>890 views</span>
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

export default SustainableFashion;