import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const CasualChic = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <PageHero 
          title="Casual Chic: Everyday Essentials"
          subtitle="Master the art of looking put-together with minimal effort."
          backgroundGradient="from-secondary/20 to-primary/10"
        />
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Ava Lee</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>1 day ago</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Everyday Casual Chic</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Casual chic is about blending comfort with style. Think tailored joggers, crisp tees, and a statement accessory or two. Effortless, but always polished.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Tailored joggers and chinos</li>
                <li>• Crisp, clean t-shirts</li>
                <li>• Lightweight jackets or cardigans</li>
                <li>• Minimalist sneakers or loafers</li>
              </ul>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <Heart className="w-5 h-5" />
                <span>160 likes</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <MessageCircle className="w-5 h-5" />
                <span>12 comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>800 views</span>
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

export default CasualChic; 