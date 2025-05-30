import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, ProductQueryParams, PaginatedResponse } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-list">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadProducts()" class="retry-btn">Try Again</button>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!loading && !error" class="products-container">
        <div class="products-header">
          <h2 *ngIf="title">{{ title }}</h2>
          <div class="products-count" *ngIf="paginatedProducts">
            Showing {{ getDisplayRange() }} of {{ paginatedProducts.totalCount }} products
          </div>
        </div>        <div class="products-grid" *ngIf="paginatedProducts?.items?.length">
          <div 
            *ngFor="let product of paginatedProducts?.items" 
            class="product-card"
            [routerLink]="['/products', product.id]"
          >
            <div class="product-image">
              <img 
                [src]="getMainImage(product)" 
                [alt]="product.name"
                (error)="onImageError($event)"
              />
              <div class="product-badges">
                <span *ngIf="product.isFeatured" class="badge featured">Featured</span>
                <span *ngIf="product.stockQuantity === 0" class="badge out-of-stock">Out of Stock</span>
                <span *ngIf="product.stockQuantity > 0 && product.stockQuantity <= 5" class="badge low-stock">Low Stock</span>
              </div>
            </div>
            
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description | slice:0:100 }}<span *ngIf="product.description.length > 100">...</span></p>
              
              <div class="product-meta">
                <span class="product-brand" *ngIf="product.brand">{{ product.brand.name }}</span>
                <span class="product-category" *ngIf="product.category">{{ product.category.name }}</span>
              </div>
              
              <div class="product-footer">
                <div class="product-price">
                  <span class="price">\${{ product.price | number:'1.2-2' }}</span>
                </div>
                <div class="product-stock">
                  <span *ngIf="product.stockQuantity > 0" class="in-stock">
                    {{ product.stockQuantity }} in stock
                  </span>
                  <span *ngIf="product.stockQuantity === 0" class="out-of-stock">
                    Out of stock
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!paginatedProducts?.items?.length" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>

        <!-- Pagination -->
        <div *ngIf="paginatedProducts && paginatedProducts.totalPages > 1" class="pagination">
          <button 
            (click)="goToPage(paginatedProducts.page - 1)"
            [disabled]="paginatedProducts.page <= 1"
            class="pagination-btn"
          >
            Previous
          </button>
          
          <div class="pagination-numbers">
            <button 
              *ngFor="let page of getPageNumbers()"
              (click)="goToPage(page)"
              [class.active]="page === paginatedProducts.page"
              class="pagination-number"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            (click)="goToPage(paginatedProducts.page + 1)"
            [disabled]="paginatedProducts.page >= paginatedProducts.totalPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-list {
      padding: 1rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      text-align: center;
      padding: 2rem;
    }

    .error-message {
      color: #dc3545;
      margin-bottom: 1rem;
    }

    .retry-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .retry-btn:hover {
      background: #0056b3;
    }

    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .products-header h2 {
      margin: 0;
      color: #333;
    }

    .products-count {
      color: #666;
      font-size: 0.9rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .product-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-badges {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge.featured {
      background: #ffc107;
      color: #000;
    }

    .badge.out-of-stock {
      background: #dc3545;
      color: white;
    }

    .badge.low-stock {
      background: #fd7e14;
      color: white;
    }

    .product-info {
      padding: 1rem;
    }

    .product-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .product-description {
      margin: 0 0 0.75rem 0;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .product-meta {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.8rem;
    }

    .product-brand,
    .product-category {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      color: #495057;
    }

    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price {
      font-size: 1.2rem;
      font-weight: 600;
      color: #007bff;
    }

    .product-stock {
      font-size: 0.8rem;
    }

    .in-stock {
      color: #28a745;
    }

    .out-of-stock {
      color: #dc3545;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .empty-state p {
      color: #666;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
    }

    .pagination-btn,
    .pagination-number {
      padding: 0.5rem 1rem;
      border: 1px solid #dee2e6;
      background: white;
      color: #007bff;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
    }

    .pagination-btn:hover:not(:disabled),
    .pagination-number:hover {
      background: #e9ecef;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-number.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .pagination-numbers {
      display: flex;
      gap: 0.25rem;
    }
  `]
})
export class ProductListComponent implements OnInit {
  @Input() title?: string;
  @Input() categoryId?: number;
  @Input() brandId?: number;
  @Input() featured?: boolean;
  @Input() queryParams?: ProductQueryParams;
  @Output() productClick = new EventEmitter<Product>();

  paginatedProducts?: PaginatedResponse<Product>;
  loading = false;
  error?: string;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = undefined;

    const params: ProductQueryParams = {
      ...this.queryParams,
      categoryId: this.categoryId,
      brandId: this.brandId,
      featured: this.featured
    };

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.paginatedProducts = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  getMainImage(product: Product): string {
    const mainImage = product.images?.find(img => img.isMain);
    return mainImage?.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image';
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
  }

  getDisplayRange(): string {
    if (!this.paginatedProducts) return '';
    
    const start = (this.paginatedProducts.page - 1) * this.paginatedProducts.pageSize + 1;
    const end = Math.min(start + this.paginatedProducts.items.length - 1, this.paginatedProducts.totalCount);
    
    return `${start}-${end}`;
  }

  getPageNumbers(): number[] {
    if (!this.paginatedProducts) return [];
    
    const current = this.paginatedProducts.page;
    const total = this.paginatedProducts.totalPages;
    const delta = 2;
    
    const range = [];
    const rangeWithDots = [];
    
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    
    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (current + delta < total - 1) {
      rangeWithDots.push(-1, total);
    } else {
      if (total > 1) rangeWithDots.push(total);
    }
    
    return rangeWithDots.filter(n => n > 0);
  }

  goToPage(page: number) {
    if (!this.paginatedProducts || page < 1 || page > this.paginatedProducts.totalPages) {
      return;
    }
    
    const newParams = { ...this.queryParams, page };
    this.queryParams = newParams;
    this.loadProducts();
  }
}
