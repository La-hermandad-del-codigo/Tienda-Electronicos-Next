export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  created_at: string;
  created_by?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'created_by'>;

export const CATEGORIES = [
  'Laptops',
  'Smartphones',
  'Audio',
  'Teclados',
  'Monitores',
  'Accesorios',
  'Tablets',
  'Gaming',
] as const;
