export interface Table {
  id: number;
  name: string;
  capacity: number;
  is_occupied: boolean;
}

export interface MealBooking {
  id: string;
  user_id: string;
  table_id: number;
  items: CartItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed';
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  order_count: number;
  created_at: string;
  updated_at: string;
} 