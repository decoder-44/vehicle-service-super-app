-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'mechanic', 'merchant', 'host', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'submitted', 'approved', 'rejected');
CREATE TYPE document_type AS ENUM ('aadhar', 'pan', 'passport', 'driving_license');
CREATE TYPE kyc_doc_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE vehicle_type AS ENUM ('bike', 'car');
CREATE TYPE service_type AS ENUM ('basic_service', 'breakdown', 'repair', 'inspection', 'cleaning', 'decoration');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_type AS ENUM ('part_order', 'service_booking', 'rental_booking', 'rsa_subscription');
CREATE TYPE payment_status AS ENUM ('created', 'pending', 'success', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role user_role NOT NULL DEFAULT 'customer',
  full_name VARCHAR(100) NOT NULL,
  profile_image_url VARCHAR(500),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  kyc_verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- User addresses table
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);

-- OTP store table (temporary)
CREATE TABLE otp_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_store_phone ON otp_store(phone);
CREATE INDEX idx_otp_store_expires_at ON otp_store(expires_at);

-- KYC documents table
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_number VARCHAR(50) NOT NULL,
  document_front_url VARCHAR(500) NOT NULL,
  document_back_url VARCHAR(500),
  selfie_url VARCHAR(500) NOT NULL,
  verification_response JSONB,
  status kyc_doc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMP,
  admin_reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  admin_reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);

-- Vehicle parts table
CREATE TABLE vehicle_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  price DECIMAL(12, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(50) UNIQUE NOT NULL,
  images JSONB,
  specifications JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_parts_merchant_id ON vehicle_parts(merchant_id);
CREATE INDEX idx_vehicle_parts_category ON vehicle_parts(category);
CREATE INDEX idx_vehicle_parts_vehicle_type ON vehicle_parts(vehicle_type);
CREATE INDEX idx_vehicle_parts_is_active ON vehicle_parts(is_active);

-- Part orders table
CREATE TABLE part_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delivery_address_id UUID NOT NULL REFERENCES user_addresses(id) ON DELETE RESTRICT,
  subtotal DECIMAL(12, 2) NOT NULL,
  platform_commission DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) NOT NULL,
  delivery_charge DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_id UUID,
  order_status order_status NOT NULL DEFAULT 'pending',
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  delivered_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_part_orders_customer_id ON part_orders(customer_id);
CREATE INDEX idx_part_orders_merchant_id ON part_orders(merchant_id);
CREATE INDEX idx_part_orders_order_status ON part_orders(order_status);
CREATE INDEX idx_part_orders_created_at ON part_orders(created_at);

