export type User = {
  id: string;
  name: string;
  email: string;
  streak: number;
};

export type AuthResponse = {
  token: string;
  user: User;
  message?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export type LoginProps = {
  onLoginSuccess?: (user: User) => void;
  onNavigateToRegister?: () => void;
};

export type RegisterProps = {
  onRegisterSuccess?: (user: User) => void;
  onNavigateToLogin?: () => void;
};