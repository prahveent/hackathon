import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductListComponent } from '../components/products/product-list/product-list.component';
import { CategoryNavComponent } from '../components/products/category-nav/category-nav.component';
import { Category } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ProductListComponent, CategoryNavComponent],
  template: `
    <div class="category-page">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading category...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadCategory()" class="retry-btn">Try Again</button>
      </div>

      <!-- Category Content -->
      <div *ngIf="category && !loading && !error">
        <div class="page-header">
          <h1>{{ category.name }}</h1>
          <p *ngIf="category.description">{{ category.description }}</p>
          <div class="category-meta">
            <span class="product-count" *ngIf="category.productCount !== undefined">
              {{ category.productCount }} products available
            </span>
          </div>
        </div>
        
        <div class="category-layout">
          <aside class="sidebar">
            <app-category-nav></app-category-nav>
          </aside>
          
          <main class="main-content">
            <app-product-list 
              [title]="'Products in ' + category.name"
              [categoryId]="category.id"
              [queryParams]="{ pageSize: 12 }">
            </app-product-list>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-page {
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
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      border-radius: 8px;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .page-header p {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .category-meta {
      margin-top: 1rem;
    }

    .product-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .category-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .category-layout {
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
export class CategoryPageComponent implements OnInit {
  category?: Category;
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
        this.loadCategory(id);
      }
    });
  }

  loadCategory(id?: number) {
    const categoryId = id || +this.route.snapshot.params['id'];
    
    this.loading = true;
    this.error = undefined;

    this.productService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.error = 'Failed to load category. Please try again.';
        this.loading = false;
      }
    });
  }
}
