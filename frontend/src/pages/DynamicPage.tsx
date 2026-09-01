import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { Skeleton } from '../components/ui/skeleton';
import { apiService } from '../services/api';

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await apiService.getContent(slug);
        if (res.error) {
          throw new Error(res.error || 'Page not found');
        }
        setPage(res.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="w-full">
          <Skeleton className="w-full h-[40vh]" />
          <div className="max-w-4xl mx-auto py-16 px-6 space-y-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-8">The page you are looking for does not exist.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Return Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render blocks
  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div 
            key={index} 
            className="prose prose-lg max-w-none text-foreground my-8"
            dangerouslySetInnerHTML={{ __html: block.content }} 
          />
        );
      case 'image':
        return (
          <div key={index} className="my-8 rounded-xl overflow-hidden shadow-sm">
            <img 
              src={block.url || '/placeholder.svg'} 
              alt={block.alt || 'Page image'} 
              className="w-full h-auto object-cover" 
            />
            {block.caption && <p className="text-sm text-center text-muted-foreground mt-2">{block.caption}</p>}
          </div>
        );
      case 'heading':
        return (
          <h2 key={index} className="text-3xl font-bold font-display mt-12 mb-6">
            {block.content}
          </h2>
        );
      case 'divider':
        return <hr key={index} className="my-12 border-border" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="w-full pb-20">
        <PageHero 
          title={page.title}
          subtitle=""
          backgroundGradient="from-primary/20 to-secondary"
        />
        
        <div className="max-w-4xl mx-auto px-6 py-12">
          {Array.isArray(page.content) 
            ? page.content.map((block: any, i: number) => renderBlock(block, i))
            : (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: typeof page.content === 'string' ? page.content : JSON.stringify(page.content) }} 
              />
            )
          }
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DynamicPage;
