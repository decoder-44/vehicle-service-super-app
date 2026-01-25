# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Response Format

All endpoints return responses in this format:

### Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success message",
  "data": { }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Authentication

For protected endpoints, include JWT token in header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Auth Module (`/api/auth`)

#### 1. Send OTP
Send a 6-digit OTP to user's phone number

**Endpoint:** `POST /send-otp`

**Rate Limited:** 3 requests per hour per IP

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otpId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "OTP sent successfully"
  }
}
```

**Error Responses:**
- `400` - Invalid phone format
- `429` - Too many requests

---

#### 2. Verify OTP & Login
Verify OTP and get JWT token. Creates user if doesn't exist.

**Endpoint:** `POST /verify-otp`

**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456",
  "otp_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "phone": "+919876543210",
      "email": null,
      "full_name": "",
      "role": "customer",
      "kyc_status": "pending",
      "is_verified": true,
      "created_at": "2026-01-25T10:00:00Z",
      "updated_at": "2026-01-25T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid OTP
- `400` - OTP expired
- `400` - Invalid OTP ID

---

#### 3. Register with Email
Register new user with email and password

**Endpoint:** `POST /register`

**Rate Limited:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+919876543210"
}
```

**Password Requirements:**
- Minimum 8 characters
- Maximum 50 characters

**Response (201):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "email": "user@example.com",
      "phone": "+919876543210",
      "full_name": "John Doe",
      "role": "customer",
      "kyc_status": "pending",
      "is_verified": false,
      "created_at": "2026-01-25T10:00:00Z",
      "updated_at": "2026-01-25T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `400` - Validation failed (invalid email, weak password, etc.)
- `409` - Email already registered

---

#### 4. Login with Email
Login with email and password

**Endpoint:** `POST /login`

**Rate Limited:** 5 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "email": "user@example.com",
      "phone": "+919876543210",
      "full_name": "John Doe",
      "role": "customer",
      "kyc_status": "pending",
      "is_verified": false,
      "created_at": "2026-01-25T10:00:00Z",
      "updated_at": "2026-01-25T10:00:00Z"
    }
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid email or password

---

#### 5. Verify Email
Verify email address with token (sent via email)

**Endpoint:** `POST /verify-email`

**Request Body:**
```json
{
  "token": "email_verification_token_from_email"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Error Responses:**
- `400` - Invalid or expired token

---

#### 6. Get Current User
Get details of currently authenticated user

**Endpoint:** `GET /me`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "email": "user@example.com",
    "phone": "+919876543210",
    "full_name": "John Doe",
    "role": "customer",
    "kyc_status": "pending",
    "is_verified": false,
    "profile_image_url": null,
    "created_at": "2026-01-25T10:00:00Z",
    "updated_at": "2026-01-25T10:00:00Z"
  }
}
```

**Error Responses:**
- `401` - No token provided
- `401` - Invalid or expired token
- `404` - User not found

---

### Health Check

#### Server Health Status
Check if server is running

**Endpoint:** `GET /health`

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2026-01-25T10:00:00Z"
}
```

---

## User Roles

Users can have the following roles:
- `customer` - Regular user who buys parts, books services, rents vehicles
- `mechanic` - Service provider
- `merchant` - Parts seller
- `host` - Vehicle rental provider
- `admin` - Platform administrator

## KYC Status

- `pending` - KYC not submitted
- `submitted` - KYC documents submitted, awaiting review
- `approved` - KYC verified, can perform seller/provider actions
- `rejected` - KYC rejected, reason provided

## Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 5 requests per 15 minutes per IP
- **OTP Endpoint**: 3 requests per hour per IP
- **Payment Endpoint**: 10 requests per minute per IP

Rate limit info is returned in response headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1234567890
```

## JWT Token

JWT tokens are valid for 30 days by default.

**Token Payload:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440002",
  "email": "user@example.com",
  "phone": "+919876543210",
  "role": "customer",
  "kyc_status": "pending",
  "iat": 1674657600,
  "exp": 1677249600
}
```

## Upcoming Endpoints

The following modules are planned for implementation:

- **Users Module** - Profile management, addresses
- **KYC Module** - Document verification
- **Parts Module** - Listing, search, cart, orders
- **Mechanic Module** - Profiles, bookings, services
- **Rental Module** - Vehicle listing, bookings
- **RSA Module** - Subscriptions, emergency requests
- **Payment Module** - Order processing, payouts
- **Admin Module** - User management, analytics

## Testing with Postman

1. Import this collection into Postman
2. Set environment variables:
   - `base_url` = `http://localhost:5000`
   - `token` = Token from login response
3. Test each endpoint

## Error Handling

All errors follow the standard error response format with helpful messages:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "data": {
    "errors": [
      "phone is required",
      "phone must be a valid phone number"
    ]
  }
}
```

## Notes

- All timestamps are in UTC/ISO 8601 format
- Phone numbers should include country code (e.g., +91 for India)
- Passwords are hashed with bcrypt and never returned
- Email addresses are case-insensitive
- All IDs are UUIDs

## Support

For API questions or issues, please refer to the main [README.md](README.md).
