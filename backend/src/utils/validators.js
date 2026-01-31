import Joi from 'joi';

/**
 * Validation schemas for different modules
 */

// Auth validation schemas
export const authSchemas = {
  sendOTP: Joi.object({
    phone: Joi.string().regex(/^\+?[1-9]\d{1,14}$/).required(),
  }),

  verifyOTP: Joi.object({
    phone: Joi.string().regex(/^\+?[1-9]\d{1,14}$/).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    otp_id: Joi.string().uuid().required(),
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    full_name: Joi.string().max(100).required(),
    phone: Joi.string().regex(/^\+?[1-9]\d{1,14}$/),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  updatePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(50).required(),
  }),
};

// User validation schemas
export const userSchemas = {
  updateProfile: Joi.object({
    fullName: Joi.string().max(100),
    profilePictureUrl: Joi.string().uri(),
    phone: Joi.string().regex(/^\+?[1-9]\d{1,14}$/),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(50).required(),
  }),

  addAddress: Joi.object({
    address_line1: Joi.string().max(200).required(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    zipCode: Joi.string().required(),
    country: Joi.string().max(100).required(),
    type: Joi.string().valid('home', 'work', 'other').required(),
    isDefault: Joi.boolean(),
  }),

  updateAddress: Joi.object({
    address_line1: Joi.string().max(200),
    city: Joi.string().max(100),
    state: Joi.string().max(100),
    zipCode: Joi.string(),
    country: Joi.string().max(100),
    type: Joi.string().valid('home', 'work', 'other'),
    isDefault: Joi.boolean(),
  }),

  convertRole: Joi.object({
    newRole: Joi.string().valid('customer', 'merchant', 'mechanic', 'rental_host', 'cleaning_partner').required(),
  }),
};

// Parts validation schemas
export const partsSchemas = {
  createPart: Joi.object({
    name: Joi.string().max(200).required(),
    description: Joi.string().required(),
    vehicle_type: Joi.string().valid('bike', 'car', 'both').required(),
    category: Joi.string().required(),
    brand: Joi.string(),
    model: Joi.string(),
    price: Joi.number().positive().required(),
    stock_quantity: Joi.number().integer().min(0).required(),
    sku: Joi.string().max(50).required(),
    specifications: Joi.object(),
  }),

  updatePart: Joi.object({
    name: Joi.string().max(200),
    description: Joi.string(),
    vehicle_type: Joi.string().valid('bike', 'car', 'both'),
    category: Joi.string(),
    brand: Joi.string(),
    model: Joi.string(),
    price: Joi.number().positive(),
    stock_quantity: Joi.number().integer().min(0),
    specifications: Joi.object(),
  }),
};

// Cart validation schemas
export const cartSchemas = {
  addToCart: Joi.object({
    part_id: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).required(),
  }),

  updateCartItem: Joi.object({
    quantity: Joi.number().integer().min(1).required(),
  }),
};

// Mechanic validation schemas
export const mechanicSchemas = {
  createProfile: Joi.object({
    service_types: Joi.array().items(
      Joi.string().valid('basic_service', 'breakdown', 'repair', 'inspection')
    ),
    vehicle_expertise: Joi.array().items(Joi.string().valid('bike', 'car')),
    service_area_city: Joi.string().required(),
    service_radius_km: Joi.number().integer().min(1).required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    hourly_rate: Joi.number().positive(),
  }),

  createBooking: Joi.object({
    service_type: Joi.string()
      .valid('basic_service', 'breakdown', 'cleaning', 'decoration', 'repair')
      .required(),
    vehicle_type: Joi.string().valid('bike', 'car').required(),
    vehicle_details: Joi.object({
      brand: Joi.string().required(),
      model: Joi.string().required(),
      registration: Joi.string().required(),
    }).required(),
    service_location_lat: Joi.number().required(),
    service_location_lng: Joi.number().required(),
    service_location_address: Joi.string().required(),
    preferred_datetime: Joi.date().iso().required(),
    service_description: Joi.string().required(),
  }),
};

// Rental validation schemas
export const rentalSchemas = {
  createVehicle: Joi.object({
    vehicle_type: Joi.string().valid('bike', 'car').required(),
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year_of_manufacture: Joi.number().integer().min(1950).max(new Date().getFullYear()),
    registration_number: Joi.string().required(),
    seating_capacity: Joi.number().integer().min(1),
    fuel_type: Joi.string().required(),
    transmission: Joi.string(),
    price_per_day: Joi.number().positive().required(),
    current_location_lat: Joi.number().required(),
    current_location_lng: Joi.number().required(),
    current_location_city: Joi.string().required(),
  }),

  createBooking: Joi.object({
    vehicle_id: Joi.string().uuid().required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
    pickup_location: Joi.string().required(),
    dropoff_location: Joi.string(),
  }),
};

// RSA validation schemas
export const rsaSchemas = {
  subscribe: Joi.object({
    plan_name: Joi.string().required(),
  }),

  createRequest: Joi.object({
    emergency_type: Joi.string()
      .valid('towing', 'flat_tyre', 'battery_jumpstart', 'fuel_delivery')
      .required(),
    location_lat: Joi.number().required(),
    location_lng: Joi.number().required(),
    location_address: Joi.string().required(),
    vehicle_details: Joi.object({
      type: Joi.string().valid('bike', 'car').required(),
      brand: Joi.string().required(),
      model: Joi.string().required(),
      registration: Joi.string().required(),
    }).required(),
  }),
};

export const validate = (data, schema) => {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

export const validators = {
  // Auth validators
  sendOTP: authSchemas.sendOTP,
  verifyOTP: authSchemas.verifyOTP,
  register: authSchemas.register,
  login: authSchemas.login,
  verifyEmail: authSchemas.verifyEmail,
  resetPassword: authSchemas.resetPassword,
  updatePassword: authSchemas.updatePassword,

  // User validators
  updateProfile: userSchemas.updateProfile,
  changePassword: userSchemas.changePassword,
  addAddress: userSchemas.addAddress,
  updateAddress: userSchemas.updateAddress,
  convertRole: userSchemas.convertRole,

  // Parts validators
  createPart: partsSchemas.createPart,
  updatePart: partsSchemas.updatePart,

  // Cart validators
  addToCart: cartSchemas.addToCart,
  updateCartItem: cartSchemas.updateCartItem,

  // Mechanic validators
  createMechanicProfile: mechanicSchemas.createProfile,
  createBooking: mechanicSchemas.createBooking,

  // Rental validators
  createVehicle: rentalSchemas.createVehicle,
  createRentalBooking: rentalSchemas.createBooking,

  // RSA validators
  subscribe: rsaSchemas.subscribe,
  createRequest: rsaSchemas.createRequest,
};

export default {
  validate,
  validators,
  authSchemas,
  userSchemas,
  partsSchemas,
  cartSchemas,
  mechanicSchemas,
  rentalSchemas,
  rsaSchemas,
};
