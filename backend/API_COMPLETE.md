# Vehicle Super App - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📱 Authentication Module

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone": "+919876543210"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "otp_id": "uuid",
  "otp": "123456",
  "phone": "+919876543210"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 👤 User Management Module

### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "profilePictureUrl": "https://..."
}
```

### Change Password
```http
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### Add Address
```http
POST /api/users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "is_default": true
}
```

### Get Addresses
```http
GET /api/users/addresses
Authorization: Bearer <token>
```

### Update Address
```http
PUT /api/users/addresses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "address_line1": "Updated address",
  "is_default": true
}
```

### Delete Address
```http
DELETE /api/users/addresses/:id
Authorization: Bearer <token>
```

---

## 📄 KYC Module

### Submit KYC Documents
```http
POST /api/kyc/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentType": "aadhar",
  "documentNumber": "1234-5678-9012",
  "documentFrontUrl": "https://...",
  "documentBackUrl": "https://...",
  "selfieUrl": "https://..."
}
```

### Get My KYC Documents
```http
GET /api/kyc/my-documents
Authorization: Bearer <token>
```

### Get KYC Document by ID
```http
GET /api/kyc/:id
Authorization: Bearer <token>
```

### Admin: Get Pending KYC
```http
GET /api/kyc/admin/pending?page=1&limit=20
Authorization: Bearer <admin_token>
```

### Admin: Verify KYC
```http
PUT /api/kyc/admin/verify/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "verified",
  "rejectionReason": "Optional, only if rejected"
}
```

### Admin: KYC Statistics
```http
GET /api/kyc/admin/statistics
Authorization: Bearer <admin_token>
```

---

## 🛒 Parts Marketplace Module

### Create Part Listing
```http
POST /api/parts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Engine Oil 5W-30",
  "description": "High quality synthetic oil",
  "vehicleType": "car",
  "category": "Engine",
  "brand": "Castrol",
  "model": "EDGE",
  "price": 599,
  "stockQuantity": 50,
  "sku": "EO-5W30-001",
  "images": ["url1", "url2"],
  "specifications": {
    "viscosity": "5W-30",
    "volume": "1L"
  }
}
```

### Get All Parts
```http
GET /api/parts?vehicleType=car&category=Engine&page=1&limit=20
```

### Get Part by ID
```http
GET /api/parts/:id
```

### Update Part Listing
```http
PUT /api/parts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 649,
  "stockQuantity": 45
}
```

### Delete Part Listing
```http
DELETE /api/parts/:id
Authorization: Bearer <token>
```

### Create Part Order
```http
POST /api/parts/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "partId": "uuid",
      "quantity": 2
    }
  ],
  "deliveryAddressId": "uuid"
}
```

### Get My Orders
```http
GET /api/parts/orders?page=1&limit=20
Authorization: Bearer <token>
```

### Get Order by ID
```http
GET /api/parts/orders/:id
Authorization: Bearer <token>
```

### Update Order Status (Merchant)
```http
PUT /api/parts/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK123",
  "estimatedDelivery": "2024-02-15"
}
```

---

## 🔧 Mechanic Services Module

### Create Mechanic Profile
```http
POST /api/mechanic/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceTypes": ["basic_service", "repair", "breakdown"],
  "vehicleExpertise": ["car", "bike"],
  "serviceAreaCity": "Mumbai",
  "serviceRadiusKm": 10,
  "latitude": 19.0760,
  "longitude": 72.8777,
  "hourlyRate": 500
}
```

### Get Mechanic Profile
```http
GET /api/mechanic/profile
Authorization: Bearer <token>
```

### Update Mechanic Profile
```http
PUT /api/mechanic/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "hourlyRate": 600,
  "isAvailable": true
}
```

### Find Nearby Mechanics
```http
GET /api/mechanic/nearby?latitude=19.0760&longitude=72.8777&radius=10
```

### Create Service Booking
```http
POST /api/mechanic/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceType": "basic_service",
  "vehicleType": "car",
  "vehicleDetails": {
    "brand": "Maruti",
    "model": "Swift",
    "year": 2020
  },
  "serviceLocationLat": 19.0760,
  "serviceLocationLng": 72.8777,
  "serviceLocationAddress": "123 Main St, Mumbai",
  "preferredDatetime": "2024-02-01T10:00:00Z",
  "serviceDescription": "Regular service needed"
}
```

### Get My Bookings
```http
GET /api/mechanic/bookings?page=1&limit=20
Authorization: Bearer <token>
```

### Get Booking by ID
```http
GET /api/mechanic/bookings/:id
Authorization: Bearer <token>
```

### Assign Mechanic to Booking
```http
POST /api/mechanic/bookings/:id/assign
Authorization: Bearer <mechanic_token>
```

### Update Booking Status
```http
PUT /api/mechanic/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "finalPrice": 1500
}
```

### Add Review
```http
POST /api/mechanic/bookings/:id/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent service!"
}
```

---

## 🚗 Vehicle Rental Module

### Create Rental Vehicle
```http
POST /api/rental/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleType": "car",
  "brand": "Honda",
  "model": "City",
  "yearOfManufacture": 2022,
  "registrationNumber": "MH01AB1234",
  "vehicleImages": ["url1", "url2"],
  "documentUrls": ["rc_url", "insurance_url"],
  "seatingCapacity": 5,
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "pricePerDay": 1500,
  "isInsuranceEligible": true,
  "currentLocationLat": 19.0760,
  "currentLocationLng": 72.8777,
  "currentLocationCity": "Mumbai"
}
```

### Get All Rental Vehicles
```http
GET /api/rental/vehicles?vehicleType=car&city=Mumbai&page=1&limit=20
```

