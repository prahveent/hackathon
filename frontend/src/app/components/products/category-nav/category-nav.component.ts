import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-nav">
      <h3>Categories</h3>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <div class="spinner-small"></div>
        Loading categories...
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button (click)="loadCategories()" class="retry-btn-small">Retry</button>
      </div>

      <!-- Categories List -->
      <div *ngIf="!loading && !error" class="categories-list">
        <div *ngIf="!categories.length" class="empty-state">
          No categories available
        </div>
        
        <div *ngFor="let category of categories" class="category-item">
          <a 
            [routerLink]="['/categories', category.id]"
            class="category-link"
            [class.has-children]="category.children && category.children.length > 0"
          >
            <span class="category-name">{{ category.name }}</span>
            <span class="product-count" *ngIf="category.productCount !== undefined">
              ({{ category.productCount }})
            </span>
            <span class="expand-icon" *ngIf="category.children && category.children.length > 0">
              {{ isExpanded(category.id) ? '−' : '+' }}
            </span>
          </a>
          
          <!-- Subcategories -->
          <div 
            *ngIf="category.children && category.children.length > 0 && isExpanded(category.id)" 
            class="subcategories"
          >
            <a 
              *ngFor="let child of category.children"
              [routerLink]="['/categories', child.id]"
              class="subcategory-link"
            >
              <span class="subcategory-name">{{ child.name }}</span>
              <span class="product-count" *ngIf="child.productCount !== undefined">
                ({{ child.productCount }})
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-nav {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }

    .category-nav h3 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      color: #dc3545;
      font-size: 0.9rem;
    }

    .retry-btn-small {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }

    .empty-state {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 1rem;
    }

    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item {
      border-radius: 4px;
      overflow: hidden;
    }

    .category-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      text-decoration: none;
      color: #333;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .category-link:hover {
      background-color: #f8f9fa;
    }

    .category-link.has-children {
      cursor: pointer;
    }

    .category-name {
      flex: 1;
      font-weight: 500;
    }

    .product-count {
      color: #666;
      font-size: 0.9rem;
    }

    .expand-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e9ecef;
      border-radius: 50%;
      font-size: 0.8rem;
      font-weight: bold;
      color: #495057;
    }

    .subcategories {
      background: #f8f9fa;
      border-left: 3px solid #007bff;
      margin-left: 1rem;
    }

    .subcategory-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: #495057;
      transition: background-color 0.2s;
    }

    .subcategory-link:hover {
      background-color: #e9ecef;
    }

    .subcategory-name {
      flex: 1;
      font-size: 0.9rem;
    }

    .subcategory-link .product-count {
      font-size: 0.8rem;
    }

    /* Router active states */
    .category-link.active,
    .subcategory-link.active {
      background-color: #007bff;
      color: white;
    }

    .category-link.active .product-count,
    .subcategory-link.active .product-count {
      color: rgba(255, 255, 255, 0.8);
    }

    .category-link.active .expand-icon {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
  `]
})
export class CategoryNavComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error?: string;
  expandedCategories = new Set<number>();

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = undefined;

    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = this.buildCategoryTree(categories);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories.';
        this.loading = false;
      }
    });
  }

  private buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build parent-child relationships
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  toggleExpanded(categoryId: number) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }
}
