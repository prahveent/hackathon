import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User, UserRole, RegisterRequest, UpdateUserRequest } from '../../models/auth.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="user-management-container">
      <header class="page-header">
        <h1>User Management</h1>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openCreateUserModal()">Add New User</button>
          <button class="btn btn-outline" (click)="goBack()">Back to Dashboard</button>
        </div>
      </header>

      <div class="filters-section">
        <div class="filter-group">
          <label for="roleFilter">Filter by Role:</label>
          <select id="roleFilter" [(ngModel)]="selectedRole" (ngModelChange)="filterUsers()" class="form-control">
            <option value="">All Roles</option>
            <option value="0">Customer</option>
            <option value="1">Administrator</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="statusFilter">Filter by Status:</label>
          <select id="statusFilter" [(ngModel)]="selectedStatus" (ngModelChange)="filterUsers()" class="form-control">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div class="search-group">
          <label for="searchTerm">Search:</label>
          <input
            id="searchTerm"
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="filterUsers()"
            placeholder="Search by name or email..."
            class="form-control"
          />
        </div>
      </div>

      <div class="users-table-container">
        <table class="users-table" *ngIf="filteredUsers.length > 0; else noUsers">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of filteredUsers" [class.inactive]="!user.isActive">
              <td>
                <div class="user-info">
                  <div class="user-avatar">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</div>
                  <span>{{ user.firstName }} {{ user.lastName }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class.admin]="user.role === UserRole.Administrator">
                  {{ user.role === UserRole.Administrator ? 'Administrator' : 'Customer' }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.active]="user.isActive" [class.inactive]="!user.isActive">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="editUser(user)">Edit</button>
                  <button 
                    class="btn btn-sm"
                    [class.btn-warning]="user.isActive"
                    [class.btn-success]="!user.isActive"
                    (click)="toggleUserStatus(user)"
                  >
                    {{ user.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteUser(user)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <ng-template #noUsers>
          <div class="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        </ng-template>
      </div>

      <!-- Create/Edit User Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit User' : 'Create New User' }}</h3>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>
          <form [formGroup]="userForm" (ngSubmit)="saveUser()">
            <div class="modal-body">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="form-control"
                  [class.error]="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched"
                />
                <div class="error-message" *ngIf="userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched">
                  First name is required
                </div>
              </div>

              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="form-control"
                  [class.error]="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched"
                />
                <div class="error-message" *ngIf="userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched">
                  Last name is required
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="form-control"
                  [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                />
                <div class="error-message" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                  <span *ngIf="userForm.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="userForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                </div>
              </div>

              <div class="form-group" *ngIf="!isEditMode">
                <label for="password">Password</label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="form-control"
                  [class.error]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                />
                <div class="error-message" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched">
                  Password is required and must be at least 6 characters
                </div>
              </div>

              <div class="form-group">
                <label for="role">Role</label>
                <select id="role" formControlName="role" class="form-control">
                  <option value="0">Customer</option>
                  <option value="1">Administrator</option>
                </select>
              </div>

              <div class="form-group" *ngIf="isEditMode">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="isActive" />
                  Active User
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || isLoading">
                {{ isLoading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-management-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #eee;
    }

    .page-header h1 {
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-group,
    .search-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label,
    .search-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .users-table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th,
    .users-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .users-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .users-table tr.inactive {
      opacity: 0.7;
      background: #f9f9f9;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8rem;
    }

    .role-badge,
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .role-badge {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.admin {
      background: #fce4ec;
      color: #c2185b;
    }

    .status-badge.active {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-badge.inactive {
      background: #ffebee;
      color: #d32f2f;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .no-users {
      padding: 3rem;
      text-align: center;
      color: #666;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .checkbox-label {
      display: flex !important;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
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

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background-color: #e0a800;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover {
      background-color: #218838;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .filters-section {
        grid-template-columns: 1fr;
      }

      .users-table-container {
        overflow-x: auto;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  showModal = false;
  isEditMode = false;
  isLoading = false;
  selectedUser: User | null = null;
  userForm: FormGroup;
  UserRole = UserRole;

  // Filter properties
  selectedRole = '';
  selectedStatus = '';
  searchTerm = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.Customer, [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.filteredUsers = users;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
      }
    });
  }

  filterUsers(): void {
    let filtered = [...this.users];

    if (this.selectedRole !== '') {
      filtered = filtered.filter(user => user.role.toString() === this.selectedRole);
    }

    if (this.selectedStatus !== '') {
      filtered = filtered.filter(user => user.isActive.toString() === this.selectedStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    this.filteredUsers = filtered;
  }

  openCreateUserModal(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.Customer,
      isActive: true
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.showModal = true;
  }

  editUser(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.isLoading = true;

      if (this.isEditMode && this.selectedUser) {
        const updateRequest: UpdateUserRequest = {
          firstName: this.userForm.value.firstName,
          lastName: this.userForm.value.lastName,
          email: this.userForm.value.email,
          role: this.userForm.value.role,
          isActive: this.userForm.value.isActive
        };

        this.userService.updateUser(this.selectedUser.id, updateRequest).subscribe({
          next: () => {
            this.isLoading = false;
            this.closeModal();
            this.loadUsers();
          },
          error: (error: any) => {
            this.isLoading = false;
            console.error('Error updating user:', error);
          }
        });
      } else {
        const createRequest: RegisterRequest = {
          firstName: this.userForm.value.firstName,
          lastName: this.userForm.value.lastName,
          email: this.userForm.value.email,
          password: this.userForm.value.password,
          role: this.userForm.value.role
        };

        this.userService.createUser(createRequest).subscribe({
          next: () => {
            this.isLoading = false;
            this.closeModal();
            this.loadUsers();
          },
          error: (error: any) => {
            this.isLoading = false;
            console.error('Error creating user:', error);
          }
        });
      }
    }
  }

  toggleUserStatus(user: User): void {
    if (user.isActive) {
      this.userService.deactivateUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error: any) => {
          console.error('Error deactivating user:', error);
        }
      });
    } else {
      this.userService.activateUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error: any) => {
          console.error('Error activating user:', error);
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
