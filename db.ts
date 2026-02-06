
import { createClient } from '@supabase/supabase-js';
import { Product, Category, ClickAnalytic, ProductStatus, BadgeType, Coupon } from './types';

const SUPABASE_URL = 'https://vkkzqscqyktfktilmlck.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Wgi71OLMZ2c091eUfCez6A_IWaopvn0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const db = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data || [];
  },
  
  saveProduct: async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .upsert(product);
    
    if (error) throw error;
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  },

  // Analytics
  logClick: async (productId: string, origin: string = 'Direct') => {
    const { error: clickError } = await supabase
      .from('clicks')
      .insert({
        id: Math.random().toString(36).substr(2, 9),
        productId,
        origin,
        timestamp: new Date().toISOString()
      });

    if (clickError) console.error('Error logging click:', clickError);

    // Increment click count safely
    const { data: product } = await supabase
      .from('products')
      .select('clickCount')
      .eq('id', productId)
      .single();

    if (product) {
      await supabase
        .from('products')
        .update({ clickCount: (product.clickCount || 0) + 1 })
        .eq('id', productId);
    }
  },

  getAnalytics: async (): Promise<ClickAnalytic[]> => {
    const { data, error } = await supabase
      .from('clicks')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
    return data || [];
  },

  // Auth - Migrated to Supabase Auth
  login: async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },
  
  logout: async () => {
    await supabase.auth.signOut();
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};
