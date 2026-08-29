import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { ShoppingBag } from 'lucide-react';

const ConsciousChoices = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full">
        <PageHero
          title="Conscious Choices"
          subtitle="Sustainable Fashion"
          backgroundGradient="from-secondary via-accent to-card"
        />
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Eco-friendly materials crafted into beautiful, lasting pieces
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover our sustainable collection, where mindful design meets modern style. Each piece is made to last, with the planet and your wardrobe in mind.
            </p>
            <div className="flex flex-col items-center gap-8">
              <div className="w-64 h-64 bg-gradient-to-br from-accent/20 to-primary/30 rounded-2xl flex items-center justify-center mb-6">
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

export default ConsciousChoices; 