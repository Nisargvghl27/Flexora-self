import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  image?: string;
  category?: string;
  brand?: string;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LookbookItem {
  id: string;
  product: Product;
  added_at: string;
  order: number;
}

export interface Lookbook {
  id: string;
  title: string;
  description: string;
  style_persona: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items: LookbookItem[];
  items_count: number;
}

export interface LookbookListItem {
  id: string;
  title: string;
  description: string;
  style_persona: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items_count: number;
}

// Lookbook API functions
export const lookbookApi = {
  // Get all lookbooks for the authenticated user
  getAllLookbooks: async (): Promise<LookbookListItem[]> => {
    const response = await api.get('/lookbooks/');
    return response.data;
  },

  // Get a specific lookbook by ID
  getLookbook: async (lookbookId: string): Promise<Lookbook> => {
    const response = await api.get(`/lookbooks/${lookbookId}/`);
    return response.data;
  },

  // Get or create a lookbook for a specific style persona
  getLookbookByStyle: async (stylePersona: string): Promise<Lookbook> => {
    const response = await api.get(`/lookbooks/style/${stylePersona}/`);
    return response.data;
  },

  // Create a new lookbook
  createLookbook: async (data: {
    title: string;
    description: string;
    style_persona: string;
  }): Promise<Lookbook> => {
    const response = await api.post('/lookbooks/', data);
    return response.data;
  },

  // Update a lookbook
  updateLookbook: async (lookbookId: string, data: Partial<{
    title: string;
    description: string;
    style_persona: string;
  }>): Promise<Lookbook> => {
    const response = await api.put(`/lookbooks/${lookbookId}/`, data);
    return response.data;
  },

  // Delete a lookbook
  deleteLookbook: async (lookbookId: string): Promise<void> => {
    await api.delete(`/lookbooks/${lookbookId}/`);
  },

  // Add a product to a lookbook
  addProductToLookbook: async (lookbookId: string, productId: string, order?: number): Promise<LookbookItem> => {
    const response = await api.post(`/lookbooks/${lookbookId}/items/`, {
      product_id: productId,
      order: order || 0
    });
    return response.data;
  },

  // Remove a product from a lookbook
  removeProductFromLookbook: async (lookbookId: string, itemId: string): Promise<void> => {
    await api.delete(`/lookbooks/${lookbookId}/items/${itemId}/`);
  },
};

// Product API functions
export const productApi = {
  // Get all products with optional filtering
  getAllProducts: async (params?: {
    category?: string;
    featured?: boolean;
  }): Promise<Product[]> => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  // Get a specific product by ID
  getProduct: async (productId: string): Promise<Product> => {
    const response = await api.get(`/products/${productId}/`);
    return response.data;
  },

  // Get all product categories
  getProductCategories: async (): Promise<{ categories: string[] }> => {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  // Get products by category for style persona
  getProductsForStyle: async (stylePersona: string): Promise<Product[]> => {
    const styleToCategory: Record<string, string> = {
      'minimalist-style': 'Minimalist',
      'bohemian-style': 'Bohemian',
      'vintage-style': 'Vintage',
      'casual-style': 'Casual',
      'streetwear-style': 'Streetwear',
      'formal-style': 'Formal',
    };

    const category = styleToCategory[stylePersona];
    if (!category) {
      return await productApi.getAllProducts();
    }

    return await productApi.getAllProducts({ category });
  },
};

export default { lookbookApi, productApi };
