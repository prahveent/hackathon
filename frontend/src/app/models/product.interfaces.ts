export interface ProductSummary {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  mainImageUrl?: string;
  rating: number;
  reviewCount: number;
  isOnSale: boolean;
  discountPercentage?: number;
  isInStock: boolean;
  isFeatured: boolean;
  category: CategorySummary;
  brand?: BrandSummary;
}

export interface ProductDetail {
  id: number;
  name: string;
  description?: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stockQuantity: number;
  status: string;
  mainImageUrl?: string;
  rating: number;
  reviewCount: number;
  viewCount: number;
  isOnSale: boolean;
  discountPercentage?: number;
  isInStock: boolean;
  isLowStock: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: CategoryDetail;
  brand?: BrandDetail;
  productImages: ProductImage[];
  productAttributes: ProductAttribute[];
}

export interface CategorySummary {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface CategoryDetail {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
}

export interface BrandSummary {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface BrandDetail {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  productCount: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isMain: boolean;
}

export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
  displayOrder: number;
}

export interface ProductSearchRequest {
  query?: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResponse {
  products: ProductSummary[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  availableCategories: CategorySummary[];
  availableBrands: BrandSummary[];
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductFilters {
  query: string;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  onSale: boolean;
  inStock: boolean;
  featured: boolean;
  sortBy: string;
  sortDirection: string;
} 