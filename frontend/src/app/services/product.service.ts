import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Product, 
  Category, 
  Brand, 
  CreateProductDto, 
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBrandDto,
  UpdateBrandDto,
  ProductQueryParams,
  PaginatedResponse
} from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl || 'https://localhost:5139/api';

  constructor(private http: HttpClient) {}

  // Product endpoints
  getProducts(params?: ProductQueryParams): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.categoryId !== undefined) httpParams = httpParams.set('categoryId', params.categoryId.toString());
      if (params.brandId !== undefined) httpParams = httpParams.set('brandId', params.brandId.toString());
      if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      if (params.inStock !== undefined) httpParams = httpParams.set('inStock', params.inStock.toString());
      if (params.featured !== undefined) httpParams = httpParams.set('featured', params.featured.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/products`, { params: httpParams });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/featured`);
  }

  createProduct(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Category endpoints
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  getCategoryProducts(id: number, params?: ProductQueryParams): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      if (params.inStock !== undefined) httpParams = httpParams.set('inStock', params.inStock.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/categories/${id}/products`, { params: httpParams });
  }

  createCategory(category: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: UpdateCategoryDto): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // Brand endpoints
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands`);
  }

  getBrand(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.apiUrl}/brands/${id}`);
  }

  getBrandProducts(id: number, params?: ProductQueryParams): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      if (params.inStock !== undefined) httpParams = httpParams.set('inStock', params.inStock.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/brands/${id}/products`, { params: httpParams });
  }

  createBrand(brand: CreateBrandDto): Observable<Brand> {
    return this.http.post<Brand>(`${this.apiUrl}/brands`, brand);
  }

  updateBrand(id: number, brand: UpdateBrandDto): Observable<Brand> {
    return this.http.put<Brand>(`${this.apiUrl}/brands/${id}`, brand);
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/brands/${id}`);
  }
}
