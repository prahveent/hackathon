// User Registration Models
export interface RegisterCustomerRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface RegisterAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  permissionsLevel: string;
}

// Login Models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserInfoResponse;
}

// User Info Models
export interface UserInfoResponse {
  id: number;
  email: string;
  emailVerified: boolean;
  lastLogin?: string;
  roles: string[];
  customerProfile?: CustomerProfileResponse;
  adminProfile?: AdminProfileResponse;
}

export interface CustomerProfileResponse {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface AdminProfileResponse {
  firstName: string;
  lastName: string;
  department?: string;
  permissionsLevel: string;
}

// Password Management Models
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// API Response Models
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Authentication State
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfoResponse | null;
  token: string | null;
  loading: boolean;
} 