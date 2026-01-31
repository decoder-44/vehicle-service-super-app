# Development Guide - Vehicle Super App

## 🎯 Quick Development Tips

### Starting Development

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 2. Install dependencies
npm install

# 3. Create database
psql -U postgres
CREATE DATABASE vehicle_super_app;
\q

# 4. Run migrations
npm run migrate

# 5. Start development server
npm run dev
```

---

## 🧪 Testing with cURL

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

Save the token from response!

### 3. Get Profile
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Common Development Tasks

### Adding a New Endpoint

1. **Add to Service** (`src/modules/<module>/service.js`)
```javascript
export const myNewFunction = async (userId, data) => {
  try {
    const result = await pool.query('...');
    return result.rows[0];
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    throw error;
  }
};
```

2. **Add to Controller** (`src/modules/<module>/controller.js`)
```javascript
export const myNewEndpoint = async (req, res) => {
  try {
    const result = await service.myNewFunction(req.user.id, req.body);
    return successResponse(res, result, 'Success message');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
```

3. **Add Route** (`src/modules/<module>/routes.js`)
```javascript
router.post('/my-endpoint', authenticateToken, controller.myNewEndpoint);
```

### Modifying Database Schema

⚠️ **Warning:** Only do this in development!

1. Drop existing database:
```bash
psql -U postgres
DROP DATABASE vehicle_super_app;
CREATE DATABASE vehicle_super_app;
\q
```

2. Modify migration file:
```sql
-- Add to src/database/migrations/001_create_core_tables.sql
CREATE TABLE my_new_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);
```

3. Run migration:
```bash
npm run migrate
```

### Adding Validation

Use Joi in controller:
```javascript
import Joi from 'joi';

export const myEndpoint = async (req, res) => {
  // Define schema
  const schema = Joi.object({
    email: Joi.string().email().required(),
    age: Joi.number().min(18).required()
  });

  // Validate
  const { error } = schema.validate(req.body);
  if (error) {
    return errorResponse(res, error.details[0].message, 400);
  }

  // Continue...
};
```

---

## 🐛 Debugging

### Enable Debug Mode

In `.env`:
```
NODE_ENV=development
LOG_LEVEL=debug
```

Or run with debug:
```bash
npm run dev:debug
```

Then attach debugger in VS Code.

### View Logs

Logs are stored in `logs/` directory:
```bash
# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log
```

### Database Debugging

Check if tables exist:
```bash
psql -U postgres -d vehicle_super_app
\dt
```

View table structure:
```bash
\d users
```

Query data:
```sql
SELECT * FROM users LIMIT 5;
```

---

## 📊 Testing Different Roles

### 1. Create Admin User

Manually in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

### 2. Become a Mechanic

```bash
# First, verify your KYC
curl -X POST http://localhost:5000/api/kyc/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "aadhar",
    "documentNumber": "1234-5678-9012",
    "documentFrontUrl": "https://example.com/front.jpg",
    "documentBackUrl": "https://example.com/back.jpg",
    "selfieUrl": "https://example.com/selfie.jpg"
  }'

# Then create mechanic profile
curl -X POST http://localhost:5000/api/mechanic/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceTypes": ["basic_service", "repair"],
    "vehicleExpertise": ["car", "bike"],
    "serviceAreaCity": "Mumbai",
    "serviceRadiusKm": 10,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "hourlyRate": 500
  }'
```

### 3. Become a Merchant

Similar to mechanic - verify KYC, then create parts listings.

---

## 🔐 Security Testing

### Test Rate Limiting

Try making 6 requests quickly to auth endpoint:
```bash
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}';
done
```

Should get rate limited after 5 attempts.

### Test Authorization

Try accessing admin endpoint without admin role:
```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN"
```

Should get 403 Forbidden.

---

## 💡 Pro Tips

### 1. Use Environment Variables Wisely

Never commit `.env` file! Always use `.env.example`.

### 2. Database Transactions

For operations that modify multiple tables:
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... multiple queries
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### 3. Logging Best Practices

```javascript
// Info level for normal operations
logger.info(`User ${userId} performed action`);

// Warn for recoverable issues
logger.warn(`Rate limit approaching for user ${userId}`);

// Error for failures
logger.error(`Failed to process payment: ${error.message}`);
```

### 4. Testing Payments

Use Razorpay test mode:
- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

### 5. Quick Data Seeding

Create a seed script if needed:
```javascript
// src/database/seed.js
import pool from './connection.js';

const seedData = async () => {
  // Insert test users
  await pool.query(`
    INSERT INTO users (id, email, full_name, role, is_active)
    VALUES 
      (uuid_generate_v4(), 'admin@test.com', 'Admin User', 'admin', true),
      (uuid_generate_v4(), 'mechanic@test.com', 'Mechanic User', 'mechanic', true)
  `);
};

seedData().then(() => process.exit(0));
```

---

## 🚀 Performance Optimization

### 1. Add Indexes

For frequently queried fields:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_status ON service_bookings(booking_status);
```

### 2. Use Connection Pooling

Already configured in `connection.js`:
```javascript
const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Cache Frequently Accessed Data

Consider adding Redis for:
- User sessions
- Frequently accessed settings
- Rate limiting counters

---

## 📱 Frontend Integration

### Setting Up Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const response = await api.get('/users/profile');
```

### Handling Errors

```javascript
try {
  const response = await api.post('/parts/orders', orderData);
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error(error.response.data.message);
  } else if (error.request) {
    // No response received
    console.error('Network error');
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## 🐳 Docker Setup (Optional)

### Dockerfile

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: vehicle_super_app
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
  
  api:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      DB_HOST: db
```

---

## 📦 Useful Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node src/database/migrate.js",
    "seed": "node src/database/seed.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

---

## 🎓 Learning Resources

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🆘 Common Issues

### "Port already in use"

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### "Database connection error"

1. Check if PostgreSQL is running:
```bash
psql -U postgres
```

2. Verify credentials in `.env`
3. Check database exists:
```sql
\l
```

### "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] All tests passing
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Error logging working
- [ ] Payment gateway tested
- [ ] Email/SMS tested
- [ ] File uploads tested (if applicable)
- [ ] API documentation updated
- [ ] Load testing completed
- [ ] SSL certificate installed
- [ ] Backup system configured

---

**Happy Coding! 🚀**

For questions or issues, refer to:
- API_COMPLETE.md for API reference
- IMPLEMENTATION_SUMMARY.md for overview
- README.md for general information
