
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedWorks: string[]; // Array of Work IDs
}

export interface Work {
  id: string;
  name: string;
  address: string;
  responsible?: string;
  assignedUsers: string[]; // Array of User IDs
}

export interface RemitoItem {
  id: string;
  name: string;
  quantity: number;
  photos: string[]; // base64 strings
  observations?: string;
}

export type RemitoStatus = 'pendiente' | 'en tránsito' | 'recibido';
export type RemitoOrigin = 'Fábrica' | 'Depósito';

export interface Remito {
  id: string;
  number: string;
  origin: RemitoOrigin;
  destinationId: string; // Work ID
  items: RemitoItem[];
  createdById: string; // User ID
  status: RemitoStatus;
  senderSignature?: string; // base64 PNG
  receiverSignature?: string; // base64 PNG
  createdAt: string; // ISO Date string
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export type Page = 'dashboard' | 'remito_new' | 'remito_edit' | 'remito_detail' | 'admin';

export interface View {
  page: Page;
  id?: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
