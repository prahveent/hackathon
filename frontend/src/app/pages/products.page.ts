import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../components/products/product-list/product-list.component';
import { CategoryNavComponent } from '../components/products/category-nav/category-nav.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductListComponent, CategoryNavComponent],
  template: `
    <div class="products-page">
      <div class="page-header">
        <h1>Products</h1>
        <p>Discover our wide range of products</p>
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
  `,
  styles: [`
    .products-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
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
    }

    .page-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
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
  `]
})
export class ProductsPageComponent implements OnInit {

  constructor() {}

  ngOnInit() {}
}
