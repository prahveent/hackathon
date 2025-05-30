import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/cart.interfaces';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [], totalItems: 0, subtotal: 0, total: 0 };
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  updateQuantity(item: CartItem, quantity: number): void {
    this.cartService.updateQuantity(item.id, quantity);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  formatPrice(price: number): string {
    return this.cartService.formatPrice(price);
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  onImageError(event: any): void {
    event.target.src = 'https://picsum.photos/100/100?random=999';
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  onQuantityInputChange(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement;
    const quantity = parseInt(target.value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      this.updateQuantity(item, quantity);
    }
  }
} 