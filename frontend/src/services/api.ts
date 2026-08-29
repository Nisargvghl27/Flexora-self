export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
export const API_BASE_URL = `${BASE_URL}/api`;

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  image_url?: string;
  image?: string;
  category: string;
  brand?: string;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  category: string;
  cover_image?: string;
  cover_image_url?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_trending: boolean;
  is_published: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  tags: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  time_ago: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      console.log(`API Request: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      console.log(`API Response Status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let errorData: any = {};
        try { if (text) errorData = JSON.parse(text); } catch (_) {}
        console.error('API Error Response:', errorData);
        return {
          error: errorData.error || errorData.detail || `HTTP error! status: ${response.status}`,
          details: errorData.details,
        };
      }

      const text = await response.text().catch(() => '');
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch (_) {}
      console.log('API Success Response:', data);
      return { data };
    } catch (error) {
      console.error('API Network Error:', error);
      return {
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get all products
  async getProducts(category?: string, featured?: boolean): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (featured) params.append('featured', 'true');
    
    return this.makeRequest<Product[]>(`/products/?${params.toString()}`);
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    console.log(`Fetching product with ID: ${id}`);
    return this.makeRequest<Product>(`/products/${id}/`);
  }

  // Get all categories
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.makeRequest<{ categories: string[] }>('/products/categories/');
  }

  // Get featured products
  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.getProducts(undefined, true);
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    return this.getProducts(category);
  }

  // Blog API methods
  async getBlogs(category?: string, trending?: boolean, featured?: boolean, limit?: number): Promise<ApiResponse<Blog[]>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (trending) params.append('trending', 'true');
    if (featured) params.append('featured', 'true');
    if (limit) params.append('limit', limit.toString());
    
    return this.makeRequest<Blog[]>(`/blogs/?${params.toString()}`);
  }

  async getBlog(slug: string): Promise<ApiResponse<Blog>> {
    return this.makeRequest<Blog>(`/blogs/${slug}/`);
  }

  async getBlogCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.makeRequest<{ categories: string[] }>('/blogs/categories/');
  }

  async getTrendingBlogs(): Promise<ApiResponse<Blog[]>> {
    return this.getBlogs(undefined, true);
  }

  async getBlogsByCategory(category: string): Promise<ApiResponse<Blog[]>> {
    return this.getBlogs(category);
  }

  async likeBlog(blogId: string): Promise<ApiResponse<{ message: string; likes_count: number }>> {
    return this.makeRequest<{ message: string; likes_count: number }>(`/blogs/${blogId}/engagement/`, {
      method: 'POST',
      body: JSON.stringify({ action: 'like' }),
    });
  }

  async commentBlog(blogId: string): Promise<ApiResponse<{ message: string; comments_count: number }>> {
    return this.makeRequest<{ message: string; comments_count: number }>(`/blogs/${blogId}/engagement/`, {
      method: 'POST',
      body: JSON.stringify({ action: 'comment' }),
    });
  }

  // Create a new blog post
  async createBlog(blogData: FormData): Promise<ApiResponse<{ message: string; blog: Blog }>> {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Blog creation - Token found:', !!token);
      console.log('Blog creation - Token preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (!token) {
        return {
          error: 'No authentication token found. Please log in again.',
        };
      }
      
      console.log('Blog creation - Making request to:', `${API_BASE_URL}/blogs/create/`);
      
      const response = await fetch(`${API_BASE_URL}/blogs/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: blogData,
      });
      
      console.log('Blog creation - Response status:', response.status);
      console.log('Blog creation - Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let errorData: any = {};
        try { if (text) errorData = JSON.parse(text); } catch (_) {}
        return {
          error: errorData.error || errorData.detail || `HTTP error! status: ${response.status}`,
          details: errorData.details,
        };
      }

      const text = await response.text().catch(() => '');
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch (_) {}
      return { data };
    } catch (error) {
      return {
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Test authenticated API connection
  async testAuthenticatedConnection(): Promise<ApiResponse<{ message: string }>> {
    const token = localStorage.getItem('accessToken');
    console.log('Auth test - Token found:', !!token);
    
    if (!token) {
      return { error: 'No token found' };
    }
    
    return this.makeRequest<{ message: string }>('/blogs/categories/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Test API connection
  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/hello/');
  }
}

export const apiService = new ApiService(); 