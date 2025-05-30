import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { CustomerDashboardComponent } from './components/dashboard/customer-dashboard.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/admin/user-management.component';
import { AccessDeniedComponent } from './components/shared/access-denied.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'customer/dashboard', 
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/users', 
    component: UserManagementComponent,
    canActivate: [AdminGuard]
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '**', redirectTo: '/login' }
];
