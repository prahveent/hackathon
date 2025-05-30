import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProductSearchRequest,
  CategoryDetail,
  BrandDetail
} from '../../../models/product.interfaces';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-search.html',
  styleUrls: ['./product-search.scss']
})
export class ProductSearchComponent implements OnInit, OnChanges {
  @Input() categories: CategoryDetail[] = [];
  @Input() brands: BrandDetail[] = [];
  @Input() currentRequest: ProductSearchRequest = {};
  @Input() minPrice?: number;
  @Input() maxPrice?: number;
  
  @Output() filtersChanged = new EventEmitter<ProductSearchRequest>();
  @Output() sortChanged = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

  // Form model
  filters = {
    query: '',
    categoryId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    onSale: false,
    inStock: false,
    featured: false,
    sortBy: 'name',
    sortDirection: 'asc'
  };

  // UI state
  showAdvancedFilters = false;
  priceRange = { min: 0, max: 1000 };

  ngOnInit(): void {
    this.syncFiltersFromRequest();
  }

  ngOnChanges(): void {
    this.syncFiltersFromRequest();
    if (this.minPrice !== undefined && this.maxPrice !== undefined) {
      this.priceRange = { min: this.minPrice, max: this.maxPrice };
    }
  }

  private syncFiltersFromRequest(): void {
    if (this.currentRequest) {
      this.filters = {
        query: this.currentRequest.query || '',
        categoryId: this.currentRequest.categoryId,
        brandId: this.currentRequest.brandId,
        minPrice: this.currentRequest.minPrice,
        maxPrice: this.currentRequest.maxPrice,
        onSale: this.currentRequest.onSale || false,
        inStock: this.currentRequest.inStock || false,
        featured: this.currentRequest.featured || false,
        sortBy: this.currentRequest.sortBy || 'name',
        sortDirection: this.currentRequest.sortDirection || 'asc'
      };
    }
  }

  onSearchInput(): void {
    this.emitFilters();
  }

  onFilterChange(): void {
    this.emitFilters();
  }

  onSortChange(): void {
    this.sortChanged.emit(this.filters.sortBy);
  }

  onClearFilters(): void {
    this.filters = {
      query: '',
      categoryId: undefined,
      brandId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      onSale: false,
      inStock: false,
      featured: false,
      sortBy: 'name',
      sortDirection: 'asc'
    };
    this.clearFilters.emit();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  private emitFilters(): void {
    const request: ProductSearchRequest = {
      ...this.filters,
      categoryId: this.filters.categoryId || undefined,
      brandId: this.filters.brandId || undefined,
      minPrice: this.filters.minPrice || undefined,
      maxPrice: this.filters.maxPrice || undefined,
      query: this.filters.query || undefined
    };

    // Remove empty values
    Object.keys(request).forEach(key => {
      if (request[key as keyof ProductSearchRequest] === '' || 
          request[key as keyof ProductSearchRequest] === undefined ||
          request[key as keyof ProductSearchRequest] === null) {
        delete request[key as keyof ProductSearchRequest];
      }
    });

    this.filtersChanged.emit(request);
  }

  // Helper methods
  hasActiveFilters(): boolean {
    return !!(
      this.filters.query ||
      this.filters.categoryId ||
      this.filters.brandId ||
      this.filters.minPrice ||
      this.filters.maxPrice ||
      this.filters.onSale ||
      this.filters.inStock ||
      this.filters.featured
    );
  }

  getSelectedCategoryName(): string {
    if (!this.filters.categoryId) return '';
    const category = this.categories.find(c => c.id === this.filters.categoryId);
    return category ? category.name : '';
  }

  getSelectedBrandName(): string {
    if (!this.filters.brandId) return '';
    const brand = this.brands.find(b => b.id === this.filters.brandId);
    return brand ? brand.name : '';
  }

  getSortOptions() {
    return [
      { value: 'name', label: 'Name' },
      { value: 'price', label: 'Price' },
      { value: 'rating', label: 'Rating' },
      { value: 'newest', label: 'Newest' },
      { value: 'popularity', label: 'Popular' }
    ];
  }
}
