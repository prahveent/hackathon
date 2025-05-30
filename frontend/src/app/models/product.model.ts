export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  brandId: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  brand?: Brand;
  images: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children: Category[];
  productCount?: number;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  isMain: boolean;
  sortOrder: number;
}

// DTOs for creating/updating
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: number;
  brandId: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: number;
  brandId?: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentId?: number;
  isActive?: boolean;
}

export interface CreateBrandDto {
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface UpdateBrandDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

// Query parameters for filtering/pagination
export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
