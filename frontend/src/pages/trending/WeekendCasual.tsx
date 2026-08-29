import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Heart, Eye, MessageCircle, Clock, User } from 'lucide-react';

const WeekendCasual = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <PageHero 
          title="Weekend Comfort: Relaxed Denim & Tees"
          subtitle="Unwind in style with the best of weekend casual fashion."
          backgroundGradient="from-accent/10 to-secondary/20"
        />
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>by Noah Kim</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>3 days ago</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Relaxed Weekend Staples</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The weekend is for comfort and ease. Think soft tees, broken-in denim, and slip-on shoes. Layer with a hoodie or flannel for cool mornings and evenings.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Relaxed fit jeans and joggers</li>
                <li>• Graphic and plain tees</li>
                <li>• Lightweight hoodies and flannels</li>
                <li>• Simple sneakers or slides</li>
              </ul>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <Heart className="w-5 h-5" />
                <span>142 likes</span>
              </div>
              <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <MessageCircle className="w-5 h-5" />
                <span>10 comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>900 views</span>
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

export default WeekendCasual; 