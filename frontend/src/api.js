/**
 * API Client for Vehicle Super App Frontend
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = 'http://localhost:5001';

// Store token in localStorage
let authToken = localStorage.getItem('authToken');

/**
 * Generic API request function
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.message || 'API Error');
        }

        return json;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

/**
 * Authentication APIs
 */
async function login(email, password) {
    const result = await apiRequest('/api/auth/login', 'POST', { email, password });
    if (result.statusCode?.token) {
        authToken = result.statusCode.token;
        localStorage.setItem('authToken', authToken);
    }
    return result;
}

async function register(full_name, email, phone, password) {
    const result = await apiRequest('/api/auth/register', 'POST', {
        full_name,
        email,
        phone,
        password,
    });
    if (result.data.token) {
        authToken = result.data.token;
        localStorage.setItem('authToken', authToken);
    }
    return result;
}

async function sendOTP(phone) {
    return await apiRequest('/api/auth/send-otp', 'POST', { phone });
}

async function verifyOTP(phone, otp, otpId) {
    const result = await apiRequest('/api/auth/verify-otp', 'POST', {
        phone,
        otp,
        otp_id: otpId,
    });
    if (result.data.token) {
        authToken = result.data.token;
        localStorage.setItem('authToken', authToken);
    }
    return result;
}

/**
 * User Profile APIs
 */
async function getUserProfile() {
    return await apiRequest('/api/users/me/getProfile', 'GET');
}

async function updateUserProfile(fullName, phone, profilePictureUrl) {
    return await apiRequest('/api/users/me/updateProfile', 'PUT', {
        fullName,
        phone,
        profilePictureUrl,
    });
}

async function changePassword(oldPassword, newPassword) {
    return await apiRequest('/api/users/change-password', 'POST', {
        oldPassword,
        newPassword,
    });
}

async function deactivateAccount() {
    return await apiRequest('/api/users/me/deactivateAccount', 'DELETE');
}

/**
 * Address APIs
 */
async function addAddress(address_line1, city, state, zipCode, country, type, isDefault) {
    return await apiRequest('/api/users/add-addresses', 'POST', {
        address_line1,
        city,
        state,
        zipCode,
        country,
        type,
        isDefault,
    });
}

async function getAddresses() {
    return await apiRequest('/api/users/get-addresses', 'GET');
}

async function updateAddress(id, address_line1, addressLine2, city, state, zipCode, country, type, isDefault) {
    return await apiRequest(`/api/users/update-addresses/${id}`, 'PUT', {
        address_line1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        type,
        isDefault,
    });
}

async function deleteAddress(id) {
    return await apiRequest(`/api/users/delete-addresses/${id}`, 'DELETE');
}

/**
 * Role Conversion APIs
 */
async function convertUserRole(newRole) {
    return await apiRequest('/api/users/convert-role', 'POST', { newRole });
}
