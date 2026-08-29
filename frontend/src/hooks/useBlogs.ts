import { useState, useEffect } from 'react';
import { apiService, Blog } from '../services/api';

interface UseBlogsOptions {
  category?: string;
  trending?: boolean;
  featured?: boolean;
  limit?: number;
}

interface UseBlogsReturn {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBlogs = (options: UseBlogsOptions = {}): UseBlogsReturn => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getBlogs(
        options.category,
        options.trending,
        options.featured,
        options.limit
      );
      
      if (response.error) {
        setError(response.error);
        console.error('Error fetching blogs:', response.error);
      } else if (response.data) {
        setBlogs(response.data);
      }
    } catch (err) {
      setError('Failed to fetch blogs');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [options.category, options.trending, options.featured, options.limit]);

  return {
    blogs,
    loading,
    error,
    refetch: fetchBlogs,
  };
};

export const useTrendingBlogs = () => {
  return useBlogs({ trending: true });
};

export const useBlogsByCategory = (category: string) => {
  return useBlogs({ category });
};

export const useFeaturedBlogs = () => {
  return useBlogs({ featured: true });
}; 