
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const LoadingAnimation = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center animate-fade-in">
      <div className="text-center animate-scale-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-bounce-gentle">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-4xl font-bold text-foreground tracking-wide animate-slide-in-right">
              FLEXORA
            </div>
            <div className="text-lg text-primary font-medium animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
              Flex your Aura
            </div>
          </div>
        </div>
        <div className="text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Your gateway to fashion innovation
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
