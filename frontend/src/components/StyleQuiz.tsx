
import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface QuizResult {
  style: string;
  description: string;
  color: string;
}

const quizResults: Record<string, QuizResult> = {
  casual: {
    style: "Casual Chic",
    description: "You love comfort and versatility. Your style is effortlessly chic with a focus on wearable pieces that transition seamlessly from day to night.",
    color: "from-blue-400 to-blue-600"
  },
  ethnic: {
    style: "Ethnic Elegance", 
    description: "You appreciate cultural richness and traditional craftsmanship with modern sensibilities. Your style celebrates heritage with contemporary flair.",
    color: "from-purple-400 to-purple-600"
  },
  streetwear: {
    style: "Urban Trendsetter",
    description: "You're trendy and bold, always ahead of the fashion curve with urban influences. Your style is edgy, creative, and unapologetically you.",
    color: "from-green-400 to-green-600"
  },
  formal: {
    style: "Timeless Sophistication",
    description: "You embody sophistication and polish, preferring tailored pieces and timeless elegance. Your style is refined, classic, and always appropriate.",
    color: "from-gray-400 to-gray-600"
  }
};

interface StyleQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const StyleQuiz = ({ isOpen, onClose }: StyleQuizProps) => {
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleOptionClick = (style: string) => {
    const quizResult = quizResults[style];
    setResult(quizResult);
    setShowResult(true);
  };

  const resetQuiz = () => {
    setShowResult(false);
    setResult(null);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative p-8">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mb-4">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 font-serif">
              Discover Your Style
            </h3>
          </div>
          
          {!showResult ? (
            <div>
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  What's your ideal weekend outfit?
                </h4>
                <div className="space-y-4">
                  <button 
                    className="w-full p-6 text-left bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    onClick={() => handleOptionClick('casual')}
                  >
                    <div className="font-semibold text-gray-800 mb-1">Comfortable jeans and a cozy sweater</div>
                    <div className="text-sm text-gray-600">Relaxed, versatile, and effortlessly stylish</div>
                  </button>
                  
                  <button 
                    className="w-full p-6 text-left bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    onClick={() => handleOptionClick('ethnic')}
                  >
                    <div className="font-semibold text-gray-800 mb-1">Flowing kurta with statement jewelry</div>
                    <div className="text-sm text-gray-600">Cultural elegance with modern touches</div>
                  </button>
                  
                  <button 
                    className="w-full p-6 text-left bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    onClick={() => handleOptionClick('streetwear')}
                  >
                    <div className="font-semibold text-gray-800 mb-1">Oversized hoodie and trendy sneakers</div>
                    <div className="text-sm text-gray-600">Urban, edgy, and fashion-forward</div>
                  </button>
                  
                  <button 
                    className="w-full p-6 text-left bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    onClick={() => handleOptionClick('formal')}
                  >
                    <div className="font-semibold text-gray-800 mb-1">Tailored blazer with sleek trousers</div>
                    <div className="text-sm text-gray-600">Sophisticated, polished, and timeless</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className={`inline-block p-8 rounded-3xl bg-gradient-to-r ${result?.color} text-white mb-6 shadow-lg`}>
                <h4 className="text-2xl font-bold mb-2">Your Style is:</h4>
                <div className="text-3xl font-bold font-serif">{result?.style}</div>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                {result?.description}
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-colors"
                >
                  Take Again
                </button>
                <button 
                  onClick={handleClose}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-full font-semibold transition-all shadow-lg"
                >
                  Explore More
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleQuiz;