-- Part order items table
CREATE TABLE part_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES part_orders(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES vehicle_parts(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL
);

CREATE INDEX idx_part_order_items_order_id ON part_order_items(order_id);
CREATE INDEX idx_part_order_items_part_id ON part_order_items(part_id);

-- Mechanic profiles table
CREATE TABLE mechanic_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  service_types JSONB NOT NULL DEFAULT '[]',
  vehicle_expertise JSONB NOT NULL DEFAULT '[]',
  service_area_city VARCHAR(100) NOT NULL,
  service_radius_km INTEGER NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  hourly_rate DECIMAL(10, 2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mechanic_profiles_user_id ON mechanic_profiles(user_id);
CREATE INDEX idx_mechanic_profiles_is_available ON mechanic_profiles(is_available);

-- Service bookings table
CREATE TABLE service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  vehicle_type vehicle_type NOT NULL,
  vehicle_details JSONB NOT NULL,
  service_location_lat DECIMAL(10, 8) NOT NULL,
  service_location_lng DECIMAL(11, 8) NOT NULL,
  service_location_address TEXT NOT NULL,
  preferred_datetime TIMESTAMP NOT NULL,
  service_description TEXT NOT NULL,
  estimated_price DECIMAL(12, 2),
  final_price DECIMAL(12, 2),
  payment_id UUID,
  booking_status booking_status NOT NULL DEFAULT 'pending',
  mechanic_assigned_at TIMESTAMP,
  service_started_at TIMESTAMP,
  service_completed_at TIMESTAMP,
  cancellation_reason TEXT,
  customer_rating INTEGER,
  customer_review TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX idx_service_bookings_mechanic_id ON service_bookings(mechanic_id);
CREATE INDEX idx_service_bookings_booking_status ON service_bookings(booking_status);
CREATE INDEX idx_service_bookings_created_at ON service_bookings(created_at);

-- Rental vehicles table
CREATE TABLE rental_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type vehicle_type NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year_of_manufacture INTEGER,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_images JSONB,
  document_urls JSONB,
  seating_capacity INTEGER,
  fuel_type VARCHAR(50) NOT NULL,
  transmission VARCHAR(50),
  price_per_day DECIMAL(12, 2) NOT NULL,
  is_insurance_eligible BOOLEAN NOT NULL DEFAULT false,
  insurance_badge BOOLEAN NOT NULL DEFAULT false,
  current_location_lat DECIMAL(10, 8) NOT NULL,
  current_location_lng DECIMAL(11, 8) NOT NULL,
  current_location_city VARCHAR(100) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rental_vehicles_host_id ON rental_vehicles(host_id);
CREATE INDEX idx_rental_vehicles_is_available ON rental_vehicles(is_available);
CREATE INDEX idx_rental_vehicles_vehicle_type ON rental_vehicles(vehicle_type);

-- Rental bookings table
CREATE TABLE rental_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES rental_vehicles(id) ON DELETE RESTRICT,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  price_per_day DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  platform_commission DECIMAL(12, 2) NOT NULL,
  insurance_fee DECIMAL(12, 2),
  total_amount DECIMAL(12, 2) NOT NULL,
  payment_id UUID,
  booking_status booking_status NOT NULL DEFAULT 'pending',
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT,
  vehicle_picked_up_at TIMESTAMP,
  vehicle_returned_at TIMESTAMP,
  cancellation_reason TEXT,
  customer_rating INTEGER,
  customer_review TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rental_bookings_customer_id ON rental_bookings(customer_id);
CREATE INDEX idx_rental_bookings_vehicle_id ON rental_bookings(vehicle_id);
CREATE INDEX idx_rental_bookings_host_id ON rental_bookings(host_id);
CREATE INDEX idx_rental_bookings_booking_status ON rental_bookings(booking_status);

-- RSA subscriptions table
CREATE TABLE rsa_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  plan_price DECIMAL(12, 2) NOT NULL,
  benefits JSONB NOT NULL DEFAULT '[]',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_id UUID,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rsa_subscriptions_user_id ON rsa_subscriptions(user_id);
CREATE INDEX idx_rsa_subscriptions_is_active ON rsa_subscriptions(is_active);

-- RSA requests table
CREATE TABLE rsa_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES rsa_subscriptions(id) ON DELETE CASCADE,
  emergency_type VARCHAR(50) NOT NULL,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT NOT NULL,
  vehicle_details JSONB NOT NULL,
  service_partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  request_status booking_status NOT NULL DEFAULT 'pending',
  partner_assigned_at TIMESTAMP,
  service_started_at TIMESTAMP,
  service_completed_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rsa_requests_user_id ON rsa_requests(user_id);
CREATE INDEX idx_rsa_requests_request_status ON rsa_requests(request_status);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_type payment_type NOT NULL,
  reference_id UUID NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  razorpay_signature VARCHAR(255),
  payment_method VARCHAR(50),
  payment_status payment_status NOT NULL DEFAULT 'created',
  paid_at TIMESTAMP,
  refund_amount DECIMAL(12, 2),
  refunded_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_reference_id ON payments(reference_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);

-- Payouts table
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_type VARCHAR(50) NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  gross_amount DECIMAL(12, 2) NOT NULL,
  platform_commission DECIMAL(12, 2) NOT NULL,
  net_amount DECIMAL(12, 2) NOT NULL,
  payout_status payout_status NOT NULL DEFAULT 'pending',
  razorpay_payout_id VARCHAR(100) UNIQUE,
  bank_account_details JSONB,
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_recipient_id ON payouts(recipient_id);
CREATE INDEX idx_payouts_payout_status ON payouts(payout_status);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  message TEXT NOT NULL,
  data JSONB,
  status notification_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Admin actions table
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  target_entity VARCHAR(100) NOT NULL,
  target_id UUID NOT NULL,
  action_details JSONB,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at);
