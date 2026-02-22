export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt'>;

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

export type OrderStatus = 'pending' | 'created' | 'failed';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: OrderStatus;
}
