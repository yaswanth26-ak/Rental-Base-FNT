export type UserRole = 'admin' | 'user';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type ImageType =
  | 'main'
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'parking'
  | 'other';

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface PropertySummary {
  id: number;
  name: string;
  city: string | null;
  state?: string | null;
  price_per_day: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  main_image: string | null;
  is_active?: boolean;
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  image_type: ImageType;
  display_order: number;
  created_at?: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
  created_at?: string;
}

export interface Property extends PropertySummary {
  owner_id: number;
  description: string | null;
  address: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  images?: PropertyImage[];
  amenities?: Amenity[];
}

export interface PropertyFilters {
  city?: string;
  min_price?: number | string;
  max_price?: number | string;
  guests?: number | string;
  bedrooms?: number | string;
}

export interface CreatePropertyPayload {
  name: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  price_per_day: number;
  max_guests?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export type UpdatePropertyPayload = CreatePropertyPayload;

export interface AddImagePayload {
  image_url: string;
  image_type?: ImageType;
  display_order?: number;
}

export interface Booking {
  id: number;
  property_id: number;
  customer_id: number;
  check_in: string;
  check_out: string;
  total_nights: number;
  total_amount: number;
  status: BookingStatus;
  created_at?: string;
  updated_at?: string;
  property_name?: string;
  property_city?: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface CreateBookingPayload {
  property_id: number;
  check_in: string;
  check_out: string;
}

export interface SuggestedAvailableDate {
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalAmount: number;
}

export interface AvailabilityResult {
  available: boolean;
  checkIn?: string;
  checkOut?: string;
  totalNights?: number;
  totalAmount?: number;
  suggestedDates?: SuggestedAvailableDate[];
}

export interface OwnerDashboard {
  total_properties: number;
  active_properties: number;
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
  email?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}
