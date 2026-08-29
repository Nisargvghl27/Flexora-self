import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  images: string[];
  tags: string[];
  [key: string]: any;
}

interface TrendSwipePopupProps {
  persona: string;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: (liked: Product[], skipped: Product[]) => void;
}

const swipeConfidenceThreshold = 100;

const TrendSwipePopup = ({ persona, products, isOpen, onClose, onComplete }: TrendSwipePopupProps) => {
  const [queue, setQueue] = useState<Product[]>([]);
  const [liked, setLiked] = useState<Product[]>([]);
  const [skipped, setSkipped] = useState<Product[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [cardKey, setCardKey] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastSwipedProduct = useRef<Product | null>(null);
  const lastSwipedDirection = useRef<'left' | 'right' | null>(null);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setQueue(products);
      setLiked([]);
      setSkipped([]);
      setIsFinished(false);
      setSwipeDirection(null);
      setCardKey(0);
    }
  }, [isOpen, products]);

  const currentProduct = queue[0];

  // Animate out, then handle swipe logic
  const triggerSwipe = (direction: 'left' | 'right') => {
    if (swipeDirection || !currentProduct) return;
    setSwipeDirection(direction);
    lastSwipedProduct.current = currentProduct;
    lastSwipedDirection.current = direction;
  };

  // After exit animation, advance card
  const handleExitComplete = async () => {
    if (!lastSwipedDirection.current || !lastSwipedProduct.current) return;
    const product = lastSwipedProduct.current;
    const direction = lastSwipedDirection.current;
    // POST feedback
    try {
      await fetch('/api/swipe-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          direction,
          persona,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {}
    if (direction === 'right') {
      setLiked(prev => [...prev, product]);
    } else {
      setSkipped(prev => [...prev, product]);
    }
    setQueue(prev => {
      const newQueue = prev.slice(1);
      if (newQueue.length === 0) {
        setIsFinished(true);
        onComplete(
          [...liked, ...(direction === 'right' ? [product] : [])],
          [...skipped, ...(direction === 'left' ? [product] : [])]
        );
      }
      return newQueue;
    });
    setSwipeDirection(null);
    setCardKey(k => k + 1);
    lastSwipedProduct.current = null;
    lastSwipedDirection.current = null;
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (!currentProduct || swipeDirection) return;
    if (info.offset.x > swipeConfidenceThreshold) {
      triggerSwipe('right');
    } else if (info.offset.x < -swipeConfidenceThreshold) {
      triggerSwipe('left');
    }
  };

  // Keyboard support for left/right arrow keys
  useEffect(() => {
    if (!isOpen || swipeDirection) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentProduct) return;
      if (e.key === 'ArrowRight') {
        triggerSwipe('right');
      } else if (e.key === 'ArrowLeft') {
        triggerSwipe('left');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentProduct, swipeDirection, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-background border border-primary/20 rounded-2xl shadow-2xl p-0 max-w-md w-full mx-4 overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 rounded-full transition-colors z-10 bg-white/80 shadow"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8">
              {queue.length === 0 && isFinished ? (
                <div className="text-center animate-fade-in">
                  <h3 className="font-display text-2xl font-bold mb-2">Trend Swipe Complete!</h3>
                  <p className="mb-4">You liked {liked.length} and skipped {skipped.length} products.</p>
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold" onClick={onClose}>Close</button>
                </div>
              ) : queue.length === 0 ? (
                <div className="text-center text-muted-foreground">No products to swipe.</div>
              ) : (
                <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
                  {currentProduct && (
                    <motion.div
                      key={`${cardKey}-${swipeDirection}`}
                      className="flex flex-col items-center gap-4 p-6 bg-card rounded-xl border border-border shadow-lg"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={handleDragEnd}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={swipeDirection === 'right' ? { x: 400, opacity: 0 } : swipeDirection === 'left' ? { x: -400, opacity: 0 } : { opacity: 0 }}
                      whileDrag={{ scale: 1.05 }}
                      ref={cardRef}
                    >
                      <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg mb-4 overflow-hidden">
                        {currentProduct.images[0] && currentProduct.images[0] !== '/placeholder.jpg' ? (
                          <img 
                            src={currentProduct.images[0]} 
                            alt={currentProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="text-gray-400 text-sm">No Image Available</div>';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-sm">No Image Available</div>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-2 text-center">{currentProduct.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-2 justify-center">
                        {currentProduct.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-accent/20 text-primary rounded-full text-xs font-medium border border-border">{tag}</span>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-4">
                        <button onClick={() => triggerSwipe('left')} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg" disabled={!!swipeDirection}>Skip</button>
                        <button onClick={() => triggerSwipe('right')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg" disabled={!!swipeDirection}>Like</button>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{products.length - queue.length + 1} of {products.length}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Tip: Use ← and → keys to swipe</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrendSwipePopup; 