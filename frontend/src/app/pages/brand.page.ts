import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductListComponent } from '../components/products/product-list/product-list.component';
import { CategoryNavComponent } from '../components/products/category-nav/category-nav.component';
import { Brand } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, ProductListComponent, CategoryNavComponent],
  template: `
    <div class="brand-page">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading brand...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadBrand()" class="retry-btn">Try Again</button>
      </div>

      <!-- Brand Content -->
      <div *ngIf="brand && !loading && !error">
        <div class="page-header">
          <div class="brand-info">
            <div class="brand-logo" *ngIf="brand.logoUrl">
              <img [src]="brand.logoUrl" [alt]="brand.name + ' logo'" (error)="onLogoError($event)" />
            </div>
            <div class="brand-details">
              <h1>{{ brand.name }}</h1>
              <p *ngIf="brand.description">{{ brand.description }}</p>
              <div class="brand-meta">
                <span class="product-count" *ngIf="brand.productCount !== undefined">
                  {{ brand.productCount }} products available
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="brand-layout">
          <aside class="sidebar">
            <app-category-nav></app-category-nav>
          </aside>
          
          <main class="main-content">
            <app-product-list 
              [title]="'Products by ' + brand.name"
              [brandId]="brand.id"
              [queryParams]="{ pageSize: 12 }">
            </app-product-list>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .brand-page {
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

    .page-header {
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #6f42c1, #e83e8c);
      color: white;
      border-radius: 8px;
    }

    .brand-info {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .brand-logo {
      flex-shrink: 0;
    }

    .brand-logo img {
      width: 100px;
      height: 100px;
      object-fit: contain;
      background: white;
      border-radius: 8px;
      padding: 1rem;
    }

    .brand-details {
      flex: 1;
    }

    .brand-details h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .brand-details p {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      opacity: 0.9;
      line-height: 1.5;
    }

    .brand-meta {
      margin-top: 1rem;
    }

    .product-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .brand-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .brand-info {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .brand-layout {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .sidebar {
        order: 2;
      }
      
      .main-content {
        order: 1;
      }
    }

    .sidebar {
      position: sticky;
      top: 1rem;
      height: fit-content;
    }

    .main-content {
      min-height: 500px;
    }
  `]
})
export class BrandPageComponent implements OnInit {
  brand?: Brand;
  loading = false;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadBrand(id);
      }
    });
  }

  loadBrand(id?: number) {
    const brandId = id || +this.route.snapshot.params['id'];
    
    this.loading = true;
    this.error = undefined;

    this.productService.getBrand(brandId).subscribe({
      next: (brand) => {
        this.brand = brand;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading brand:', error);
        this.error = 'Failed to load brand. Please try again.';
        this.loading = false;
      }
    });
  }

  onLogoError(event: any) {
    event.target.style.display = 'none';
  }
}
