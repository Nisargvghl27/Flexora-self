import { useState, useEffect } from 'react';
import { apiService, Product, ApiResponse } from '../services/api';

export const useProducts = (category?: string, featured?: boolean, search?: string, sort?: string, page?: number, limit?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProducts(category, featured, search, sort, page, limit);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Handle both old array response and new paginated response
        if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotal(response.data.length);
          setTotalPages(1);
        } else {
          setProducts(response.data.results);
          setTotal(response.data.total);
          setTotalPages(response.data.total_pages);
        }
      }
      
      setLoading(false);
    };

    fetchProducts();
  }, [category, featured, search, sort, page, limit]);

  return { products, loading, error, total, totalPages };
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