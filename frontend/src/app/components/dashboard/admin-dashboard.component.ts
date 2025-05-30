import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>SmartCart - Administrator Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ currentUser?.firstName }} {{ currentUser?.lastName }}!</span>
          <button class="btn btn-outline" (click)="logout()">Logout</button>
        </div>
      </header>

      <main class="dashboard-content">
        <div class="welcome-section">
          <h2>Administrator Panel</h2>
          <p>Manage users, monitor system activity, and configure SmartCart settings.</p>
        </div>

        <div class="stats-overview">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <span class="stat-number">{{ totalUsers }}</span>
              <span class="stat-label">Total Users</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛒</div>
            <div class="stat-info">
              <span class="stat-number">{{ customerCount }}</span>
              <span class="stat-label">Customers</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-info">
              <span class="stat-number">{{ adminCount }}</span>
              <span class="stat-label">Administrators</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <span class="stat-number">{{ activeUsers }}</span>
              <span class="stat-label">Active Users</span>
            </div>
          </div>
        </div>

        <div class="management-section">
          <h3>Management Tools</h3>
          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">👥</div>
              <h4>User Management</h4>
              <p>Create, edit, and manage user accounts and permissions.</p>
              <button class="btn btn-primary" (click)="navigateToUserManagement()">Manage Users</button>
            </div>

            <div class="tool-card">
              <div class="tool-icon">🛍️</div>
              <h4>Product Management</h4>
              <p>Add, edit, and organize products in the catalog.</p>
              <button class="btn btn-primary" (click)="navigateToProductManagement()">Manage Products</button>
            </div>

            <div class="tool-card">
              <div class="tool-icon">📊</div>
              <h4>Analytics</h4>
              <p>View reports and analytics on user activity and sales.</p>
              <button class="btn btn-primary" (click)="navigateToAnalytics()">View Analytics</button>
            </div>

            <div class="tool-card">
              <div class="tool-icon">⚙️</div>
              <h4>System Settings</h4>
              <p>Configure system settings and application preferences.</p>
              <button class="btn btn-primary" (click)="navigateToSettings()">Settings</button>
            </div>
          </div>
        </div>

        <div class="recent-activity">
          <h3>Recent User Activity</h3>
          <div class="activity-list" *ngIf="recentUsers.length > 0; else noActivity">
            <div class="activity-item" *ngFor="let user of recentUsers">
              <div class="user-avatar">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</div>
              <div class="user-details">
                <strong>{{ user.firstName }} {{ user.lastName }}</strong>
                <span class="user-email">{{ user.email }}</span>
                <span class="user-role" [class.admin]="user.role === UserRole.Administrator">
                  {{ user.role === UserRole.Administrator ? 'Administrator' : 'Customer' }}
                </span>
              </div>
              <div class="user-status">
                <span class="status-badge" [class.active]="user.isActive" [class.inactive]="!user.isActive">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
                <span class="last-login" *ngIf="user.lastLoginAt">
                  Last login: {{ formatDate(user.lastLoginAt) }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noActivity>
            <p class="no-activity">No recent user activity to display.</p>
          </ng-template>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    .dashboard-header {
      background: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-header h1 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info span {
      color: #666;
      font-weight: 500;
    }

    .dashboard-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .welcome-section h2 {
      color: #333;
      margin-bottom: 1rem;
    }

    .welcome-section p {
      color: #666;
      font-size: 1.1rem;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2.5rem;
      background: #667eea;
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }

    .management-section {
      margin-bottom: 3rem;
    }

    .management-section h3 {
      color: #333;
      margin-bottom: 1.5rem;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .tool-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .tool-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0,0,0,0.15);
    }

    .tool-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .tool-card h4 {
      color: #333;
      margin-bottom: 1rem;
    }

    .tool-card p {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .recent-activity {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .recent-activity h3 {
      color: #333;
      margin-bottom: 1.5rem;
    }

    .activity-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .user-email {
      color: #666;
      font-size: 0.9rem;
    }

    .user-role {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      background: #e3f2fd;
      color: #1976d2;
      align-self: flex-start;
    }

    .user-role.admin {
      background: #fce4ec;
      color: #c2185b;
    }

    .user-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .status-badge {
      font-size: 0.8rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }

    .status-badge.active {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.inactive {
      background: #ffebee;
      color: #d32f2f;
    }

    .last-login {
      font-size: 0.8rem;
      color: #666;
    }

    .no-activity {
      text-align: center;
      color: #666;
      padding: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background-color: #5a6fd8;
    }

    .btn-outline {
      background-color: transparent;
      color: #667eea;
      border: 1px solid #667eea;
    }

    .btn-outline:hover {
      background-color: #667eea;
      color: white;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .dashboard-content {
        padding: 1rem;
      }

      .stats-overview {
        grid-template-columns: 1fr;
      }

      .tools-grid {
        grid-template-columns: 1fr;
      }

      .activity-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .user-status {
        align-items: flex-start;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentUsers: User[] = [];
  totalUsers = 0;
  customerCount = 0;
  adminCount = 0;
  activeUsers = 0;
  UserRole = UserRole; // Make enum available to template

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadDashboardData();
  }
  loadDashboardData(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.recentUsers = users.slice(0, 5); // Show last 5 users
        this.totalUsers = users.length;
        this.customerCount = users.filter((u: User) => u.role === UserRole.Customer).length;
        this.adminCount = users.filter((u: User) => u.role === UserRole.Administrator).length;
        this.activeUsers = users.filter((u: User) => u.isActive).length;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  navigateToUserManagement(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToProductManagement(): void {
    // TODO: Navigate to product management when implemented
    console.log('Navigate to product management');
  }

  navigateToAnalytics(): void {
    // TODO: Navigate to analytics when implemented
    console.log('Navigate to analytics');
  }

  navigateToSettings(): void {
    // TODO: Navigate to settings when implemented
    console.log('Navigate to settings');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
