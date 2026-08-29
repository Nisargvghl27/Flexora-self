import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const CasualSummer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <PageHero 
          title="Effortless Summer: Casual Staples"
          subtitle="Stay cool and stylish with these must-have casual pieces for summer."
          backgroundGradient="from-primary/30 to-accent/20"
        />
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Emma Chen</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>2 days ago</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Summer Casual Essentials</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Embrace the heat with lightweight fabrics, relaxed fits, and versatile basics. From breezy tees to comfy shorts and easy slip-on shoes, summer casual is all about comfort and effortless style.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Breathable cotton tees and tanks</li>
                <li>• Drawstring shorts and relaxed denim</li>
                <li>• Canvas sneakers and sandals</li>
                <li>• Minimal accessories for a fresh look</li>
              </ul>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <Heart className="w-5 h-5" />
                <span>175 likes</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <MessageCircle className="w-5 h-5" />
                <span>14 comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>1.1K views</span>
              </div>
            </div>
            <button className="flex items-center gap-2 hover:text-primary transition-colors mt-4">
              <span>Save</span>
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CasualSummer; 