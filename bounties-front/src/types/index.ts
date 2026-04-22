// Tipos globais do projeto Nido

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  value: number;
  currency: 'USD' | 'BRL' | 'EUR';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  category: string;
  tags: string[];
  createdBy: string; // User ID
  assignedTo?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  requirements: string;
  deliverables: string[];
  participants?: { id: string; name: string; avatar?: string }[];
  rules?: string[];
  evaluation_criteria?: string;
  official_links?: string[];
}

export interface Submission {
  id: string;
  bountyId: string;
  submittedBy: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  title: string;
  description: string;
  files?: string[]; // URLs dos arquivos
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
  feedback?: string;
  comments?: {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
  }[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para formulários
export interface CreateBountyForm {
  title: string;
  description: string;
  value: number;
  currency: 'USD' | 'BRL' | 'EUR';
  category: string;
  tags: string[];
  deadline?: Date;
  requirements: string[];
  deliverables: string[];
}

export interface UpdateBountyForm extends Partial<CreateBountyForm> {
  id: string;
  status?: Bounty['status'];
  assignedTo?: string;
}

// Tipos para filtros
export interface BountyFilters {
  status?: Bounty['status'][];
  category?: string[];
  minValue?: number;
  maxValue?: number;
  tags?: string[];
  createdBy?: string;
  assignedTo?: string;
}

// Tipos para componentes UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Tipos para navegação
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string | number;
  children?: NavItem[];
}

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tipos para OAuth
export interface OAuthProvider {
  name: 'twitter' | 'google' | 'discord' | 'github';
  displayName: string;
  icon: string;
  color: string;
}

export interface OAuthUser {
  id: string;
  email?: {
    address: string;
    verified: boolean;
  };
  twitter?: {
    username: string;
    profilePictureUrl: string;
    name: string;
  };
  google?: {
    email: string;
    name: string;
    picture: string;
  };
  discord?: {
    username: string;
    discriminator: string;
    avatar: string;
  };
  github?: {
    username: string;
    name: string;
    avatar: string;
  };
}

export interface OAuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (user: User) => void;
  title?: string;
  subtitle?: string;
  variant?: 'modal' | 'inline' | 'card';
  showBuiltInLogin?: boolean;
}
export interface WaitlistSubmission {
  email: string;
  xHandle: string;
  role: 'creator' | 'protocol';
}

export interface WaitlistResponse {
  success: boolean;
  message: string;
  id?: string;
}