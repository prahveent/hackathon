import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  LoginRequest,
  LoginResponse,
  RegisterCustomerRequest,
  RegisterAdminRequest,
  UserInfoResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
  AuthState
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:5001/api'; // Updated to match .NET API default HTTPS port
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_info');
    
    if (token && user) {
      try {
        const userInfo = JSON.parse(user);
        this.authStateSubject.next({
          isAuthenticated: true,
          user: userInfo,
          token: token,
          loading: false
        });
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  private getHttpOptions(includeAuth: boolean = false): { headers: HttpHeaders } {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (includeAuth) {
      const token = this.authStateSubject.value.token;
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return { headers };
  }

  private handleApiResponse<T>(response: ApiResponse<T>): T {
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'API request failed');
    }
  }

  private setAuthData(loginResponse: LoginResponse): void {
    localStorage.setItem('auth_token', loginResponse.token);
    localStorage.setItem('user_info', JSON.stringify(loginResponse.user));
    
    this.authStateSubject.next({
      isAuthenticated: true,
      user: loginResponse.user,
      token: loginResponse.token,
      loading: false
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false
    });
  }

  // Authentication Methods
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/auth/login`,
      credentials,
      this.getHttpOptions()
    ).pipe(
      map(response => {
        const loginData = this.handleApiResponse(response);
        this.setAuthData(loginData);
        this.setLoading(false);
        return loginData;
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  registerCustomer(customerData: RegisterCustomerRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/auth/register/customer`,
      customerData,
      this.getHttpOptions()
    ).pipe(
      map(response => {
        const loginData = this.handleApiResponse(response);
        this.setAuthData(loginData);
        this.setLoading(false);
        return loginData;
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  registerAdmin(adminData: RegisterAdminRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/auth/register/admin`,
      adminData,
      this.getHttpOptions(true)
    ).pipe(
      map(response => {
        const loginData = this.handleApiResponse(response);
        this.setLoading(false);
        return loginData;
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/auth/logout`,
      {},
      this.getHttpOptions(true)
    ).pipe(
      map(() => {
        this.clearAuthData();
      }),
      catchError(error => {
        // Clear auth data even if logout fails on server
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<UserInfoResponse> {
    return this.http.get<ApiResponse<UserInfoResponse>>(
      `${this.apiUrl}/auth/me`,
      this.getHttpOptions(true)
    ).pipe(
      map(response => this.handleApiResponse(response))
    );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<void> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/auth/change-password`,
      passwordData,
      this.getHttpOptions(true)
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
      })
    );
  }

  forgotPassword(emailData: ForgotPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/auth/forgot-password`,
      emailData,
      this.getHttpOptions()
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
      })
    );
  }

  resetPassword(resetData: ResetPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse>(
      `${this.apiUrl}/auth/reset-password`,
      resetData,
      this.getHttpOptions()
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message);
        }
      })
    );
  }

  // Utility Methods
  private setLoading(loading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      loading
    });
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  getCurrentUserInfo(): UserInfoResponse | null {
    return this.authStateSubject.value.user;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserInfo();
    return user ? user.roles.includes(role) : false;
  }

  isCustomer(): boolean {
    return this.hasRole('customer');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
} 