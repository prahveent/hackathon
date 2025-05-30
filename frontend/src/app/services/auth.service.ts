import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ChangePasswordRequest,
  UserRole 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5139/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Load user and token from localStorage on service initialization
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip localStorage access on server
    }

    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.clearStoredAuth();
      }
    }
  }

  private storeAuth(authResponse: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip localStorage access on server
    }

    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('current_user', JSON.stringify(authResponse.user));
    localStorage.setItem('token_expires_at', authResponse.expiresAt);
  }

  private clearStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip localStorage access on server
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('token_expires_at');
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => {
          this.storeAuth(response);
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          this.storeAuth(response);
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearStoredAuth();
          this.tokenSubject.next(null);
          this.currentUserSubject.next(null);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, request);
  }

  isAuthenticated(): boolean {
    const token = this.tokenSubject.value;
    if (!token) return false;

    // Check if token is expired
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        this.logout().subscribe();
        return false;
      }
    }

    return true;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole(UserRole.Administrator);
  }

  isCustomer(): boolean {
    return this.hasRole(UserRole.Customer);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }
}
