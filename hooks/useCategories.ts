import { useState, useEffect } from 'react';
import { Category } from '../types';
import { CategoryService } from '../services';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await CategoryService.fetchCategories();
      
      setCategories(data);
      if (fetchError) {
        setError(fetchError);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('カテゴリの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch,
  };
};