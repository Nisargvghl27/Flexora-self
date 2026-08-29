import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  backgroundClass: string;
  image: string; // ✅ New field for image
}

// ✅ Add your image links in the `image` field below
const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Outfit of the Week",
    subtitle: "Minimalist Elegance",
    description: "Timeless sophistication meets contemporary design in this carefully curated ensemble",
    backgroundClass: "from-accent via-card to-secondary",
    image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753980895/360_F_333810258_5gP2SBYroH0jtgAtI2ANibRRDe2YY7dU_cyzdnp.jpg" // 🔁 Change this
  },
  {
    id: 2,
    title: "Sustainable Fashion",
    subtitle: "Conscious Choices",
    description: "Eco-friendly materials crafted into beautiful, lasting pieces for the mindful wardrobe",
    backgroundClass: "from-secondary via-accent to-card",
    image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753980973/pexels-photo-983569_qfzsxf.jpg" // 🔁 Change this
  },
  {
    id: 3,
    title: "Artisan Collection",
    subtitle: "Handcrafted Beauty",
    description: "Traditional craftsmanship reimagined with modern silhouettes and refined details",
    backgroundClass: "from-card via-secondary to-accent",
    image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1753980711/pexels-photo-8980243_zjsb5e.jpg" // 🔁 Change this
  }
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[70vh] w-full overflow-hidden bg-gradient-to-br from-background to-card">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundClass} opacity-90`} />
          <div className="relative flex h-full items-center justify-center px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Featured</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-display text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                    {slide.title}
                  </h1>
                  <h2 className="font-display text-xl lg:text-2xl font-medium text-primary">
                    {slide.subtitle}
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
                  {slide.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                    onClick={() => navigate('/collections')}
                  >
                    Explore Collection
                  </button>
                  <button
                    className="px-8 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
                    onClick={() => navigate(`/collections/${slugify(slide.subtitle || slide.title)}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* ✅ Image Card */}
              <div className="flex justify-center">
                <div className="relative group transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-80 h-96 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute -bottom-4 -right-4 w-64 h-80 bg-gradient-to-br from-accent/40 to-primary/20 rounded-2xl shadow-lg -z-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/80 hover:bg-card text-foreground rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-card/80 hover:bg-card text-foreground rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-primary scale-125'
                : 'bg-primary/30 hover:bg-primary/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
