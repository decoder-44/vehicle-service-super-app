# 🚀 Quick Start Guide - Vehicle Super App

Follow these steps to get the application running locally.

## Step 1: Prerequisites

Ensure you have the following installed:
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))

Verify installation:
```bash
node --version
npm --version
psql --version
```

## Step 2: Clone & Setup

```bash
# Navigate to project directory
cd vehicle-service-super-app

# Install dependencies
npm install
```

## Step 3: Create Database

Open PostgreSQL and run:
```bash
# Using psql CLI
psql -U postgres

# Inside PostgreSQL:
CREATE DATABASE vehicle_super_app;
\q
```

Or using a GUI tool like pgAdmin.

## Step 4: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# At minimum, update:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - JWT_SECRET (keep secure!)
# - Other optional services (Razorpay, Google Maps, etc.)
```

## Step 5: Run Migrations

```bash
npm run migrate
```

This creates all database tables and indexes.

## Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000 in development mode
```

## Step 7: Test API

Open Postman/Thunder Client and test:

### 1. Health Check
```
GET http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-25T..."
}
```

### 2. Send OTP
```
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otpId": "uuid-here",
    "message": "OTP sent successfully"
  }
}
```

### 3. Verify OTP
```
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "otp_id": "uuid-from-previous-response"
}
```

Response:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "phone": "+919876543210",
      "full_name": "",
      "role": "customer",
      "kyc_status": "pending",
      ...
    }
  }
}
```

### 4. Get Current User
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <jwt-token-from-verify-otp>
```

## Development Tips

### Hot Reload
The server uses `nodemon` and automatically restarts on file changes.

### View Logs
Logs are saved in:
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs

Also printed to console in development mode.

### Database Access
```bash
# Connect to database
psql -U postgres -d vehicle_super_app

# List tables
\dt

# Check users table
SELECT * FROM users;

# Exit
\q
```

### Reset Database
```bash
# Drop and recreate
dropdb vehicle_super_app
createdb vehicle_super_app
npm run migrate

# Recreate sample data (coming soon)
npm run seed
```

## Troubleshooting

### "Cannot find module" Error
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Failed
1. Verify PostgreSQL is running
2. Check `.env` database credentials
3. Ensure database exists:
   ```bash
   psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='vehicle_super_app';"
   ```

### Port 5000 Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

### Migration Errors
```bash
# Check migration files exist
ls -la src/database/migrations/

# Run migrations with debug
DEBUG=* npm run migrate
```

## Next Steps

1. **Create User Module** - User profile management, addresses
2. **Implement KYC System** - Document upload, verification
3. **Build Parts Marketplace** - Listing, ordering, payments
4. **Add Mechanic Services** - Booking, location matching
5. **Vehicle Rentals** - Listing, availability, bookings

## Environment Variables Explained

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| NODE_ENV | App environment | Yes | development |
| PORT | Server port | No | 5000 |
| DB_HOST | PostgreSQL host | Yes | localhost |
| DB_PORT | PostgreSQL port | Yes | 5432 |
| DB_NAME | Database name | Yes | vehicle_super_app |
| DB_USER | Database user | Yes | postgres |
| DB_PASSWORD | Database password | Yes | yourpass |
| JWT_SECRET | JWT signing key | Yes | random_secret_key |
| JWT_EXPIRES_IN | Token expiry | No | 30d |
| RAZORPAY_KEY_ID | Razorpay API key | No | rzp_test_xxx |
| GOOGLE_MAPS_API_KEY | Maps API | No | your_api_key |

## File Structure Quick Reference

```
src/
├── app.js                  # Express app setup
├── config/                 # Configuration
├── database/               # Database layer
│   ├── connection.js       # Connection pool
│   └── migrations/         # SQL migrations
├── middleware/             # Express middleware
├── modules/                # Feature modules
│   ├── auth/               # Authentication
│   ├── users/              # User management
│   ├── parts/              # Parts marketplace
│   └── ...
├── utils/                  # Utility functions
└── socket/                 # Real-time (Socket.io)

server.js                   # Entry point
.env.example               # Environment template
```

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [JWT Guide](https://jwt.io/introduction)

## Getting Help

1. Check the [README.md](README.md) for detailed documentation
2. Review code comments in the modules
3. Check logs in `logs/` folder
4. Create an issue in the repository

## Happy Coding! 🎉

You're now ready to develop. Start implementing features from Phase 1!

**Current Status**: Phase 1 - Foundation (In Progress)
- [x] Project setup
- [x] Database schema
- [x] Authentication module
- [ ] User management
- [ ] Error handling improvements
