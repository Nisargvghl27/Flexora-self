import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Heart, Plus } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

interface Design {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  votes_count: number;
  created_at: string;
  designer_name: string;
  avatar_url: string | null;
}

const DesignShowcase = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('accessToken');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<string[]>([]);

  const fetchDesigns = async () => {
    try {
      const res = await apiService.getDesigns(1, 100);
      if (res.error) throw new Error(res.error);
      setDesigns(res.data?.designs || res.data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    try {
      const res = await apiService.getUserDesignVotes();
      if (!res.error && res.data) {
        setUserVotes(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDesigns();
    fetchUserVotes();
  }, [user]);

  const toggleVote = async (designId: string) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    
    // Optimistic update
    const hasVoted = userVotes.includes(designId);
    setUserVotes(hasVoted ? userVotes.filter(id => id !== designId) : [...userVotes, designId]);
    setDesigns(designs.map(d => d.id === designId ? { ...d, votes_count: d.votes_count + (hasVoted ? -1 : 1) } : d));

    try {
      await apiService.voteDesign(designId);
    } catch (err) {
      // Revert on error
      setUserVotes(hasVoted ? [...userVotes, designId] : userVotes.filter(id => id !== designId));
      setDesigns(designs.map(d => d.id === designId ? { ...d, votes_count: d.votes_count + (hasVoted ? 1 : -1) } : d));
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col pb-20">
      <Navigation />
      
      <div className="flex-1 max-w-7xl mx-auto w-full pt-24 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Design Showcase</h1>
            <p className="text-muted-foreground mt-2">Discover and vote for amazing designs from our student community.</p>
          </div>
          <Link to="/submit-design" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" /> Submit Design
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground text-lg">Loading designs...</div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl shadow-sm border border-border">
            <p className="text-muted-foreground mb-4">No designs have been approved yet.</p>
            <Link to="/submit-design" className="text-primary hover:underline font-semibold">Be the first to submit!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map(design => {
              const hasVoted = userVotes.includes(design.id);
              return (
                <div key={design.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col">
                  <div className="aspect-[4/5] relative overflow-hidden bg-muted group">
                    <img src={design.image_url} alt={design.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button 
                      onClick={() => toggleVote(design.id)}
                      className="absolute top-4 right-4 bg-card/90 backdrop-blur shadow-sm p-2 rounded-full hover:scale-110 transition-transform"
                    >
                      <Heart className={`w-5 h-5 \${hasVoted ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'}`} />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-2">{design.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">{design.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden">
                          {design.avatar_url ? (
                            <img src={design.avatar_url} alt={design.designer_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-bold">
                              {design.designer_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{design.designer_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        <Heart className="w-4 h-4 fill-current text-red-500" />
                        {design.votes_count}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DesignShowcase;
