import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { CustomerDashboardComponent } from './components/dashboard/customer-dashboard.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/admin/user-management.component';
import { AccessDeniedComponent } from './components/shared/access-denied.component';
import { ProductsPageComponent } from './pages/products.page';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';
import { CategoryPageComponent } from './pages/category.page';
import { BrandPageComponent } from './pages/brand.page';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/customer/dashboard', pathMatch: 'full' },
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
  { 
    path: 'products', 
    component: ProductsPageComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'products/:id', 
    component: ProductDetailComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'categories/:id', 
    component: CategoryPageComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'brands/:id', 
    component: BrandPageComponent,
    canActivate: [AuthGuard]
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '**', redirectTo: '/customer/dashboard' }
];
