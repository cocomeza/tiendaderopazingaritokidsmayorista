// =====================================================
// TIPOS TYPESCRIPT PARA ZINGARITO KIDS
// =====================================================

import { Database } from './database.types';

// =====================================================
// TIPOS DE BASE DE DATOS
// =====================================================

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  wholesale_price: number | null;
  stock: number;
  low_stock_threshold: number;
  category: string | null;
  subcategory: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  gender: 'niños' | 'niñas' | 'bebes' | 'unisex' | null;
  age_range: string | null;
  featured: boolean;
  active: boolean;
  images: string[] | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
export type PaymentStatus = 'pendiente' | 'pagado' | 'rechazado';

export type ShippingAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
  shipping_address: ShippingAddress | null;
  payment_proof_url: string | null;
  whatsapp_sent: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type BusinessConfig = {
  id: string;
  business_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  email: string;
  cbu: string | null;
  alias_cbu: string | null;
  bank_name: string | null;
  account_holder: string | null;
  address: string;
  min_wholesale_quantity: number;
  instagram_url: string | null;
  facebook_url: string | null;
  created_at: string;
  updated_at: string;
};

// =====================================================
// TIPOS EXTENDIDOS CON RELACIONES
// =====================================================

export type OrderWithItems = Order & {
  items: OrderItem[];
  user?: Profile;
};

export type OrderItemWithProduct = OrderItem & {
  product?: Product;
};

export type ProductWithFavorite = Product & {
  is_favorite?: boolean;
};

// =====================================================
// TIPOS PARA CARRITO (CLIENT SIDE)
// =====================================================

export type CartItem = {
  product_id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  item_count: number;
};

// =====================================================
// TIPOS PARA FILTROS
// =====================================================

export type ProductFilters = {
  category?: string | null;
  subcategory?: string | null;
  gender?: string | null;
  size?: string | null;
  color?: string | null;
  age_range?: string | null;
  min_price?: number | null;
  max_price?: number | null;
  search?: string | null;
  featured?: boolean | null;
};

export type ProductSortOption = 
  | 'newest' 
  | 'price_asc' 
  | 'price_desc' 
  | 'name_asc' 
  | 'name_desc';

// =====================================================
// TIPOS PARA FORMULARIOS
// =====================================================

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  acceptTerms: boolean;
};

export type LoginFormData = {
  email: string;
  password: string;
  remember: boolean;
};

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export type ProfileFormData = {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
};

export type CheckoutFormData = {
  shipping_address: ShippingAddress;
  notes?: string;
  payment_proof?: File;
};

// =====================================================
// TIPOS PARA ESTADÍSTICAS (ADMIN)
// =====================================================

export type DashboardStats = {
  total_sales_month: number;
  pending_orders: number;
  low_stock_products: number;
  total_customers: number;
};

export type SalesData = {
  date: string;
  total_orders: number;
  total_sales: number;
  avg_order_value: number;
};

export type TopProduct = {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
};

export type TopCustomer = {
  user_id: string;
  full_name: string;
  email: string;
  total_orders: number;
  total_spent: number;
};

// =====================================================
// TIPOS PARA RESPUESTAS API
// =====================================================

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

// =====================================================
// CONSTANTES DE CATEGORÍAS
// =====================================================

export const CATEGORIES = [
  'Bebés',
  'Niños',
  'Niñas',
  'Accesorios',
  'Calzado'
] as const;

export const GENDERS = [
  'bebes',
  'niños',
  'niñas',
  'unisex'
] as const;

export const AGE_RANGES = [
  '0-2',
  '3-5',
  '6-8',
  '9-12',
  '13-16'
] as const;

export const SIZES = [
  '0',
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16'
] as const;

export const PROVINCES_ARGENTINA = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
] as const;

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'confirmado', label: 'Confirmado', color: 'blue' },
  { value: 'preparando', label: 'Preparando', color: 'purple' },
  { value: 'enviado', label: 'Enviado', color: 'indigo' },
  { value: 'entregado', label: 'Entregado', color: 'green' },
  { value: 'cancelado', label: 'Cancelado', color: 'red' }
];

export const PAYMENT_STATUSES: { value: PaymentStatus; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'pagado', label: 'Pagado', color: 'green' },
  { value: 'rechazado', label: 'Rechazado', color: 'red' }
];

