import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-detail">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading product...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadProduct()" class="retry-btn">Try Again</button>
      </div>

      <!-- Product Content -->
      <div *ngIf="product && !loading && !error" class="product-content">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span class="separator">></span>
          <a routerLink="/products">Products</a>
          <span class="separator" *ngIf="product.category">></span>
          <a *ngIf="product.category" [routerLink]="['/categories', product.category.id]">
            {{ product.category.name }}
          </a>
          <span class="separator">></span>
          <span class="current">{{ product.name }}</span>
        </nav>

        <div class="product-main">
          <!-- Product Images -->
          <div class="product-images">
            <div class="main-image">
              <img 
                [src]="selectedImage || getMainImage(product)" 
                [alt]="product.name"
                (error)="onImageError($event)"
              />
              <div class="image-badges">
                <span *ngIf="product.isFeatured" class="badge featured">Featured</span>
                <span *ngIf="product.stockQuantity === 0" class="badge out-of-stock">Out of Stock</span>
                <span *ngIf="product.stockQuantity > 0 && product.stockQuantity <= 5" class="badge low-stock">Low Stock</span>
              </div>
            </div>
            
            <div class="image-thumbnails" *ngIf="product.images && product.images.length > 1">
              <img 
                *ngFor="let image of product.images"
                [src]="image.imageUrl"
                [alt]="image.altText || product.name"
                [class.active]="selectedImage === image.imageUrl"
                (click)="selectImage(image.imageUrl)"
                (error)="onImageError($event)"
              />
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-meta">
              <div class="brand" *ngIf="product.brand">
                <label>Brand:</label>
                <a [routerLink]="['/brands', product.brand.id]">{{ product.brand.name }}</a>
              </div>
              <div class="category" *ngIf="product.category">
                <label>Category:</label>
                <a [routerLink]="['/categories', product.category.id]">{{ product.category.name }}</a>
              </div>
            </div>

            <div class="price-section">
              <div class="price">\${{ product.price | number:'1.2-2' }}</div>
            </div>

            <div class="stock-section">
              <div class="stock-status" [ngClass]="getStockClass(product)">
                <div class="stock-indicator"></div>
                <span>{{ getStockText(product) }}</span>
              </div>
              <div class="stock-quantity" *ngIf="product.stockQuantity > 0">
                {{ product.stockQuantity }} available
              </div>
            </div>

            <div class="description">
              <h3>Description</h3>
              <p>{{ product.description }}</p>
            </div>

            <div class="actions">
              <button 
                class="add-to-cart-btn"
                [disabled]="product.stockQuantity === 0"
                (click)="addToCart()"
              >
                <span *ngIf="product.stockQuantity > 0">Add to Cart</span>
                <span *ngIf="product.stockQuantity === 0">Out of Stock</span>
              </button>
              
              <button class="wishlist-btn" (click)="toggleWishlist()">
                <span class="heart-icon">{{ isInWishlist ? '❤️' : '🤍' }}</span>
                {{ isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist' }}
              </button>
            </div>

            <div class="product-details">
              <h3>Product Details</h3>
              <div class="detail-item">
                <label>Product ID:</label>
                <span>{{ product.id }}</span>
              </div>
              <div class="detail-item">
                <label>Added:</label>
                <span>{{ product.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="detail-item">
                <label>Last Updated:</label>
                <span>{{ product.updatedAt | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products Section -->
        <div class="related-products" *ngIf="relatedProducts && relatedProducts.length">
          <h3>Related Products</h3>
          <div class="related-grid">
            <div 
              *ngFor="let relatedProduct of relatedProducts"
              class="related-item"
              [routerLink]="['/products', relatedProduct.id]"
            >
              <img 
                [src]="getMainImage(relatedProduct)" 
                [alt]="relatedProduct.name"
                (error)="onImageError($event)"
              />
              <div class="related-info">
                <h4>{{ relatedProduct.name }}</h4>
                <p class="related-price">\${{ relatedProduct.price | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
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
      padding: 3rem;
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

    .breadcrumb {
      margin-bottom: 2rem;
      font-size: 0.9rem;
    }

    .breadcrumb a {
      color: #007bff;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .separator {
      margin: 0 0.5rem;
      color: #666;
    }

    .current {
      color: #666;
    }

    .product-main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    @media (max-width: 768px) {
      .product-main {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .main-image {
      position: relative;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .image-badges {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.8rem;
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

    .image-thumbnails {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
    }

    .image-thumbnails img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }

    .image-thumbnails img:hover,
    .image-thumbnails img.active {
      border-color: #007bff;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .product-title {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #333;
    }

    .product-meta {
      display: flex;
      gap: 2rem;
    }

    .product-meta > div {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .product-meta label {
      font-weight: 600;
      color: #666;
    }

    .product-meta a {
      color: #007bff;
      text-decoration: none;
    }

    .product-meta a:hover {
      text-decoration: underline;
    }

    .price-section {
      border-top: 1px solid #dee2e6;
      border-bottom: 1px solid #dee2e6;
      padding: 1.5rem 0;
    }

    .price {
      font-size: 2.5rem;
      font-weight: 700;
      color: #007bff;
    }

    .stock-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .stock-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
    }

    .stock-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .stock-status.in-stock .stock-indicator {
      background: #28a745;
    }

    .stock-status.in-stock {
      color: #28a745;
    }

    .stock-status.low-stock .stock-indicator {
      background: #fd7e14;
    }

    .stock-status.low-stock {
      color: #fd7e14;
    }

    .stock-status.out-of-stock .stock-indicator {
      background: #dc3545;
    }

    .stock-status.out-of-stock {
      color: #dc3545;
    }

    .stock-quantity {
      color: #666;
      font-size: 0.9rem;
    }

    .description h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .description p {
      line-height: 1.6;
      color: #666;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }

    .add-to-cart-btn {
      flex: 1;
      background: #28a745;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      background: #218838;
    }

    .add-to-cart-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .wishlist-btn {
      background: white;
      color: #007bff;
      border: 2px solid #007bff;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .wishlist-btn:hover {
      background: #007bff;
      color: white;
    }

    .heart-icon {
      font-size: 1.2rem;
    }

    .product-details {
      border-top: 1px solid #dee2e6;
      padding-top: 1.5rem;
    }

    .product-details h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .detail-item label {
      font-weight: 600;
      color: #666;
    }

    .related-products {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #dee2e6;
    }

    .related-products h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .related-item {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }

    .related-item:hover {
      transform: translateY(-2px);
    }

    .related-item img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .related-info {
      padding: 1rem;
    }

    .related-info h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }

    .related-price {
      margin: 0;
      font-weight: 600;
      color: #007bff;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  relatedProducts?: Product[];
  selectedImage?: string;
  loading = false;
  error?: string;
  isInWishlist = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id?: number) {
    const productId = id || +this.route.snapshot.params['id'];
    
    this.loading = true;
    this.error = undefined;

    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = this.getMainImage(product);
        this.loadRelatedProducts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = 'Failed to load product. Please try again.';
        this.loading = false;
      }
    });
  }

  loadRelatedProducts() {
    if (!this.product) return;

    // Load products from the same category
    this.productService.getCategoryProducts(this.product.categoryId, { 
      pageSize: 4 
    }).subscribe({
      next: (response) => {
        this.relatedProducts = response.items.filter(p => p.id !== this.product!.id);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  getMainImage(product: Product): string {
    const mainImage = product.images?.find(img => img.isMain);
    return mainImage?.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image';
  }

  selectImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
  }

  getStockClass(product: Product): string {
    if (product.stockQuantity === 0) return 'out-of-stock';
    if (product.stockQuantity <= 5) return 'low-stock';
    return 'in-stock';
  }

  getStockText(product: Product): string {
    if (product.stockQuantity === 0) return 'Out of Stock';
    if (product.stockQuantity <= 5) return 'Low Stock';
    return 'In Stock';
  }

  addToCart() {
    if (!this.product || this.product.stockQuantity === 0) return;
    
    // TODO: Implement cart functionality
    console.log('Adding to cart:', this.product);
    alert('Product added to cart! (Cart functionality to be implemented)');
  }

  toggleWishlist() {
    this.isInWishlist = !this.isInWishlist;
    
    // TODO: Implement wishlist functionality
    console.log('Wishlist toggled:', this.isInWishlist);
    
    if (this.isInWishlist) {
      alert('Product added to wishlist! (Wishlist functionality to be implemented)');
    } else {
      alert('Product removed from wishlist!');
    }
  }
}
