import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="access-denied-container">
      <div class="access-denied-content">
        <div class="error-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div class="error-details">
          <p>This area is restricted to authorized users only. If you believe you should have access to this page, please contact your administrator.</p>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary" (click)="goToDashboard()">Go to Dashboard</button>
          <button class="btn btn-outline" (click)="logout()">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .access-denied-content {
      background: white;
      padding: 3rem;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .error-icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
      opacity: 0.8;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2.5rem;
      font-weight: 600;
    }

    p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .error-details {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid #e74c3c;
    }

    .error-details p {
      margin: 0;
      color: #555;
      font-size: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
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
      font-weight: 500;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background-color: #5a6fd8;
      transform: translateY(-2px);
    }

    .btn-outline {
      background-color: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background-color: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .access-denied-content {
        padding: 2rem;
      }

      h1 {
        font-size: 2rem;
      }

      .error-icon {
        font-size: 4rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class AccessDeniedComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  goToDashboard(): void {
    // Redirect based on user role
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        if (user.role === 1) { // Administrator
          this.router.navigate(['/admin/dashboard']);
        } else { // Customer
          this.router.navigate(['/customer/dashboard']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
