import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductListComponent } from '../components/products/product-list/product-list.component';
import { CategoryNavComponent } from '../components/products/category-nav/category-nav.component';
import { AuthService } from '../services/auth.service';
import { User, UserRole } from '../models/auth.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductListComponent, CategoryNavComponent],  template: `
    <div class="products-page">
      <div class="navigation-header">
        <button class="back-btn" (click)="goBack()">
          <span>←</span> Back to Dashboard
        </button>
      </div>
      
      <div class="page-header">
        <h1>Products</h1>
        <p>Discover our wide range of products</p>
        
        <!-- Admin Controls -->
        <div class="admin-controls" *ngIf="isAdmin">
          <button class="btn btn-success" (click)="addNewProduct()">
            <span>➕</span> Add New Product
          </button>
          <button class="btn btn-info" (click)="manageCategories()">
            <span>📁</span> Manage Categories
          </button>
          <button class="btn btn-warning" (click)="manageBrands()">
            <span>🏷️</span> Manage Brands
          </button>
        </div>
      </div>
      
      <div class="products-layout">
        <aside class="sidebar">
          <app-category-nav></app-category-nav>
        </aside>
        
        <main class="main-content">
          <app-product-list 
            title="All Products"
            [queryParams]="{ pageSize: 12 }">
          </app-product-list>
        </main>
      </div>
    </div>
  `,  styles: [`
    .products-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    .navigation-header {
      margin-bottom: 1rem;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      color: #495057;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .back-btn:hover {
      background: #e9ecef;
      border-color: #adb5bd;
      color: #212529;
    }

    .back-btn span {
      font-size: 1.1rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 2rem 0;
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border-radius: 8px;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
    }    .page-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .admin-controls {
      margin-top: 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .admin-controls .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      color: white;
      text-decoration: none;
    }

    .admin-controls .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .admin-controls .btn-success {
      background: #28a745;
    }

    .admin-controls .btn-success:hover {
      background: #218838;
    }

    .admin-controls .btn-info {
      background: #17a2b8;
    }

    .admin-controls .btn-info:hover {
      background: #138496;
    }

    .admin-controls .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .admin-controls .btn-warning:hover {
      background: #e0a800;
    }

    .products-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .products-layout {
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

    .admin-controls {
      margin-top: 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .admin-controls .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      color: white;
      text-decoration: none;
    }

    .admin-controls .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .admin-controls .btn-success {
      background: #28a745;
    }

    .admin-controls .btn-success:hover {
      background: #218838;
    }

    .admin-controls .btn-info {
      background: #17a2b8;
    }

    .admin-controls .btn-info:hover {
      background: #138496;
    }

    .admin-controls .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .admin-controls .btn-warning:hover {
      background: #e0a800;
    }
  `]
})
export class ProductsPageComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === UserRole.Administrator;
    });
  }

  goBack(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/customer-dashboard']);
    }
  }

  addNewProduct(): void {
    // TODO: Navigate to add product page or open modal
    alert('Add New Product functionality coming soon!');
  }

  manageCategories(): void {
    // TODO: Navigate to categories management page
    alert('Manage Categories functionality coming soon!');
  }

  manageBrands(): void {
    // TODO: Navigate to brands management page
    alert('Manage Brands functionality coming soon!');
  }
}
