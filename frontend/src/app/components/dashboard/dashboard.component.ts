import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserInfoResponse } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="header">
        <div class="header-content">
          <h1>SmartCart Dashboard</h1>
          <div class="user-menu">
            <span class="welcome-text">Welcome, {{ getDisplayName() }}!</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <div class="dashboard-grid">
          <div class="info-card">
            <h2>Profile Information</h2>
            <div class="profile-info" *ngIf="user">
              <div class="info-item">
                <label>Name:</label>
                <span>{{ user.customerProfile?.firstName }} {{ user.customerProfile?.lastName }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-item" *ngIf="user.customerProfile?.phone">
                <label>Phone:</label>
                <span>{{ user.customerProfile.phone }}</span>
              </div>
              <div class="info-item">
                <label>Email Verified:</label>
                <span class="status" [class.verified]="user.emailVerified" [class.pending]="!user.emailVerified">
                  {{ user.emailVerified ? 'Verified' : 'Pending Verification' }}
                </span>
              </div>
              <div class="info-item" *ngIf="user.lastLogin">
                <label>Last Login:</label>
                <span>{{ formatDate(user.lastLogin) }}</span>
              </div>
            </div>
          </div>

          <div class="actions-card">
            <h2>Quick Actions</h2>
            <div class="action-buttons">
              <button class="action-btn primary">
                <span class="icon">🛍️</span>
                Browse Products
              </button>
              <button class="action-btn secondary">
                <span class="icon">📦</span>
                View Orders
              </button>
              <button class="action-btn secondary">
                <span class="icon">🛒</span>
                Shopping Cart
              </button>
              <button class="action-btn secondary" (click)="changePassword()">
                <span class="icon">🔐</span>
                Change Password
              </button>
            </div>
          </div>

          <div class="welcome-card">
            <h2>Welcome to SmartCart!</h2>
            <p>Your one-stop shop for all your needs. Start browsing our products and enjoy a seamless shopping experience.</p>
            <div class="features">
              <div class="feature">
                <span class="feature-icon">✨</span>
                <span>Easy Shopping</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🚚</span>
                <span>Fast Delivery</span>
              </div>
              <div class="feature">
                <span class="feature-icon">💳</span>
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .header {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 0 20px;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }

    h1 {
      color: #333;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .welcome-text {
      color: #666;
      font-weight: 500;
    }

    .logout-btn {
      padding: 8px 16px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s ease;
    }

    .logout-btn:hover {
      background: #c0392b;
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 20px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .info-card, .actions-card, .welcome-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .welcome-card {
      grid-column: 1 / -1;
    }

    h2 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
    }

    .info-item span {
      color: #333;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status.verified {
      background: #d4edda;
      color: #155724;
    }

    .status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .action-buttons {
      display: grid;
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      text-align: left;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .action-btn.secondary {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #e9ecef;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .icon {
      font-size: 18px;
    }

    .welcome-card p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .features {
      display: flex;
      gap: 24px;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .feature-icon {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }

      .features {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: UserInfoResponse | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe(authState => {
      this.user = authState.user;
    });
  }

  getDisplayName(): string {
    if (this.user?.customerProfile) {
      return this.user.customerProfile.firstName;
    }
    return this.user?.email || 'User';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  changePassword(): void {
    // TODO: Navigate to change password component
    alert('Change password functionality will be implemented');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Even if logout fails on server, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }
} 