### Get Vehicle by ID
```http
GET /api/rental/vehicles/:id
```

### Update Rental Vehicle
```http
PUT /api/rental/vehicles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "pricePerDay": 1600,
  "isAvailable": true
}
```

### Create Rental Booking
```http
POST /api/rental/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "uuid",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "pickupLocation": "Mumbai Airport",
  "insuranceRequired": true
}
```

### Get My Rental Bookings
```http
GET /api/rental/bookings?page=1&limit=20
Authorization: Bearer <token>
```

### Get Rental Booking by ID
```http
GET /api/rental/bookings/:id
Authorization: Bearer <token>
```

### Update Rental Booking Status
```http
PUT /api/rental/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "dropoffLocation": "Mumbai Airport"
}
```

---

## 🆘 RSA (Roadside Assistance) Module

### Subscribe to RSA
```http
POST /api/rsa/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "planName": "Gold Plan",
  "planPrice": 2999,
  "benefits": ["24/7 support", "Towing", "Fuel delivery"],
  "durationMonths": 12
}
```

### Get My Subscriptions
```http
GET /api/rsa/subscriptions
Authorization: Bearer <token>
```

### Get Active Subscription
```http
GET /api/rsa/subscriptions/active
Authorization: Bearer <token>
```

### Create RSA Request
```http
POST /api/rsa/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "emergencyType": "breakdown",
  "locationLat": 19.0760,
  "locationLng": 72.8777,
  "locationAddress": "Highway 1, near toll plaza",
  "vehicleDetails": {
    "brand": "Maruti",
    "model": "Swift",
    "registrationNumber": "MH01AB1234"
  }
}
```

### Get My RSA Requests
```http
GET /api/rsa/requests?page=1&limit=20
Authorization: Bearer <token>
```

### Get RSA Request by ID
```http
GET /api/rsa/requests/:id
Authorization: Bearer <token>
```

### Update RSA Request Status
```http
PUT /api/rsa/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "resolutionNotes": "Vehicle towed to service center"
}
```

---

## 🧼 Cleaning & Decoration Module

### Create Cleaning Booking
```http
POST /api/cleaning/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceType": "cleaning",
  "vehicleType": "car",
  "vehicleDetails": {
    "brand": "Honda",
    "model": "City",
    "packageType": "premium"
  },
  "serviceLocationLat": 19.0760,
  "serviceLocationLng": 72.8777,
  "serviceLocationAddress": "123 Main St",
  "preferredDatetime": "2024-02-01T10:00:00Z",
  "serviceDescription": "Full interior and exterior cleaning"
}
```

### Get My Cleaning Bookings
```http
GET /api/cleaning/bookings?page=1&limit=20
Authorization: Bearer <token>
```

### Get Cleaning Booking by ID
```http
GET /api/cleaning/bookings/:id
Authorization: Bearer <token>
```

### Update Cleaning Booking Status
```http
PUT /api/cleaning/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "finalPrice": 800
}
```

---

## 💳 Payment Module

### Create Payment Order
```http
POST /api/payment/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentType": "part_order",
  "referenceId": "order_uuid",
  "amount": 1500
}
```

### Verify Payment
```http
POST /api/payment/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "signature_xxx"
}
```

### Get My Payments
```http
GET /api/payment/my-payments?page=1&limit=20
Authorization: Bearer <token>
```

### Get Payment by ID
```http
GET /api/payment/:id
Authorization: Bearer <token>
```

### Initiate Refund
```http
POST /api/payment/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "uuid",
  "amount": 1500,
  "reason": "Order cancelled"
}
```

---

## 📍 Location Services Module

### Geocode Address
```http
GET /api/location/geocode?address=Marine Drive, Mumbai
```

### Reverse Geocode
```http
GET /api/location/reverse-geocode?latitude=19.0760&longitude=72.8777
```

### Calculate Distance
```http
GET /api/location/calculate-distance?lat1=19.0760&lon1=72.8777&lat2=19.0896&lon2=72.8656
```

### Find Nearby Places
```http
GET /api/location/nearby?latitude=19.0760&longitude=72.8777&type=gas_station&radius=5000
```

---

## 🔔 Notification Module

### Get My Notifications
```http
GET /api/notification/my-notifications?page=1&limit=20
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /api/notification/:id/read
Authorization: Bearer <token>
```

### Send Notification (Admin)
```http
POST /api/notification/send
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "uuid",
  "type": "booking_confirmed",
  "channel": "email",
  "title": "Booking Confirmed",
  "message": "Your booking has been confirmed"
}
```

### Send Bulk Notifications (Admin)
```http
POST /api/notification/send-bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": ["uuid1", "uuid2"],
  "type": "promotional",
  "channel": "email",
  "title": "Special Offer",
  "message": "Get 20% off on all services"
}
```

---

## 👨‍💼 Admin Module

### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

### Get All Users
```http
GET /api/admin/users?role=mechanic&kycStatus=approved&page=1&limit=50
Authorization: Bearer <admin_token>
```

### Get User Details
```http
GET /api/admin/users/:userId
Authorization: Bearer <admin_token>
```

### Update User Status
```http
PUT /api/admin/users/:userId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

### Get All Bookings
```http
GET /api/admin/bookings?type=service&page=1&limit=50
Authorization: Bearer <admin_token>
```

### Get All Payments
```http
GET /api/admin/payments?page=1&limit=50
Authorization: Bearer <admin_token>
```

### Get Revenue Analytics
```http
GET /api/admin/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin_token>
```

### Get Admin Actions
```http
GET /api/admin/actions?page=1&limit=50
Authorization: Bearer <admin_token>
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

---

**For more details, see QUICKSTART.md and README.md**
