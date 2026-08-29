import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    image: string;
    style: string;
  }[];
}

interface QuizResult {
  persona: string;
  description: string;
  color: string;
  image: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your ideal weekend outfit?",
    options: [
      {
        id: "casual",
        text: "Comfortable jeans and cozy sweater",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754154778/646d928413c6e394cd40fdeab818e5fc_zvrnqy.jpg",
        style: "Casual"
      },
      {
        id: "vintage",
        text: "Vintage dress with retro accessories",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754155029/99df76713a040ed34222b072d584cdfc_poh1tu.jpg",
        style: "Vintage"
      },
      {
        id: "minimalist",
        text: "Clean lines and neutral colors",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754155099/b6ebc0f4d1809d72521b24a5b71ed844_cngxgi.jpg",
        style: "Minimalist"
      },
      {
        id: "bohemian",
        text: "Flowing layers and earthy tones",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754155230/4fda83157619dc0fe2b0d49e486a117b_kxhqb5.jpg",
        style: "Bohemian"
      }
    ]
  },
  {
    id: 2,
    question: "Which color palette speaks to you?",
    options: [
      {
        id: "neutral",
        text: "Neutrals and earth tones",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754155396/1f838370eace05f06a624e979489ae88_wtreky.jpg",
        style: "Minimalist"
      },
      {
        id: "vibrant",
        text: "Bold and bright colors",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754155494/cbe91140fc05ac99691b7a1e01062511_ff6ctl.jpg",
        style: "Bohemian"
      },
      {
        id: "pastel",
        text: "Soft pastels and muted tones",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754155666/8c8620d4e64edfbb1e08beb848c00cfe_znvdch.jpg",
        style: "Casual"
      },
      {
        id: "monochrome",
        text: "Black, white, and grays",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754155834/6b8480b7d5f3453bd1e5349f9db8ced4_f5ptuy.jpg",
        style: "Vintage"
      }
    ]
  },
  {
    id: 3,
    question: "What's your preferred fabric texture?",
    options: [
      {
        id: "smooth",
        text: "Silk and satin finishes",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754156032/f454d4f6c7e5678c149b3e1c63a63d4d_qdofmm.jpg",
        style: "Minimalist"
      },
      {
        id: "textured",
        text: "Linen and natural fibers",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754156631/853026b8af79b0dcaa4236d0a988b93a_ji1oe6.jpg",
        style: "Bohemian"
      },
      {
        id: "soft",
        text: "Cotton and cozy knits",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754156842/f5c86db5b9a96d6ebf6ac8d27eac14e8_kzxauc.jpg",
        style: "Casual"
      },
      {
        id: "structured",
        text: "Wool and tailored fabrics",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754156974/58b05e9ff077a136a2c369d3e9dfbaf5_has7ij.jpg",
        style: "Vintage"
      }
    ]
  },
  {
    id: 4,
    question: "How do you like to accessorize?",
    options: [
      {
        id: "minimal",
        text: "Simple, understated pieces",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754157170/398c2fd670035ef76dd7d20881461ad3_nzjlib.jpg",
        style: "Minimalist"
      },
      {
        id: "layered",
        text: "Multiple layers and textures",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754157338/18109f89f2df74c79dfa48bc75d05d51_wzqxkw.jpg",
        style: "Bohemian"
      },
      {
        id: "classic",
        text: "Timeless, elegant pieces",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754158418/f97ca063954ed4d723a72fc5660623a5_lq2tbf.jpg",
        style: "Vintage"
      },
      {
        id: "trendy",
        text: "Current fashion statements",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754158524/eabf02a94951b8425feec9b4866d3131_lihqo0.jpg",
        style: "Casual"
      }
    ]
  },
  {
    id: 5,
    question: "What's your ideal shopping environment?",
    options: [
      {
        id: "boutique",
        text: "Curated, intimate boutiques",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754158819/581d889921b7350710818294050ca65e_i6tciz.jpg",
        style: "Vintage"
      },
      {
        id: "thrift",
        text: "Thrift stores and vintage markets",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754158925/775a3c5d2f6299d2b30ba552c7f3363d_zckowt.jpg",
        style: "Bohemian"
      },
      {
        id: "department",
        text: "Department stores and malls",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754159032/471389da900a7105c53555eb6802379d_hl7bzg.jpg",
        style: "Casual"
      },
      {
        id: "online",
        text: "Online shopping and minimalism",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754159098/9429ac3cfb894d1de30c5d178b8856bc_lcpate.jpg",
        style: "Minimalist"
      }
    ]
  },
  {
    id: 6,
    question: "Which trending style catches your eye?",
    options: [
      {
        id: "capsule",
        text: "Capsule wardrobe essentials",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754159225/430b5e3c6ce0b470144f1e88c201525c_u59j5m.jpg",
        style: "Minimalist"
      },
      {
        id: "sustainable",
        text: "Sustainable and eco-friendly fashion",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754159330/e910aa301a3dfd7850f5c45937318496_j2ncyx.jpg",
        style: "Bohemian"
      },
      {
        id: "streetwear",
        text: "Street style and urban fashion",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754159400/1afc965aafe18c1e8d66f83b19d2995d_adg7ql.jpg",
        style: "Casual"
      },
      {
        id: "retro",
        text: "Retro and vintage revival",
        image: "https://res.cloudinary.com/dlpuuekkl/image/upload/v1754159477/452cfb6dda25c883296dc2f0bd68bc2a_jy4rz2.jpg",
        style: "Vintage"
      }
    ]
  }
];

