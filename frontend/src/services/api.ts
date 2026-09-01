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
  average_rating?: number;
  review_count?: number;
}

export interface CartItem {
  id?: string; // id from DB cart_items
  product_id: string;
  product?: Product;
  quantity: number;
  size?: string;
  color?: string;
  added_at?: string;
}

export interface WishlistItem {
  id?: string;
  product_id: string;
  product?: Product;
  added_at?: string;
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

export interface Review {
  id: string;
  user_id: number;
  product_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  username?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
  status?: number;
  rawErrorData?: any;
}

export interface PaginatedResponse<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CustomRequestInit extends RequestInit {
  _retry?: boolean;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: CustomRequestInit): Promise<ApiResponse<T>> {
    try {
      
      const token = localStorage.getItem('accessToken');
      let fetchOptions = { ...options };
      
      let headers: any = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };

      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // If body is FormData, browser needs to set Content-Type with boundary automatically
      if (fetchOptions.body instanceof FormData) {
        delete headers['Content-Type'];
      }

      let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });


      // Token refresh logic
      if (response.status === 401 && !options?._retry) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken })
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              localStorage.setItem('accessToken', data.access);
              if (data.refresh) localStorage.setItem('refreshToken', data.refresh);
              
              // Retry original request
              const newOptions = { ...fetchOptions, _retry: true };
              newOptions.headers = {
                ...newOptions.headers,
                'Authorization': `Bearer ${data.access}`
              };
              
              return this.makeRequest<T>(endpoint, newOptions);
            }
          } catch (e) {
            console.error('Token refresh failed', e);
          }
        }
        
        // If refresh failed or no refresh token, clear and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let errorData: any = {};
        try { if (text) errorData = JSON.parse(text); } catch (_) {}
        console.error('API Error Response:', errorData);
        return {
          error: errorData.error || errorData.detail || `HTTP error! status: ${response.status}`,
          details: errorData.details,
          status: response.status,
          rawErrorData: errorData,
        };
      }

      const text = await response.text().catch(() => '');
      let data: any = {};
      try { if (text) data = JSON.parse(text); } catch (_) {}
      return { data, status: response.status };
    } catch (error) {
      console.error('API Network Error:', error);
      return {
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get all products
  async getProducts(
    category?: string, 
    featured?: boolean,
    search?: string,
    sort?: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (featured) params.append('featured', 'true');
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    return this.makeRequest<PaginatedResponse<Product>>(`/products/?${params.toString()}`);
  }

  // Get a single product by ID
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.makeRequest<Product>(`/products/${id}/`);
  }

  // Get all categories
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return this.makeRequest<{ categories: string[] }>('/products/categories/');
  }

  // Get featured products
  async getFeaturedProducts(): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return this.getProducts(undefined, true);
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return this.getProducts(category);
  }

  // Blog API methods
  async getBlogs(
    category?: string, 
    trending?: boolean, 
    featured?: boolean, 
    limit?: number,
    search?: string,
    tag?: string,
    author?: string
  ): Promise<ApiResponse<Blog[]>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (trending) params.append('trending', 'true');
    if (featured) params.append('featured', 'true');
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    if (author) params.append('author', author);
    
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

  // Real Comments API
  async getBlogComments(slug: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/blogs/${slug}/comments/`);
  }

  async addBlogComment(slug: string, content: string, parentId?: string): Promise<ApiResponse<{ message: string; id: string; comments_count: number }>> {
    return this.makeRequest<{ message: string; id: string; comments_count: number }>(`/blogs/${slug}/comments/`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    });
  }

  async deleteBlogComment(slug: string, commentId: string): Promise<ApiResponse<{ message: string; comments_count: number }>> {
    return this.makeRequest<{ message: string; comments_count: number }>(`/blogs/${slug}/comments/${commentId}/`, {
      method: 'DELETE',
    });
  }

  // Create a new blog post
  async createBlog(blogData: FormData): Promise<ApiResponse<{ message: string; blog: Blog }>> {
    return this.makeRequest<{ message: string; blog: Blog }>('/blogs/create/', {
      method: 'POST',
      body: blogData,
    });
  }

  // Test authenticated API connection
  async testAuthenticatedConnection(): Promise<ApiResponse<{ message: string }>> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return { error: 'No token found' };
    }
    
    return this.makeRequest<{ message: string }>('/blogs/categories/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Cart methods
  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return this.makeRequest<CartItem[]>('/cart/');
  }

  async addToCart(item: { product_id: string; quantity?: number; size?: string; color?: string }): Promise<ApiResponse<{ message: string; id?: string; quantity?: number }>> {
    return this.makeRequest<{ message: string; id?: string; quantity?: number }>('/cart/', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/cart/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/cart/${itemId}/`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/cart/', {
      method: 'DELETE',
    });
  }

  // Wishlist methods
  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    return this.makeRequest<WishlistItem[]>('/wishlist/');
  }

  async addToWishlist(productId: string): Promise<ApiResponse<{ message: string; id?: string }>> {
    return this.makeRequest<{ message: string; id?: string }>('/wishlist/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeWishlistItem(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/wishlist/${itemId}/`, {
      method: 'DELETE',
    });
  }

  async removeWishlistItemByProduct(productId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/wishlist/product/${productId}/`, {
      method: 'DELETE',
    });
  }

  // Review methods
  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    return this.makeRequest<Review[]>(`/products/${productId}/reviews/`);
  }

  async addProductReview(productId: string, rating: number, review_text: string): Promise<ApiResponse<{ message: string; id: string }>> {
    return this.makeRequest<{ message: string; id: string }>(`/products/${productId}/reviews/`, {
      method: 'POST',
      body: JSON.stringify({ rating, review_text }),
    });
  }

  async deleteProductReview(productId: string, reviewId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/products/${productId}/reviews/${reviewId}/`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders(): Promise<ApiResponse<{ orders: any[], total: number }>> {
    return this.makeRequest<{ orders: any[], total: number }>('/orders/');
  }

  // Coupon methods
  async validateCoupon(code: string, cart_total: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/coupons/validate/', {
      method: 'POST',
      body: JSON.stringify({ code, cart_total }),
    });
  }

  // Test API connection
  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/hello/');
  }
  // Community methods
  async getCommunityFeed(page = 1, limit = 10): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/community/feed?page=${page}&limit=${limit}`);
  }
  async createCommunityPost(data: FormData): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/community/feed', {
      method: 'POST',
      body: data,
    });
  }
  async likeCommunityPost(postId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/community/feed/${postId}/like`, { method: 'POST' });
  }
  async getLikedCommunityPosts(): Promise<ApiResponse<string[]>> {
    return this.makeRequest<string[]>('/community/likes');
  }
  async deleteCommunityPost(postId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/community/feed/${postId}`, { method: 'DELETE' });
  }

  // Design Showcase methods
  async getDesigns(page = 1, limit = 20): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/designs?page=${page}&limit=${limit}`);
  }
  async submitDesign(data: FormData): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/designs', {
      method: 'POST',
      body: data,
    });
  }
  async voteDesign(submissionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/designs/${submissionId}/vote`, { method: 'POST' });
  }
  async getUserDesignVotes(): Promise<ApiResponse<string[]>> {
    return this.makeRequest<string[]>('/designs/votes');
  }

  // Lookbook methods
  async getLookbooks(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/lookbooks');
  }
  async getLookbook(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/lookbooks/${id}`);
  }

  // Content/Dynamic Page methods
  async getContent(slug: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/content/${slug}`);
  }

  // Auth & User methods
  async login(credentials: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/verify-email/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/reset-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/forgot-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/delete-account/', {
      method: 'POST',
    });
  }

  // Profile
  async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/profile/');
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    const isFormData = data instanceof FormData;
    return this.makeRequest<any>('/profile/', {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  // Community
  async checkCommunityMember(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/community-member-check/');
  }

  async joinCommunity(data?: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/join-community/', {
      method: data ? 'POST' : 'GET',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Payments
  async createRazorpayOrder(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/create-razorpay-order/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyRazorpayPayment(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/verify-razorpay-payment/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications
  async getUnreadNotificationCount(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/notifications/unread-count/');
  }

  async getNotifications(limit = 5): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/notifications/?limit=${limit}`);
  }

  async markNotificationRead(id: number): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/notifications/${id}/read/`, { method: 'POST' });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/notifications/read-all/', { method: 'POST' });
  }

  // Usernames
  async searchUsernames(query: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/usernames/?search=${encodeURIComponent(query)}`);
  }

  // Swipe Feedback
  async submitSwipeFeedback(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/swipe-feedback/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Quiz Submit
  async submitQuiz(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/quiz/submit/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Generic Admin GET
  async adminGet(endpoint: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/admin/${endpoint}`);
  }

  async adminPost(endpoint: string, data: any): Promise<ApiResponse<any>> {
    const isFormData = data instanceof FormData;
    return this.makeRequest<any>(`/admin/${endpoint}`, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async adminPut(endpoint: string, data: any): Promise<ApiResponse<any>> {
    const isFormData = data instanceof FormData;
    return this.makeRequest<any>(`/admin/${endpoint}`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  async adminDelete(endpoint: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/admin/${endpoint}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(); 
