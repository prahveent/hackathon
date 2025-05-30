import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, delay } from 'rxjs';
import {
  ProductSummary,
  ProductDetail,
  ProductSearchRequest,
  ProductSearchResponse,
  CategoryDetail,
  BrandDetail,
  ProductFilters
} from '../models/product.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'https://localhost:7103/api/products'; // Backend API URL
  private readonly useMockData = true; // Set to false when backend is available
  
  // State management for filters
  private filtersSubject = new BehaviorSubject<ProductFilters>({
    query: '',
    onSale: false,
    inStock: false,
    featured: false,
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  public filters$ = this.filtersSubject.asObservable();

  // Mock data
  private mockCategories: CategoryDetail[] = [
    { id: 1, name: 'Electronics', description: 'Latest electronic gadgets and devices', productCount: 25, isActive: true, displayOrder: 1 },
    { id: 2, name: 'Clothing', description: 'Fashion and apparel for all ages', productCount: 30, isActive: true, displayOrder: 2 },
    { id: 3, name: 'Home & Garden', description: 'Home improvement and gardening supplies', productCount: 20, isActive: true, displayOrder: 3 },
    { id: 4, name: 'Sports & Outdoor', description: 'Sports equipment and outdoor gear', productCount: 15, isActive: true, displayOrder: 4 },
    { id: 5, name: 'Books', description: 'Books, magazines, and literature', productCount: 12, isActive: true, displayOrder: 5 }
  ];

  private mockBrands: BrandDetail[] = [
    { id: 1, name: 'TechnoCore', description: 'Premium technology products', productCount: 18, isActive: true },
    { id: 2, name: 'StyleHub', description: 'Modern fashion and lifestyle', productCount: 22, isActive: true },
    { id: 3, name: 'HomeComfort', description: 'Quality home and garden products', productCount: 16, isActive: true },
    { id: 4, name: 'ActiveLife', description: 'Sports and outdoor equipment', productCount: 14, isActive: true },
    { id: 5, name: 'BookWorld', description: 'Wide selection of books and media', productCount: 12, isActive: true }
  ];

  private mockProducts: ProductDetail[] = [
    {
      id: 1, name: 'Wireless Bluetooth Headphones', description: 'High-quality wireless headphones with noise cancellation',
      detailedDescription: 'Premium wireless headphones featuring advanced noise cancellation technology, 30-hour battery life, and exceptional sound quality.',
      price: 99.99, originalPrice: 129.99, sku: 'WHD-001', stockQuantity: 25, status: 'Active',
      rating: 4.5, reviewCount: 128, viewCount: 1250, isOnSale: true, discountPercentage: 23, isInStock: true, isLowStock: false, isFeatured: true,
      createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-20'),
      mainImageUrl: 'https://picsum.photos/400/400?random=1',
      category: { id: 1, name: 'Electronics', description: 'Latest electronic gadgets and devices', isActive: true, displayOrder: 1, productCount: 25 },
      brand: { id: 1, name: 'TechnoCore', description: 'Premium technology products', isActive: true, productCount: 18 },
      productImages: [
        { id: 1, imageUrl: 'https://picsum.photos/400/400?random=1', altText: 'Wireless Headphones', displayOrder: 1, isMain: true }
      ],
      productAttributes: [
        { id: 1, name: 'Battery Life', value: '30 hours', displayOrder: 1 },
        { id: 2, name: 'Connectivity', value: 'Bluetooth 5.0', displayOrder: 2 }
      ]
    },
    {
      id: 2, name: 'Cotton T-Shirt', description: 'Comfortable 100% cotton t-shirt',
      detailedDescription: 'Soft, breathable 100% cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes.',
      price: 24.99, originalPrice: 24.99, sku: 'CTS-002', stockQuantity: 50, status: 'Active',
      rating: 4.2, reviewCount: 89, viewCount: 890, isOnSale: false, isInStock: true, isLowStock: false, isFeatured: false,
      createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-15'),
      mainImageUrl: 'https://picsum.photos/400/400?random=2',
      category: { id: 2, name: 'Clothing', description: 'Fashion and apparel for all ages', isActive: true, displayOrder: 2, productCount: 30 },
      brand: { id: 2, name: 'StyleHub', description: 'Modern fashion and lifestyle', isActive: true, productCount: 22 },
      productImages: [
        { id: 2, imageUrl: 'https://picsum.photos/400/400?random=2', altText: 'Cotton T-Shirt', displayOrder: 1, isMain: true }
      ],
      productAttributes: [
        { id: 3, name: 'Material', value: '100% Cotton', displayOrder: 1 },
        { id: 4, name: 'Fit', value: 'Regular', displayOrder: 2 }
      ]
    },
    {
      id: 3, name: 'Smart Garden System', description: 'Automated indoor gardening system',
      detailedDescription: 'Advanced hydroponic system with LED grow lights and automated watering for growing herbs and vegetables indoors.',
      price: 199.99, originalPrice: 249.99, sku: 'SGS-003', stockQuantity: 8, status: 'Active',
      rating: 4.7, reviewCount: 156, viewCount: 2100, isOnSale: true, discountPercentage: 20, isInStock: true, isLowStock: true, isFeatured: true,
      createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-18'),
      mainImageUrl: 'https://picsum.photos/400/400?random=3',
      category: { id: 3, name: 'Home & Garden', description: 'Home improvement and gardening supplies', isActive: true, displayOrder: 3, productCount: 20 },
      brand: { id: 3, name: 'HomeComfort', description: 'Quality home and garden products', isActive: true, productCount: 16 },
      productImages: [
        { id: 3, imageUrl: 'https://picsum.photos/400/400?random=3', altText: 'Smart Garden System', displayOrder: 1, isMain: true }
      ],
      productAttributes: [
        { id: 5, name: 'Capacity', value: '12 plants', displayOrder: 1 },
        { id: 6, name: 'Light Type', value: 'Full spectrum LED', displayOrder: 2 }
      ]
    },
    {
      id: 4, name: 'Running Shoes', description: 'Lightweight running shoes for athletes',
      detailedDescription: 'Professional-grade running shoes with advanced cushioning technology and breathable mesh upper.',
      price: 89.99, originalPrice: 89.99, sku: 'RS-004', stockQuantity: 35, status: 'Active',
      rating: 4.4, reviewCount: 203, viewCount: 1850, isOnSale: false, isInStock: true, isLowStock: false, isFeatured: false,
      createdAt: new Date('2024-01-12'), updatedAt: new Date('2024-01-17'),
      mainImageUrl: 'https://picsum.photos/400/400?random=4',
      category: { id: 4, name: 'Sports & Outdoor', description: 'Sports equipment and outdoor gear', isActive: true, displayOrder: 4, productCount: 15 },
      brand: { id: 4, name: 'ActiveLife', description: 'Sports and outdoor equipment', isActive: true, productCount: 14 },
      productImages: [
        { id: 4, imageUrl: 'https://picsum.photos/400/400?random=4', altText: 'Running Shoes', displayOrder: 1, isMain: true }
      ],
      productAttributes: [
        { id: 7, name: 'Weight', value: '8.5 oz', displayOrder: 1 },
        { id: 8, name: 'Drop', value: '10mm', displayOrder: 2 }
      ]
    },
    {
      id: 5, name: 'Programming Cookbook', description: 'Comprehensive guide to modern programming',
      detailedDescription: 'Essential programming reference covering best practices, design patterns, and modern development techniques.',
      price: 39.99, originalPrice: 49.99, sku: 'PC-005', stockQuantity: 20, status: 'Active',
      rating: 4.6, reviewCount: 94, viewCount: 750, isOnSale: true, discountPercentage: 20, isInStock: true, isLowStock: false, isFeatured: true,
      createdAt: new Date('2024-01-08'), updatedAt: new Date('2024-01-16'),
      mainImageUrl: 'https://picsum.photos/400/400?random=5',
      category: { id: 5, name: 'Books', description: 'Books, magazines, and literature', isActive: true, displayOrder: 5, productCount: 12 },
      brand: { id: 5, name: 'BookWorld', description: 'Wide selection of books and media', isActive: true, productCount: 12 },
      productImages: [
        { id: 5, imageUrl: 'https://picsum.photos/400/400?random=5', altText: 'Programming Cookbook', displayOrder: 1, isMain: true }
      ],
      productAttributes: [
        { id: 9, name: 'Pages', value: '486', displayOrder: 1 },
        { id: 10, name: 'Edition', value: '3rd Edition', displayOrder: 2 }
      ]
    },
    {
      id: 6, name: 'Smartphone Case', description: 'Protective case for smartphones',
      detailedDescription: 'Durable protective case with shock absorption and wireless charging compatibility.',
      price: 19.99, originalPrice: 29.99, sku: 'SC-006', stockQuantity: 45, status: 'Active',
      rating: 4.1, reviewCount: 67, viewCount: 580, isOnSale: true, discountPercentage: 33, isInStock: true, isLowStock: false, isFeatured: false,
      createdAt: new Date('2024-01-14'), updatedAt: new Date('2024-01-19'),
      mainImageUrl: 'https://picsum.photos/400/400?random=6',
      category: { id: 1, name: 'Electronics', description: 'Latest electronic gadgets and devices', isActive: true, displayOrder: 1, productCount: 25 },
      brand: { id: 1, name: 'TechnoCore', description: 'Premium technology products', isActive: true, productCount: 18 },
      productImages: [
        { id: 6, imageUrl: 'https://picsum.photos/400/400?random=6', altText: 'Smartphone Case', displayOrder: 1, isMain: true }
      ],
      productAttributes: [
        { id: 11, name: 'Material', value: 'TPU + PC', displayOrder: 1 },
        { id: 12, name: 'Compatibility', value: 'iPhone 15 Pro', displayOrder: 2 }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  // Product search and listing
  searchProducts(request: ProductSearchRequest): Observable<ProductSearchResponse> {
    if (this.useMockData) {
      return this.getMockProducts(request).pipe(delay(500)); // Simulate network delay
    }

    let params = new HttpParams();
    
    if (request.query) params = params.set('query', request.query);
    if (request.categoryId) params = params.set('categoryId', request.categoryId.toString());
    if (request.brandId) params = params.set('brandId', request.brandId.toString());
    if (request.minPrice) params = params.set('minPrice', request.minPrice.toString());
    if (request.maxPrice) params = params.set('maxPrice', request.maxPrice.toString());
    if (request.onSale !== undefined) params = params.set('onSale', request.onSale.toString());
    if (request.inStock !== undefined) params = params.set('inStock', request.inStock.toString());
    if (request.featured !== undefined) params = params.set('featured', request.featured.toString());
    if (request.sortBy) params = params.set('sortBy', request.sortBy);
    if (request.sortDirection) params = params.set('sortDirection', request.sortDirection);
    if (request.page) params = params.set('page', request.page.toString());
    if (request.pageSize) params = params.set('pageSize', request.pageSize.toString());

    return this.http.get<ProductSearchResponse>(this.apiUrl, { params });
  }

  private getMockProducts(request: ProductSearchRequest): Observable<ProductSearchResponse> {
    let filteredProducts = [...this.mockProducts];

    // Apply filters
    if (request.query) {
      const query = request.query.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (request.categoryId) {
      filteredProducts = filteredProducts.filter(p => p.category.id === request.categoryId);
    }

    if (request.brandId) {
      filteredProducts = filteredProducts.filter(p => p.brand && p.brand.id === request.brandId);
    }

    if (request.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= request.minPrice!);
    }

    if (request.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= request.maxPrice!);
    }

    if (request.onSale) {
      filteredProducts = filteredProducts.filter(p => p.isOnSale);
    }

    if (request.inStock) {
      filteredProducts = filteredProducts.filter(p => p.isInStock);
    }

    if (request.featured) {
      filteredProducts = filteredProducts.filter(p => p.isFeatured);
    }

    // Apply sorting
    const sortBy = request.sortBy || 'name';
    const sortDirection = request.sortDirection || 'asc';
    
    filteredProducts.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const page = request.page || 1;
    const pageSize = request.pageSize || 12;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response: ProductSearchResponse = {
      products: paginatedProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        mainImageUrl: p.mainImageUrl,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isOnSale: p.isOnSale,
        discountPercentage: p.discountPercentage,
        isInStock: p.isInStock,
        isFeatured: p.isFeatured,
        category: {
          id: p.category.id,
          name: p.category.name,
          imageUrl: p.category.imageUrl
        },
        brand: p.brand ? {
          id: p.brand.id,
          name: p.brand.name,
          logoUrl: p.brand.logoUrl
        } : undefined
      })),
      totalCount: filteredProducts.length,
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
      hasNextPage: page < Math.ceil(filteredProducts.length / pageSize),
      hasPreviousPage: page > 1,
      availableCategories: this.mockCategories.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl })),
      availableBrands: this.mockBrands.map(b => ({ id: b.id, name: b.name, logoUrl: b.logoUrl })),
      minPrice: Math.min(...this.mockProducts.map(p => p.price)),
      maxPrice: Math.max(...this.mockProducts.map(p => p.price))
    };

    return of(response);
  }

  // Get product by ID
  getProduct(id: number): Observable<ProductDetail> {
    if (this.useMockData) {
      const product = this.mockProducts.find(p => p.id === id);
      return of(product!).pipe(delay(300));
    }
    return this.http.get<ProductDetail>(`${this.apiUrl}/${id}`);
  }

  // Get featured products
  getFeaturedProducts(count: number = 8): Observable<ProductSummary[]> {
    if (this.useMockData) {
      const featured = this.mockProducts
        .filter(p => p.isFeatured)
        .slice(0, count)
        .map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          originalPrice: p.originalPrice,
          mainImageUrl: p.mainImageUrl,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isOnSale: p.isOnSale,
          discountPercentage: p.discountPercentage,
          isInStock: p.isInStock,
          isFeatured: p.isFeatured,
          category: {
            id: p.category.id,
            name: p.category.name,
            imageUrl: p.category.imageUrl
          },
          brand: p.brand ? {
            id: p.brand.id,
            name: p.brand.name,
            logoUrl: p.brand.logoUrl
          } : undefined
        }));
      return of(featured).pipe(delay(200));
    }

    const params = new HttpParams().set('count', count.toString());
    return this.http.get<ProductSummary[]>(`${this.apiUrl}/featured`, { params });
  }

  // Search products by query
  searchProductsByQuery(query: string, filters: ProductSearchRequest = {}): Observable<ProductSearchResponse> {
    return this.searchProducts({ ...filters, query });
  }

  // Category-related methods
  getCategories(): Observable<CategoryDetail[]> {
    if (this.useMockData) {
      return of(this.mockCategories).pipe(delay(150));
    }
    return this.http.get<CategoryDetail[]>(`${this.apiUrl}/categories`);
  }

  getProductsByCategory(categoryId: number, filters: ProductSearchRequest = {}): Observable<ProductSearchResponse> {
    return this.searchProducts({ ...filters, categoryId });
  }

  // Brand-related methods
  getBrands(): Observable<BrandDetail[]> {
    if (this.useMockData) {
      return of(this.mockBrands).pipe(delay(150));
    }
    return this.http.get<BrandDetail[]>(`${this.apiUrl}/brands`);
  }

  getProductsByBrand(brandId: number, filters: ProductSearchRequest = {}): Observable<ProductSearchResponse> {
    return this.searchProducts({ ...filters, brandId });
  }

  // Filter management
  updateFilters(filters: Partial<ProductFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  getCurrentFilters(): ProductFilters {
    return this.filtersSubject.value;
  }

  resetFilters(): void {
    this.filtersSubject.next({
      query: '',
      onSale: false,
      inStock: false,
      featured: false,
      sortBy: 'name',
      sortDirection: 'asc'
    });
  }

  // Helper methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  calculateSavings(originalPrice: number, currentPrice: number): number {
    return originalPrice - currentPrice;
  }

  generateStarRating(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    
    if (hasHalfStar) {
      stars.push('half');
    }
    
    while (stars.length < 5) {
      stars.push('empty');
    }
    
    return stars;
  }

  getStockStatusClass(product: ProductSummary | ProductDetail): string {
    if (!product.isInStock) return 'out-of-stock';
    if ('isLowStock' in product && product.isLowStock) return 'low-stock';
    return 'in-stock';
  }

  getStockStatusText(product: ProductSummary | ProductDetail): string {
    if (!product.isInStock) return 'Out of Stock';
    if ('isLowStock' in product && product.isLowStock) return 'Low Stock';
    return 'In Stock';
  }
} 