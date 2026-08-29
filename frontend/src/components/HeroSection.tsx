
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const outfits = [
  {
    id: 1,
    title: "Minimalist Elegance",
    description: "Clean lines meet sophisticated styling",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=600&fit=crop",
    category: "Formal"
  },
  {
    id: 2,
    title: "Sustainable Chic",
    description: "Eco-conscious fashion that doesn't compromise on style",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=600&fit=crop",
    category: "Casual"
  },
  {
    id: 3,
    title: "Urban Streetwear",
    description: "Bold statements for the modern trendsetter",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=500&h=600&fit=crop",
    category: "Streetwear"
  }
];

const HeroSection = () => {
  const [currentOutfit, setCurrentOutfit] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOutfit((prev) => (prev + 1) % outfits.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextOutfit = () => {
    setCurrentOutfit((prev) => (prev + 1) % outfits.length);
  };

  const prevOutfit = () => {
    setCurrentOutfit((prev) => (prev - 1 + outfits.length) % outfits.length);
  };

  return (
    <section className="relative overflow-hidden gradient-hero py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-charcoal leading-tight">
                Discover Your
                <span className="block text-terracotta">Style Story</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Explore trending looks, connect with style innovators, and express your unique fashion voice in our curated community.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore Trends
              </Button>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Take Style Quiz
              </Button>
            </div>
          </div>

          {/* Outfit Carousel */}
          <div className="relative">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="font-playfair text-2xl font-semibold text-charcoal mb-2">
                  Outfit of the Week
                </h2>
                <div className="flex justify-center space-x-2 mb-4">
                  {outfits.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentOutfit ? "bg-primary" : "bg-muted"
                      }`}
                      onClick={() => setCurrentOutfit(index)}
                    />
                  ))}
                </div>
              </div>

              <div className="relative aspect-[3/4] bg-cream rounded-2xl overflow-hidden">
                <img
                  src={outfits[currentOutfit].image}
                  alt={outfits[currentOutfit].title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevOutfit}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-charcoal" />
                </button>
                <button
                  onClick={nextOutfit}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                >
                  <ChevronRight className="h-5 w-5 text-charcoal" />
                </button>
              </div>

              <div className="text-center mt-6">
                <h3 className="font-playfair text-xl font-semibold text-charcoal">
                  {outfits[currentOutfit].title}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {outfits[currentOutfit].description}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-sage/20 text-sage text-sm rounded-full">
                  {outfits[currentOutfit].category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
