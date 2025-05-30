import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductSummary } from '../../../models/product.interfaces';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss']
})
export class ProductCardComponent {
  @Input() product!: ProductSummary;
  @Input() showCategory: boolean = true;
  @Input() showBrand: boolean = true;

  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  viewProduct(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  calculateSavings(): number {
    if (this.product.originalPrice) {
      return this.productService.calculateSavings(this.product.originalPrice, this.product.price);
    }
    return 0;
  }

  getStarRating(): string[] {
    return this.productService.generateStarRating(this.product.rating);
  }

  getStockStatusClass(): string {
    return this.productService.getStockStatusClass(this.product);
  }

  getStockStatusText(): string {
    return this.productService.getStockStatusText(this.product);
  }

  addToCart(): void {
    // TODO: Implement cart functionality
    console.log('Add to cart:', this.product.id);
  }

  addToWishlist(): void {
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', this.product.id);
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x400/95a5a6/ffffff?text=Image+Not+Found';
  }
}
