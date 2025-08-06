import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaults';
import { supabase } from '../lib/supabase';

export class CategoryService {
  static async fetchCategories(): Promise<{ data: Category[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.log('Categories table not found, using default categories');
        return { data: DEFAULT_CATEGORIES };
      }

      if (data) {
        // "全て"カテゴリを先頭に追加
        const allCategory: Category = DEFAULT_CATEGORIES[0];
        return { data: [allCategory, ...data] };
      }

      return { data: DEFAULT_CATEGORIES };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { 
        data: DEFAULT_CATEGORIES, 
        error: 'カテゴリの取得に失敗しました' 
      };
    }
  }
}