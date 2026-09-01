import { useState } from 'react';
import { Share2, Check, Copy, Twitter, Facebook } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

const ShareButton = ({ title, text, url, className = '' }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        toast.success('Shared successfully');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIsOpen(!isOpen);
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setIsOpen(false);
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleShare}
        className={`flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors ${className}`}
        title="Share"
      >
        <Share2 className="w-5 h-5 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 bottom-full mb-2 w-48 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
            <button onClick={copyToClipboard} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors text-left border-b border-border">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={shareToTwitter} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors text-left border-b border-border">
              <Twitter className="w-4 h-4 text-blue-400" />
              X (Twitter)
            </button>
            <button onClick={shareToFacebook} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors text-left border-b border-border">
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </button>
            <button onClick={shareToWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors text-left">
              <div className="w-4 h-4 flex items-center justify-center bg-green-500 text-white rounded-full">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </div>
              WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;
