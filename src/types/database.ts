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