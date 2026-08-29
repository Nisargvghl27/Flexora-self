
interface PageHeroProps {
  title: string;
  description?: string;
  subtitle?: string;
  backgroundGradient?: string;
  className?: string;
}

const PageHero = ({ 
  title, 
  description, 
  subtitle, 
  backgroundGradient, 
  className = "" 
}: PageHeroProps) => {
  const displayText = subtitle || description || "";
  const gradientClass = backgroundGradient ? `bg-gradient-to-br ${backgroundGradient}` : "bg-gradient-to-br from-background via-secondary/20 to-accent/30";

  return (
    <section className={`pt-24 pb-16 px-6 ${gradientClass} ${className}`}>
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-scale-in">
          {title}
        </h1>
        {displayText && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto animate-slide-in-right">
            {displayText}
          </p>
        )}
      </div>
    </section>
  );
};

export default PageHero;