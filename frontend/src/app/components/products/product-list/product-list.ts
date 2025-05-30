import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';

import { ProductService } from '../../../services/product.service';
import { ProductCardComponent } from '../product-card/product-card';
import { ProductSearchComponent } from '../product-search/product-search';
import {
  ProductSummary,
  ProductSearchResponse,
  ProductSearchRequest,
  CategoryDetail,
  BrandDetail
} from '../../../models/product.interfaces';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, ProductSearchComponent],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data - make public for template access
  public products: ProductSummary[] = [];
  public categories: CategoryDetail[] = [];
  public brands: BrandDetail[] = [];
  public searchResponse: ProductSearchResponse | null = null;
  
  // State - make public for template access  
  public loading = false;
  public error: string | null = null;
  
  // Search and Filters - make public for template access
  public currentRequest: ProductSearchRequest = {
    page: 1,
    pageSize: 12,
    sortBy: 'name',
    sortDirection: 'asc'
  };
  
  // View options - make public for template access
  public viewMode: 'grid' | 'list' = 'grid';
  public gridColumns: number = 3;

  // Make Math available in template
  public Math = Math;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserPreferences();
    this.loadInitialData();
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadInitialData(): Promise<void> {
    try {
      // Load categories and brands for filters
      const [categories, brands] = await Promise.all([
        firstValueFrom(this.productService.getCategories()),
        firstValueFrom(this.productService.getBrands())
      ]);

      this.categories = categories || [];
      this.brands = brands || [];
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  private handleRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.currentRequest = {
          ...this.currentRequest,
          query: params['q'] || undefined,
          categoryId: params['categoryId'] ? +params['categoryId'] : undefined,
          brandId: params['brandId'] ? +params['brandId'] : undefined,
          minPrice: params['minPrice'] ? +params['minPrice'] : undefined,
          maxPrice: params['maxPrice'] ? +params['maxPrice'] : undefined,
          onSale: params['onSale'] === 'true',
          inStock: params['inStock'] === 'true',
          featured: params['featured'] === 'true',
          sortBy: params['sortBy'] || 'name',
          sortDirection: params['sortDirection'] || 'asc',
          page: params['page'] ? +params['page'] : 1,
          pageSize: params['pageSize'] ? +params['pageSize'] : 12
        };

        this.searchProducts();
      });
  }

  // Make public for template access
  public searchProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.searchProducts(this.currentRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.searchResponse = response;
          this.products = response.products;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load products. Please try again.';
          this.loading = false;
          console.error('Search products error:', error);
        }
      });
  }

  // Make public for template access
  public onFiltersChanged(filters: ProductSearchRequest): void {
    this.currentRequest = { ...this.currentRequest, ...filters, page: 1 };
    this.updateUrlParams();
    this.searchProducts();
  }

  // Make public for template access
  public onSortChanged(sortBy: string): void {
    const sortDirection = this.currentRequest.sortBy === sortBy && this.currentRequest.sortDirection === 'asc' ? 'desc' : 'asc';
    this.currentRequest = { ...this.currentRequest, sortBy, sortDirection, page: 1 };
    this.updateUrlParams();
    this.searchProducts();
  }

  // Make public for template access
  public onPageChanged(page: number): void {
    this.currentRequest = { ...this.currentRequest, page };
    this.updateUrlParams();
    this.searchProducts();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Make public for template access
  public onPageSizeChanged(pageSize: number): void {
    this.currentRequest = { ...this.currentRequest, pageSize, page: 1 };
    this.updateUrlParams();
    this.searchProducts();
  }

  // Make public for template access
  public onViewModeChanged(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('productViewMode', mode);
  }

  // Make public for template access
  public onGridColumnsChanged(columns: number): void {
    this.gridColumns = columns;
    localStorage.setItem('productGridColumns', columns.toString());
  }

  private updateUrlParams(): void {
    const queryParams: any = {};
    
    if (this.currentRequest.query) queryParams.q = this.currentRequest.query;
    if (this.currentRequest.categoryId) queryParams.categoryId = this.currentRequest.categoryId;
    if (this.currentRequest.brandId) queryParams.brandId = this.currentRequest.brandId;
    if (this.currentRequest.minPrice) queryParams.minPrice = this.currentRequest.minPrice;
    if (this.currentRequest.maxPrice) queryParams.maxPrice = this.currentRequest.maxPrice;
    if (this.currentRequest.onSale) queryParams.onSale = this.currentRequest.onSale;
    if (this.currentRequest.inStock) queryParams.inStock = this.currentRequest.inStock;
    if (this.currentRequest.featured) queryParams.featured = this.currentRequest.featured;
    if (this.currentRequest.sortBy !== 'name') queryParams.sortBy = this.currentRequest.sortBy;
    if (this.currentRequest.sortDirection !== 'asc') queryParams.sortDirection = this.currentRequest.sortDirection;
    if (this.currentRequest.page && this.currentRequest.page > 1) queryParams.page = this.currentRequest.page;
    if (this.currentRequest.pageSize !== 12) queryParams.pageSize = this.currentRequest.pageSize;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  // Pagination helpers - make public for template access
  public getPaginationPages(): number[] {
    if (!this.searchResponse) return [];
    
    const currentPage = this.searchResponse.currentPage;
    const totalPages = this.searchResponse.totalPages;
    const pages: number[] = [];
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // View helpers - make public for template access
  public getGridClass(): string {
    return `grid-${this.gridColumns}`;
  }

  // Make public for template access
  public clearFilters(): void {
    this.currentRequest = {
      page: 1,
      pageSize: 12,
      sortBy: 'name',
      sortDirection: 'asc'
    };
    this.updateUrlParams();
    this.searchProducts();
  }

  // Navigation methods - make public for template access
  public goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  public goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Track by function for performance - make public for template access
  public trackByProductId(index: number, product: ProductSummary): number {
    return product.id;
  }

  // Load saved preferences
  private loadUserPreferences(): void {
    const savedViewMode = localStorage.getItem('productViewMode') as 'grid' | 'list';
    if (savedViewMode) {
      this.viewMode = savedViewMode;
    }

    const savedGridColumns = localStorage.getItem('productGridColumns');
    if (savedGridColumns) {
      this.gridColumns = parseInt(savedGridColumns, 10);
    }
  }
}
