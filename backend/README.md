# Vehicle Super App - India Marketplace Platform

A comprehensive multi-sided marketplace platform connecting vehicle owners, mechanics, merchants, renters, and service providers across India.

## Features

- **Authentication**: Phone OTP & Email+Password login/registration with JWT
- **Government KYC Verification**: Mandatory for sellers/providers (Aadhar, PAN, Passport)
- **Vehicle Parts Marketplace**: Buy/sell parts with orders and payments
- **On-Demand Mechanic Services**: Book mechanics with location-based matching
- **Vehicle Rental System**: Host vehicles with insurance eligibility tracking
- **Cleaning & Decoration Services**: Specialized service bookings
- **Roadside Assistance (RSA)**: Subscription-based emergency services
- **Payment Processing**: Razorpay integration for UPI, cards, netbanking
- **Real-time Updates**: Socket.io for live tracking and notifications
- **Admin Control Panel**: User management, KYC approvals, analytics

## Tech Stack

- **Backend**: Node.js + Express.js (JavaScript)
- **Database**: PostgreSQL (raw SQL)
- **Authentication**: JWT tokens
- **Payment Gateway**: Razorpay
- **Real-time**: Socket.io
- **Storage**: AWS S3 or Cloudinary
- **Notifications**: Twilio SMS, Nodemailer Email

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd vehicle-service-super-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - Database credentials
   - JWT secret
   - Razorpay credentials
   - Google Maps API key
   - KYC provider credentials
   - SMS/Email provider credentials

4. **Create PostgreSQL database**
   ```bash
   createdb vehicle_super_app
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Start the server**
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production mode
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user (requires auth)

### Health Check
- `GET /health` - Server health status

## Project Structure

```
src/
├── config/              # Configuration files
├── modules/             # Feature modules (auth, users, parts, etc.)
├── database/            # Database connection and migrations
├── middleware/          # Express middleware
├── utils/               # Utility functions
├── socket/              # Socket.io setup
└── app.js               # Express app setup

tests/                   # Test files
.env.example             # Environment template
package.json             # Dependencies
server.js                # Entry point
```

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Add environment variables** to `.env` if needed

3. **Update database schema** in `src/database/migrations/` if needed

4. **Implement module** following the structure:
   - `routes.js` - API endpoints
   - `controller.js` - Request handlers
   - `service.js` - Business logic
   - `middleware.js` - Module-specific middleware (if needed)

5. **Add validation schemas** to `src/utils/validators.js`

6. **Test API** using Postman/Thunder Client

7. **Commit with meaningful messages**
   ```bash
   git commit -m "feat: Add part listing API"
   ```

## Database Migrations

- Create new migration file in `src/database/migrations/`
- File naming: `NNN_description.sql` (e.g., `002_create_parts_table.sql`)
- Run migrations: `npm run migrate`

## Environment Variables Guide

| Variable | Purpose | Example |
|----------|---------|---------|
| NODE_ENV | Environment | development, production |
| PORT | Server port | 5000 |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | vehicle_super_app |
| JWT_SECRET | JWT signing key | your_secret_key |
| RAZORPAY_KEY_ID | Razorpay test/live key | rzp_test_xxxxx |
| GOOGLE_MAPS_API_KEY | Maps API key | xxxxx |

## Testing

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage report
```

## API Documentation

### Response Format

All responses follow a standard format:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Success message",
  "data": { }
}
```

### Error Handling

Errors follow the same format with appropriate status codes:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error message",
  "data": null
}
```

### Common Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Implementation Phases

### Phase 1: Foundation ✅ (In Progress)
- [x] Project setup and structure
- [x] Database configuration
- [x] Authentication system
- [ ] User management module
- [ ] Error handling and logging

### Phase 2-10: Features (To be implemented)
- KYC verification system
- Vehicle parts marketplace
- Mechanic services
- Vehicle rental system
- RSA subscriptions
- Cleaning services
- Payment processing
- Admin panel
- Real-time updates

## Contributing

1. Follow the existing code structure
2. Use meaningful variable/function names
3. Add JSDoc comments for all functions
4. Test your changes before committing
5. Write clear commit messages

## Security Notes

- Never commit `.env` file
- Always validate user input
- Use parameterized queries (already done with pg library)
- Hash passwords with bcrypt
- Verify JWT tokens on protected routes
- Use HTTPS in production
- Implement CORS properly
- Rate limit sensitive endpoints

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d vehicle_super_app

# Or use psql with password
psql -h localhost -U postgres -d vehicle_super_app
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Migration Error
```bash
# Reset database
dropdb vehicle_super_app
createdb vehicle_super_app
npm run migrate
```

## Next Steps

1. Implement user management module (Phase 1)
2. Create database migration runner
3. Implement KYC verification system (Phase 2)
4. Build parts marketplace (Phase 3)
5. Add mechanic services (Phase 4)
6. Implement vehicle rentals (Phase 5)

## Support

For issues or questions, please create an issue in the repository.

## License

MIT License - See LICENSE file for details

---

**Last Updated**: January 25, 2026
**Status**: Phase 1 - Foundation (In Progress)
