
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import PageHero from '../../components/PageHero';
import { Award, Heart, Eye, Users, Calendar, MapPin, GraduationCap } from 'lucide-react';

const SarahMartinez = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="w-full">
        <PageHero 
          title="Sarah Martinez"
          subtitle="Sustainable Fashion Designer & Environmental Advocate"
          backgroundGradient="from-primary/20 to-accent/30"
        />

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="bg-card rounded-xl p-8 border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-6 h-6 text-primary" />
                    <span className="text-primary font-semibold">Featured Designer of the Month</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">About Sarah</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Sarah Martinez is a senior fashion design student at Parsons School of Design, known for her 
                    innovative approach to sustainable fashion. Her work combines traditional craftsmanship with 
                    modern aesthetics, creating pieces that are both beautiful and environmentally conscious.
                  </p>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Sarah's passion for sustainability began during her sophomore year when she studied the environmental 
                    impact of fast fashion. Since then, she's been dedicated to creating clothing that tells a story 
                    of responsibility and style.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4">Recent Achievements</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Winner of the 2024 Sustainable Fashion Design Challenge</li>
                    <li>• Featured in Vogue's "Young Designers to Watch" article</li>
                    <li>• Sustainable Fashion Week runway debut</li>
                    <li>• Collaboration with local organic cotton farmers</li>
                    <li>• Zero-waste collection launch</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Profile</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>Senior, Fashion Design</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>New York, NY</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Graduating May 2024</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Followers</span>
                      </div>
                      <span className="font-medium">1.2K</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Designs</span>
                      </div>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Awards</span>
                      </div>
                      <span className="font-medium">5</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Specialty Focus</h3>
                  <div className="space-y-2">
                    <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      Sustainable Fashion
                    </span>
                    <span className="inline-block bg-accent/10 text-accent-foreground px-3 py-1 rounded-full text-sm">
                      Zero Waste Design
                    </span>
                    <span className="inline-block bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full text-sm">
                      Eco Materials
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SarahMartinez;