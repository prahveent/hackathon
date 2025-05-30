import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../models/auth.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>SmartCart - Customer Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ currentUser?.firstName }} {{ currentUser?.lastName }}!</span>
          <button class="btn btn-outline" (click)="logout()">Logout</button>
        </div>
      </header>

      <main class="dashboard-content">
        <div class="welcome-section">
          <h2>Welcome to SmartCart</h2>
          <p>Your intelligent shopping companion is ready to help you find the best products and deals.</p>
        </div>        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🛍️</div>
            <h3>Browse Products</h3>
            <p>Explore our wide range of products with intelligent recommendations.</p>
            <button class="btn btn-primary" (click)="navigateToProducts()">Start Shopping</button>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🏷️</div>
            <h3>Categories</h3>
            <p>Shop by category to find exactly what you're looking for.</p>
            <button class="btn btn-primary" (click)="navigateToCategories()">Browse Categories</button>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🛒</div>
            <h3>Shopping Cart</h3>
            <p>Manage your cart with smart suggestions and price optimization.</p>
            <button class="btn btn-primary" (click)="navigateToCart()">View Cart</button>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Order History</h3>
            <p>Track your orders and reorder your favorite items easily.</p>
            <button class="btn btn-primary" (click)="navigateToOrders()">View Orders</button>
          </div>        </div>

        <!-- Featured Products Section -->
        <div class="featured-section" *ngIf="featuredProducts.length > 0">
          <h3>Featured Products</h3>
          <div class="featured-products">
            <div 
              *ngFor="let product of featuredProducts.slice(0, 4)"
              class="featured-product"
              [routerLink]="['/products', product.id]"
            >
              <div class="product-image">
                <img 
                  [src]="getMainImage(product)" 
                  [alt]="product.name"
                  (error)="onImageError($event)"
                />
              </div>
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p class="product-price">\${{ product.price | number:'1.2-2' }}</p>
                <p class="product-brand" *ngIf="product.brand">{{ product.brand.name }}</p>
              </div>
            </div>
          </div>
          <div class="view-all">
            <button class="btn btn-outline" (click)="navigateToProducts()">View All Products</button>
          </div>
        </div>

        <div class="profile-section">
          <div class="feature-card">
            <div class="feature-icon">👤</div>
            <h3>Profile Settings</h3>
            <p>Manage your account information and preferences.</p>
            <button class="btn btn-primary" (click)="navigateToProfile()">Edit Profile</button>
          </div>
        </div>

        <div class="quick-stats">
          <h3>Quick Stats</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">0</span>
              <span class="stat-label">Items in Cart</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">0</span>
              <span class="stat-label">Total Orders</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">$0.00</span>
              <span class="stat-label">Total Spent</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .dashboard-header {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-header h1 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info span {
      color: #666;
      font-weight: 500;
    }

    .dashboard-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .welcome-section h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .welcome-section p {
      color: #666;
      font-size: 1.1rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0,0,0,0.15);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .quick-stats {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .quick-stats h3 {
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
    }    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .featured-section {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-top: 2rem;
    }

    .featured-section h3 {
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .featured-products {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .featured-product {
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }

    .featured-product:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }

    .product-image {
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-info {
      padding: 1rem;
    }

    .product-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.1rem;
    }

    .product-price {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #667eea;
    }

    .product-brand {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    .view-all {
      text-align: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background-color: #5a6fd8;
    }

    .btn-outline {
      background-color: transparent;
      color: #667eea;
      border: 1px solid #667eea;
    }

    .btn-outline:hover {
      background-color: #667eea;
      color: white;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .dashboard-content {
        padding: 1rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  featuredProducts: Product[] = [];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private router: Router
  ) {}  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Load featured products
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
      }
    });
  }

  getMainImage(product: Product): string {
    const mainImage = product.images?.find(img => img.isMain);
    return mainImage?.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image';
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/products']); // Will show categories in sidebar
  }

  navigateToCart(): void {
    // TODO: Navigate to cart page when implemented
    console.log('Navigate to cart');
  }

  navigateToOrders(): void {
    // TODO: Navigate to orders page when implemented
    console.log('Navigate to orders');
  }

  navigateToProfile(): void {
    // TODO: Navigate to profile page when implemented
    console.log('Navigate to profile');
  }
}
