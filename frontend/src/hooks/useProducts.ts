import { useState, useEffect } from 'react';
import { apiService, Product, ApiResponse } from '../services/api';

export const useProducts = (category?: string, featured?: boolean) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProducts(category, featured);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProducts(response.data);
      }
      
      setLoading(false);
    };

    fetchProducts();
  }, [category, featured]);

  return { products, loading, error };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProduct(id);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setProduct(response.data);
      }
      
      setLoading(false);
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCategories();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCategories(response.data.categories);
      }
      
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}; 