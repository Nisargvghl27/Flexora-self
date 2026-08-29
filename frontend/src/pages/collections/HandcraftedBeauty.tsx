import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { ShoppingBag } from 'lucide-react';

const HandcraftedBeauty = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <PageHero
          title="Handcrafted Beauty"
          subtitle="Artisan Collection"
          backgroundGradient="from-card via-secondary to-accent"
        />
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Traditional craftsmanship reimagined with modern silhouettes
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explore our artisan collection, where every piece is a work of art. Unique details and quality materials come together for a truly special wardrobe.
            </p>
            <div className="flex flex-col items-center gap-8">
              <div className="w-64 h-64 bg-gradient-to-br from-secondary/20 to-accent/30 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag className="w-16 h-16 text-primary/60" />
              </div>
              <div className="w-full">
                <h3 className="text-xl font-semibold text-foreground mb-4">Featured Products</h3>
                <div className="text-muted-foreground">(Products coming soon...)</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HandcraftedBeauty; 