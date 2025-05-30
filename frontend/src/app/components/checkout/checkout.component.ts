import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Cart, CustomerInfo, Order, OrderStatus } from '../../models/cart.interfaces';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cart: Cart = { items: [], totalItems: 0, subtotal: 0, total: 0 };
  customerForm: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  shippingCost = 0; // Free shipping for now
  orderPlaced = false;
  placedOrder?: Order;
  
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      country: ['United States', [Validators.required]],
      sameAsShipping: [true]
    });
  }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (cart.items.length === 0 && !this.orderPlaced) {
        // Redirect to cart if empty
        this.router.navigate(['/cart']);
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      // Validate customer info
      return this.customerForm.valid;
    }
    return true;
  }

  placeOrder(): void {
    if (!this.customerForm.valid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    const customerInfo: CustomerInfo = {
      firstName: this.customerForm.value.firstName,
      lastName: this.customerForm.value.lastName,
      email: this.customerForm.value.email,
      phone: this.customerForm.value.phone,
      shippingAddress: {
        street: this.customerForm.value.street,
        city: this.customerForm.value.city,
        state: this.customerForm.value.state,
        zipCode: this.customerForm.value.zipCode,
        country: this.customerForm.value.country
      },
      sameAsShipping: this.customerForm.value.sameAsShipping
    };

    // Create order
    const order: Order = {
      id: this.generateOrderId(),
      orderNumber: this.generateOrderNumber(),
      customer: customerInfo,
      items: [...this.cart.items],
      subtotal: this.cart.subtotal,
      shippingCost: this.shippingCost,
      total: this.cart.subtotal + this.shippingCost,
      status: OrderStatus.CONFIRMED,
      createdAt: new Date(),
      estimatedDelivery: this.calculateDeliveryDate()
    };

    this.placedOrder = order;
    this.orderPlaced = true;
    
    // Clear cart
    this.cartService.clearCart();
    
    // Move to confirmation step
    this.currentStep = 3;
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  backToCart(): void {
    this.router.navigate(['/cart']);
  }

  formatPrice(price: number): string {
    return this.cartService.formatPrice(price);
  }

  getTotalWithShipping(): number {
    return this.cart.subtotal + this.shippingCost;
  }

  getFieldError(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} is too short`;
      }
      if (field.errors['pattern']) {
        if (fieldName === 'phone') {
          return 'Please enter a valid 10-digit phone number';
        }
        if (fieldName === 'zipCode') {
          return 'Please enter a valid 5-digit ZIP code';
        }
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      street: 'Street Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private generateOrderId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `SC${timestamp}${random}`;
  }

  private calculateDeliveryDate(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now
    return deliveryDate;
  }
} 