const quizResults: Record<string, QuizResult> = {
  minimalist: {
    persona: "Minimalist Style",
    description: "You appreciate clean lines, quality over quantity, and timeless pieces. Your wardrobe is curated with intention, focusing on versatility and sophistication. Trending: Capsule wardrobes and sustainable minimalism.",
    color: "from-gray-400 to-gray-600",
    image: "minimalist-style"
  },
  bohemian: {
    persona: "Bohemian Style",
    description: "You're free-spirited and artistic, drawn to flowing fabrics, earthy tones, and eclectic accessories. Your style celebrates individuality and creative expression. Trending: Sustainable fashion and artisanal pieces.",
    color: "from-amber-400 to-orange-500",
    image: "bohemian-style"
  },
  vintage: {
    persona: "Vintage Style",
    description: "You have a deep appreciation for classic elegance and timeless fashion. Your style draws inspiration from different eras, creating a sophisticated and refined look. Trending: Vintage revival and retro aesthetics.",
    color: "from-rose-400 to-pink-500",
    image: "vintage-style"
  },
  casual: {
    persona: "Casual Style",
    description: "You prioritize comfort and practicality while maintaining a stylish appearance. Your wardrobe is versatile and adaptable to various occasions. Trending: Street style and weekend casual looks.",
    color: "from-blue-400 to-indigo-500",
    image: "casual-style"
  }
};

interface FashionStyleQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const FashionStyleQuiz = ({ isOpen, onClose }: FashionStyleQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  const handleOptionSelect = (optionId: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionId;
    setAnswers(newAnswers);

    if (currentStep < quizQuestions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    const styleCounts: Record<string, number> = {};
    
    finalAnswers.forEach(answer => {
      const question = quizQuestions.find(q => 
        q.options.some(opt => opt.id === answer)
      );
      const option = question?.options.find(opt => opt.id === answer);
      if (option) {
        styleCounts[option.style.toLowerCase()] = (styleCounts[option.style.toLowerCase()] || 0) + 1;
      }
    });

    const dominantStyle = Object.entries(styleCounts).reduce((a, b) => 
      styleCounts[a[0]] > styleCounts[b[0]] ? a : b
    )[0];

    const result = quizResults[dominantStyle];
    setResult(result);
    setShowResult(true);
  };

  const handleSubmit = async () => {
    if (!result) return;
    
    setIsSubmitting(true);
    try {
      const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${baseURL}/api/quiz/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answers,
          persona: result.persona,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const personaSlug = result.persona.toLowerCase().replace(/\s+/g, '-');
        localStorage.setItem('flexora-last-persona', personaSlug);
        navigate(`/lookbook/${personaSlug}`);
        onClose();
      } else {
        console.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResult(false);
    setResult(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative p-8">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mb-4">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 font-serif">
              Discover Your Style Persona
            </h3>
            <p className="text-gray-600 mt-2">
              Answer 6 questions to unlock your unique fashion identity
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentStep + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-400 to-rose-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {!showResult ? (
            <div className="animate-fade-in">
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  {currentQuestion.question}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                      className="group p-6 text-left bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-gray-200 hover:border-amber-300 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      {/* Option Image */}
                      <div className="h-32 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        <img 
                          src={option.image} 
                          alt={option.text}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient placeholder if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallbackDiv) {
                              fallbackDiv.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center">
                          <div className="grid grid-cols-2 gap-1 w-16 h-16">
                            <div className="bg-gradient-to-br from-amber-200 to-rose-200 rounded"></div>
                            <div className="bg-gradient-to-br from-blue-200 to-purple-200 rounded"></div>
                            <div className="bg-gradient-to-br from-green-200 to-teal-200 rounded"></div>
                            <div className="bg-gradient-to-br from-pink-200 to-orange-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="font-semibold text-gray-800 mb-1 group-hover:text-gray-900">
                        {option.text}
                      </div>
                      <div className="text-sm text-gray-600 group-hover:text-gray-700">
                        {option.style} Style
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goBack}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
                
                <div className="text-sm text-gray-500">
                  {currentStep + 1} of {quizQuestions.length}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fade-in">
              <div className={`inline-block p-8 rounded-3xl bg-gradient-to-r ${result?.color} text-white mb-6 shadow-lg`}>
                <h4 className="text-2xl font-bold mb-2">Your Style Persona is:</h4>
                <div className="text-3xl font-bold font-serif">{result?.persona}</div>
              </div>
              
              {/* Result Image Placeholder */}
              <div className="mb-6">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1 w-24 h-24">
                    <div className="bg-gradient-to-br from-amber-200 to-rose-200 rounded"></div>
                    <div className="bg-gradient-to-br from-blue-200 to-purple-200 rounded"></div>
                    <div className="bg-gradient-to-br from-green-200 to-teal-200 rounded"></div>
                    <div className="bg-gradient-to-br from-pink-200 to-orange-200 rounded"></div>
                    <div className="bg-gradient-to-br from-yellow-200 to-amber-200 rounded"></div>
                    <div className="bg-gradient-to-br from-indigo-200 to-blue-200 rounded"></div>
                    <div className="bg-gradient-to-br from-red-200 to-pink-200 rounded"></div>
                    <div className="bg-gradient-to-br from-purple-200 to-indigo-200 rounded"></div>
                    <div className="bg-gradient-to-br from-teal-200 to-green-200 rounded"></div>
                  </div>
                </div>
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
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-full font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      View My Lookbook
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FashionStyleQuiz; 