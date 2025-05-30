import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserInfoResponse } from '../../models/auth.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-dashboard-container">
      <header class="header">
        <div class="header-content">
          <h1>🛡️ SmartCart Admin Dashboard</h1>
          <div class="user-menu">
            <span class="welcome-text">Welcome, {{ getDisplayName() }}!</span>
            <span class="role-badge admin">{{ getPermissionLevel() }}</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <div class="dashboard-grid">
          <div class="info-card">
            <h2>👤 Admin Profile</h2>
            <div class="profile-info" *ngIf="user">
              <div class="info-item">
                <label>Name:</label>
                <span>{{ user.adminProfile?.firstName }} {{ user.adminProfile?.lastName }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-item" *ngIf="user.adminProfile?.department">
                <label>Department:</label>
                <span>{{ user.adminProfile?.department }}</span>
              </div>
              <div class="info-item">
                <label>Permission Level:</label>
                <span class="permission-level">{{ user.adminProfile?.permissionsLevel }}</span>
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
            <h2>🔧 Admin Actions</h2>
            <div class="action-buttons">
              <button class="action-btn primary" *ngIf="isSuperAdmin()">
                <span class="icon">👥</span>
                User Management
              </button>
              <button class="action-btn secondary">
                <span class="icon">📦</span>
                Product Management
              </button>
              <button class="action-btn secondary">
                <span class="icon">📊</span>
                Order Management
              </button>
              <button class="action-btn secondary" *ngIf="isSuperAdmin()">
                <span class="icon">⚙️</span>
                System Settings
              </button>
              <button class="action-btn secondary">
                <span class="icon">📈</span>
                Analytics & Reports
              </button>
              <button class="action-btn warning" (click)="changePassword()">
                <span class="icon">🔐</span>
                Change Password
              </button>
            </div>
          </div>

          <div class="stats-card">
            <h2>📊 System Overview</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ mockStats.totalUsers }}</div>
                <div class="stat-label">Total Users</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ mockStats.totalOrders }}</div>
                <div class="stat-label">Total Orders</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ mockStats.totalProducts }}</div>
                <div class="stat-label">Products</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ mockStats.revenue }}</div>
                <div class="stat-label">Revenue</div>
              </div>
            </div>
          </div>

          <div class="role-info-card">
            <h2>🔒 Role Information</h2>
            <div class="role-details">
              <div class="role-item">
                <label>Your Roles:</label>
                <div class="roles-list">
                  <span class="role-badge admin" *ngFor="let role of user?.roles">{{ role }}</span>
                </div>
              </div>
              <div class="role-item">
                <label>Permissions:</label>
                <ul class="permissions-list">
                  <li *ngIf="isAdmin()">✅ Admin Dashboard Access</li>
                  <li *ngIf="isSuperAdmin()">✅ User Management</li>
                  <li *ngIf="isSuperAdmin()">✅ System Configuration</li>
                  <li *ngIf="isManager()">✅ Store Operations</li>
                  <li>✅ Product Management</li>
                  <li>✅ Order Processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      min-height: 100vh;
      background: #f1f3f4;
    }

    .header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
      font-weight: 500;
    }

    .role-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-badge.admin {
      background: rgba(255, 255, 255, 0.2);
      color: white;
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

    .info-card, .actions-card, .stats-card, .role-info-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

    .permission-level {
      background: #2196F3;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
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
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
    }

    .action-btn.secondary {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #e9ecef;
    }

    .action-btn.warning {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .icon {
      font-size: 18px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #1e3c72;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    .role-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .role-item label {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      display: block;
    }

    .roles-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .permissions-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .permissions-list li {
      padding: 4px 0;
      color: #28a745;
      font-size: 14px;
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

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  user: UserInfoResponse | null = null;
  mockStats = {
    totalUsers: 42,
    totalOrders: 156,
    totalProducts: 89,
    revenue: '$15,420'
  };

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
    if (this.user?.adminProfile) {
      return this.user.adminProfile.firstName;
    }
    return this.user?.email || 'Admin';
  }

  getPermissionLevel(): string {
    return this.user?.adminProfile?.permissionsLevel || 'Admin';
  }

  isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  isSuperAdmin(): boolean {
    return this.user?.adminProfile?.permissionsLevel === 'SuperAdmin';
  }

  isManager(): boolean {
    return this.user?.adminProfile?.permissionsLevel === 'Manager';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  changePassword(): void {
    alert('Change password functionality will be implemented');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
} 