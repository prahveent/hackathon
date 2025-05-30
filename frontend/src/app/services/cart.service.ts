import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem, Cart } from '../models/cart.interfaces';
import { ProductSummary } from '../models/product.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'smartcart_cart';
  
  private cartSubject = new BehaviorSubject<Cart>(this.loadCartFromStorage());
  public cart$ = this.cartSubject.asObservable();

  constructor() {}

  // Get current cart
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  // Add item to cart
  addToCart(product: ProductSummary, quantity: number = 1): void {
    const currentCart = this.getCurrentCart();
    const existingItemIndex = currentCart.items.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = currentCart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      this.updateQuantity(existingItem.id, newQuantity);
    } else {
      // Add new item
      const cartItem: CartItem = {
        id: this.generateCartItemId(),
        productId: product.id,
        productName: product.name,
        productImage: product.mainImageUrl,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: quantity,
        isInStock: product.isInStock,
        maxQuantity: 99 // Default max quantity
      };

      const updatedCart: Cart = {
        ...currentCart,
        items: [...currentCart.items, cartItem]
      };

      this.updateCart(updatedCart);
    }
  }

  // Update item quantity
  updateQuantity(cartItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(cartItemId);
      return;
    }

    const currentCart = this.getCurrentCart();
    const updatedItems = currentCart.items.map(item => 
      item.id === cartItemId ? { ...item, quantity } : item
    );

    const updatedCart: Cart = {
      ...currentCart,
      items: updatedItems
    };

    this.updateCart(updatedCart);
  }

  // Remove item from cart
  removeItem(cartItemId: string): void {
    const currentCart = this.getCurrentCart();
    const updatedItems = currentCart.items.filter(item => item.id !== cartItemId);

    const updatedCart: Cart = {
      ...currentCart,
      items: updatedItems
    };

    this.updateCart(updatedCart);
  }

  // Clear entire cart
  clearCart(): void {
    const emptyCart: Cart = {
      items: [],
      totalItems: 0,
      subtotal: 0,
      total: 0
    };

    this.updateCart(emptyCart);
  }

  // Get total items count
  getTotalItems(): number {
    return this.getCurrentCart().totalItems;
  }

  // Get subtotal
  getSubtotal(): number {
    return this.getCurrentCart().subtotal;
  }

  // Check if product is in cart
  isInCart(productId: number): boolean {
    return this.getCurrentCart().items.some(item => item.productId === productId);
  }

  // Get quantity of specific product in cart
  getProductQuantity(productId: number): number {
    const item = this.getCurrentCart().items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  // Private helper methods
  private updateCart(cart: Cart): void {
    const updatedCart = this.calculateCartTotals(cart);
    this.cartSubject.next(updatedCart);
    this.saveCartToStorage(updatedCart);
  }

  private calculateCartTotals(cart: Cart): Cart {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      ...cart,
      totalItems,
      subtotal,
      total: subtotal // For now, total equals subtotal. Later can add taxes, shipping, etc.
    };
  }

  private generateCartItemId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private saveCartToStorage(cart: Cart): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): Cart {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        return JSON.parse(savedCart);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }

    // Return empty cart if nothing saved or error occurred
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
      total: 0
    };
  }

  // Format price helper
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
} 