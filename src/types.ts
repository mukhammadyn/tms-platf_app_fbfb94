// ─── Enums & Union Types ───────────────────────────────────────────────────

export type UserRole = 'admin' | 'shipper' | 'carrier' | 'driver' | 'freelancer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type OrderType = 'classic' | 'tender' | 'private';
export type OrderStatus =
  | 'open'
  | 'bidding'
  | 'assigned'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type VehicleType =
  | 'flatbed'
  | 'dry_van'
  | 'reefer'
  | 'tanker'
  | 'container'
  | 'lowboy'
  | 'step_deck'
  | 'box_truck'
  | 'other';
export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'inactive';

export type TrackingEventType =
  | 'pickup'
  | 'in_transit'
  | 'stop'
  | 'delivery'
  | 'delay'
  | 'exception'
  | 'delivered';

export type TransactionType = 'payment' | 'invoice' | 'refund' | 'commission' | 'payout';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'overdue';
export type PaymentMethod = 'bank_transfer' | 'card' | 'crypto' | 'cash' | 'check';

export type MessageType = 'order_update' | 'bid_notification' | 'system' | 'alert' | 'finance';

export type ReviewCategory = 'timeliness' | 'communication' | 'cargo_handling' | 'professionalism' | 'overall';

export type LicenseClass = 'A' | 'B' | 'C' | 'CDL-A' | 'CDL-B' | 'CDL-C';
export type DriverStatus = 'available' | 'on_trip' | 'off_duty' | 'inactive';

export type CarrierStatus = 'verified' | 'pending_review' | 'suspended' | 'inactive';

export type NotificationType = 'bid' | 'delivery' | 'finance' | 'alert' | 'order' | 'system';

// ─── Entity Interfaces ─────────────────────────────────────────────────────

export interface User {
  guid: string;
  login?: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar?: string;
  company_name?: string;
  is_freelancer?: boolean;
  status?: UserStatus;
  rating?: number;
  address?: string;
  tin?: string;
  documents?: string;
  telegram_chat_id?: string;
  role_id?: string;
  client_type_id?: string;
  created_at?: string;
}

export interface Order {
  guid: string;
  order_number?: string;
  order_type?: OrderType;
  status?: OrderStatus;
  cargo_description?: string;
  cargo_weight_kg?: number;
  cargo_volume_m3?: number;
  pickup_address?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  pickup_date?: string;
  delivery_date?: string;
  price?: number;
  distance_km?: number;
  special_requirements?: string;
  documents?: string;
  users_id?: string;
  vehicles_id?: string;
  created_at?: string;
}

export interface Bid {
  guid: string;
  bid_amount?: number;
  status?: BidStatus;
  proposed_pickup_date?: string;
  proposed_delivery_date?: string;
  notes?: string;
  estimated_transit_hours?: number;
  orders_id?: string;
  users_id?: string;
  created_at?: string;
}

export interface Vehicle {
  guid: string;
  plate_number?: string;
  vehicle_type?: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  max_payload_kg?: number;
  max_volume_m3?: number;
  status?: VehicleStatus;
  current_lat?: number;
  current_lng?: number;
  insurance_expiry?: string;
  inspection_expiry?: string;
  photo?: string;
  users_id?: string;
  created_at?: string;
}

export interface TrackingUpdate {
  guid: string;
  event_type?: TrackingEventType;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  notes?: string;
  timestamp?: string;
  photo_proof?: string;
  orders_id?: string;
  vehicles_id?: string;
  created_at?: string;
}

export interface Transaction {
  guid: string;
  transaction_number?: string;
  type?: TransactionType;
  amount?: number;
  status?: TransactionStatus;
  payment_method?: PaymentMethod;
  due_date?: string;
  paid_date?: string;
  invoice_file?: string;
  notes?: string;
  orders_id?: string;
  users_id?: string;
  created_at?: string;
}

export interface Message {
  guid: string;
  subject?: string;
  body?: string;
  is_read?: boolean;
  message_type?: MessageType;
  attachment?: string;
  users_id?: string;
  orders_id?: string;
  created_at?: string;
}

export interface Review {
  guid: string;
  rating?: number;
  comment?: string;
  category?: ReviewCategory;
  is_public?: boolean;
  orders_id?: string;
  users_id?: string;
  created_at?: string;
}

export interface DriverProfile {
  guid: string;
  license_number?: string;
  license_class?: LicenseClass;
  license_expiry?: string;
  experience_years?: number;
  status?: DriverStatus;
  medical_cert_expiry?: string;
  hazmat_certified?: boolean;
  photo?: string;
  users_id?: string;
  created_at?: string;
}

export interface CarrierProfile {
  guid: string;
  mc_number?: string;
  dot_number?: string;
  fleet_size?: number;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  operating_regions?: string;
  status?: CarrierStatus;
  authority_docs?: string;
  users_id?: string;
  created_at?: string;
}

export interface Notification {
  guid: string;
  title?: string;
  body?: string;
  type?: NotificationType;
  is_read?: boolean;
  action_url?: string;
  users_id?: string;
  created_at?: string;
}

// ─── Utility Types ─────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface FormState<T = unknown> {
  data: T;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface KpiCard {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  color?: string;
  type?: 'order' | 'vehicle' | 'pickup' | 'delivery';
}

export interface FilterParams {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  userId?: string;
  orderId?: string;
  amountMin?: number;
  amountMax?: number;
  region?: string;
}

export interface DateRange {
  from?: string;
  to?: string;
}
