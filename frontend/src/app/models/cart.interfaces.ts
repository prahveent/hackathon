export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  isInStock: boolean;
  maxQuantity?: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress: Address;
  billingAddress?: Address;
  sameAsShipping: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderSummary {
  cart: Cart;
  customer: CustomerInfo;
  shippingCost: number;
  total: number;
  estimatedDelivery: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  estimatedDelivery: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
} 