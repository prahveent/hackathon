import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './components/products/product-list/product-list';
import { ProductDetailComponent } from './components/products/product-detail/product-detail';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AuthGuard, CustomerGuard, AdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard, CustomerGuard] 
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  // Product routes - accessible to all users
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'search', component: ProductListComponent },
  { path: 'categories/:categoryId', component: ProductListComponent },
  { path: 'brands/:brandId', component: ProductListComponent },
  // Cart and Checkout routes
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  // Wildcard route - should be last
  { path: '**', redirectTo: '/login' }
];
