# Vehicle Super App - Frontend

A simple, modern web interface for the Vehicle Super App backend.

## Features

- ✅ User Authentication (Email/Password & Phone OTP)
- ✅ User Profile Management
- ✅ Address Management (Add/Edit/Delete)
- ✅ Password Change
- ✅ User Role Conversion
- ✅ Responsive Design
- ✅ Real-time Toast Notifications

## Architecture

```
frontend/
├── index.html       - Main HTML structure
├── style.css        - All styling
├── src/
│   ├── app.js       - Main application logic
│   └── api.js       - Backend API client
└── README.md        - This file
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Backend server running on `http://localhost:5001`

### Running the Frontend

#### Option 1: Using Python (Recommended)

```bash
cd frontend
python3 -m http.server 3000
```

Then open: `http://localhost:3000`

#### Option 2: Using Node.js http-server

```bash
cd frontend
npx http-server -p 3000
```

Then open: `http://localhost:3000`

#### Option 3: Direct File Opening

Simply open `frontend/index.html` in your browser (limited functionality without a server due to CORS).

## How to Use

### 1. Authentication

**Option A: Email & Password**
- Click "Register" to create a new account
- Fill in details: Full Name, Email, Phone, Password
- Click "Register"
- You'll be automatically logged in

**Option B: Email & Password Login**
- Click "Login" tab
- Enter email and password
- Click "Login"

**Option C: Phone OTP**
- Click "Login with OTP" tab
- Enter phone number
- Click "Send OTP"
- Enter the OTP received
- Click "Verify OTP"

### 2. User Profile

- View your profile information
- Click "Edit Profile" to update name and phone
- Save changes

### 3. Manage Addresses

- Click "Addresses" in sidebar
- Click "+ Add New Address" button
- Fill in address details:
  - Street address
  - City
  - State
  - Zip code
  - Country
  - Type (home/work/other)
  - Mark as default (optional)
- Click "Add Address"
- Delete addresses by clicking "Delete" button

### 4. Change Password

- Click "Change Password" in sidebar
- Enter current password
- Enter new password (min 8 characters)
- Confirm new password
- Click "Change Password"

### 5. Convert User Role

- Click "⭐ Convert Role" in sidebar
- Select a new role:
  - **Customer**: Buy parts, book services
  - **Merchant**: Sell vehicle parts
  - **Mechanic**: Provide repair services
  - **Rental Host**: Rent out vehicles
  - **Cleaning Partner**: Provide cleaning services
- Click "Convert Role"

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile
- `DELETE /api/users/me` - Deactivate account
- `POST /api/users/change-password` - Change password

### Address Management
- `POST /api/users/addresses` - Add address
- `GET /api/users/addresses` - List addresses
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address

### Role Management
- `POST /api/users/convert-role` - Convert to new role

## Technical Details

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Responsive design, gradients, animations
- **Vanilla JavaScript**: No frameworks, pure JS
- **Fetch API**: HTTP requests to backend

### Key Features
- **Token Storage**: JWT token saved in localStorage
- **Error Handling**: Toast notifications for errors
- **Form Validation**: Client-side validation
- **Responsive Design**: Works on mobile, tablet, desktop
- **CORS Enabled**: Configured to work with backend CORS settings

### Storage
- Authentication token stored in browser's localStorage
- Automatically included in all API requests
- Cleared on logout

## Troubleshooting

### "CORS error when making requests"
- Make sure backend server is running on `http://localhost:5001`
- Check that CORS is enabled in backend app.js

### "Cannot connect to backend"
- Verify backend is running: `npm run dev` in the backend folder
- Check the API_BASE_URL in `src/api.js` is correct

### "OTP not being sent"
- The OTP feature requires a real SMS service (Twilio, MSG91)
- For testing, check the server logs for generated OTP

### "Form not submitting"
- Check browser console for errors
- Verify all required fields are filled
- Make sure backend server is running

## Development Notes

### Adding New Features

1. **Create API function** in `src/api.js`:
   ```javascript
   async function myNewFunction(param1, param2) {
       return await apiRequest('/api/endpoint', 'POST', { param1, param2 });
   }
   ```

2. **Add UI in** `index.html`:
   ```html
   <form id="myForm">
       <input type="text" id="param1" required>
       <button type="submit">Submit</button>
   </form>
   ```

3. **Add event handler** in `src/app.js`:
   ```javascript
   document.getElementById('myForm')?.addEventListener('submit', async (e) => {
       e.preventDefault();
       try {
           await myNewFunction(value1, value2);
           showToast('Success!', 'success');
       } catch (error) {
           showToast(error.message, 'error');
       }
   });
   ```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Notes

- **HTTPS**: Use HTTPS in production
- **Token Storage**: Consider more secure token storage for production
- **CORS**: Configure CORS properly for your domain
- **Input Validation**: Both frontend and backend validation needed
- **API Keys**: Don't expose sensitive keys in frontend code

## Performance

- No external dependencies (uses Vanilla JS)
- Single CSS file (easily cacheable)
- Minimal JavaScript (fast load times)
- Optimized for production with minification recommended

## Future Enhancements

- [ ] Add modal dialogs
- [ ] Implement search functionality
- [ ] Add image upload for profiles
- [ ] Real-time location selection
- [ ] Payment integration
- [ ] Order/booking management UI
- [ ] Dark mode
- [ ] Multilingual support

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API.md in the backend folder
3. Check browser console for errors
4. Verify backend is running and accessible
