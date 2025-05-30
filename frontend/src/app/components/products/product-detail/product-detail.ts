import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProductService } from '../../../services/product.service';
import { ProductDetail } from '../../../models/product.interfaces';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  product: ProductDetail | null = null;
  loading = false;
  error: string | null = null;
  selectedImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = +params['id'];
        if (productId) {
          this.loadProduct(productId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load product details.';
          this.loading = false;
          console.error('Load product error:', error);
        }
      });
  }

  formatPrice(price: number): string {
    return this.productService.formatPrice(price);
  }

  calculateSavings(): number {
    if (this.product?.originalPrice) {
      return this.productService.calculateSavings(this.product.originalPrice, this.product.price);
    }
    return 0;
  }

  getStarRating(): string[] {
    if (this.product) {
      return this.productService.generateStarRating(this.product.rating);
    }
    return [];
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  addToCart(): void {
    // TODO: Implement cart functionality
    console.log('Add to cart:', this.product?.id);
  }

  addToWishlist(): void {
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', this.product?.id);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
