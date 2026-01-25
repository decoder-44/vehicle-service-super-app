/**
 * Main Application Logic
 */

let currentOtpId = null;
let userData = null;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (authToken) {
        showDashboard();
        loadUserProfile();
    } else {
        showSection('auth');
    }

    // Setup form handlers
    setupFormHandlers();
    setupNavigation();
});

/**
 * Form Handlers
 */
function setupFormHandlers() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const result = await login(email, password);
            showToast('Logged in successfully!', 'success');
            showDashboard();
            loadUserProfile();
            document.getElementById('loginForm').reset();
        } catch (error) {
            document.getElementById('loginMsg').textContent = '❌ ' + error.message;
        }
    });

    // Register form
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('regFullName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;

        if (password.length < 8) {
            document.getElementById('regMsg').textContent = '❌ Password must be at least 8 characters';
            return;
        }

        try {
            const result = await register(fullName, email, phone, password);
            showToast('Registered successfully!', 'success');
            showDashboard();
            loadUserProfile();
            document.getElementById('registerForm').reset();
        } catch (error) {
            document.getElementById('regMsg').textContent = '❌ ' + error.message;
        }
    });

    // OTP form
    document.getElementById('otpForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('otpPhone').value;
        const otp = document.getElementById('otpCode').value;

        if (!currentOtpId) {
            document.getElementById('otpMsg').textContent = '❌ Please send OTP first';
            return;
        }

        try {
            const result = await verifyOTP(phone, otp, currentOtpId);
            showToast('Logged in successfully!', 'success');
            showDashboard();
            loadUserProfile();
            document.getElementById('otpForm').reset();
            currentOtpId = null;
        } catch (error) {
            document.getElementById('otpMsg').textContent = '❌ ' + error.message;
        }
    });

    // Update profile form
    document.getElementById('updateProfileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('editFullName').value;
        const phone = document.getElementById('editPhone').value;

        try {
            await updateUserProfile(fullName, phone);
            showToast('Profile updated successfully!', 'success');
            loadUserProfile();
            document.getElementById('editProfileForm').style.display = 'none';
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Add address form
    document.getElementById('newAddressForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const address_line1 = document.getElementById('address_line1').value;
        const city = document.getElementById('addrCity').value;
        const state = document.getElementById('addrState').value;
        const zipCode = document.getElementById('addrZip').value;
        const country = document.getElementById('addrCountry').value;
        const type = document.getElementById('addrType').value;
        const isDefault = document.getElementById('addrDefault').checked;

        try {
            await addAddress(address_line1, city, state, zipCode, country, type, isDefault);
            showToast('Address added successfully!', 'success');
            loadAddresses();
            document.getElementById('newAddressForm').reset();
            document.getElementById('addAddressForm').style.display = 'none';
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    // Change password form
    document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            document.getElementById('pwdMsg').textContent = '❌ Passwords do not match';
            return;
        }

        if (newPassword.length < 8) {
            document.getElementById('pwdMsg').textContent = '❌ Password must be at least 8 characters';
            return;
        }

        try {
            await changePassword(oldPassword, newPassword);
            showToast('Password changed successfully!', 'success');
            document.getElementById('changePasswordForm').reset();
            document.getElementById('pwdMsg').textContent = '✅ Password changed successfully';
        } catch (error) {
            document.getElementById('pwdMsg').textContent = '❌ ' + error.message;
        }
    });

    // Convert role form
    document.getElementById('convertRoleForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newRole = document.getElementById('newRole').value;

        try {
            await convertUserRole(newRole);
            showToast(`Role converted to ${newRole} successfully!`, 'success');
            loadUserProfile();
            document.getElementById('convertRoleForm').reset();
        } catch (error) {
            document.getElementById('roleMsg').textContent = '❌ ' + error.message;
        }
    });
}

/**
 * OTP Handler
 */
async function sendOTP() {
    const phone = document.getElementById('otpPhone').value;

    if (!phone) {
        document.getElementById('otpMsg').textContent = '❌ Please enter phone number';
        return;
    }

    try {
        const result = await sendOTP(phone);
        currentOtpId = result.data.otp_id;
        
        // Show OTP input field
        document.getElementById('otpCode').style.display = 'block';
        document.getElementById('verifyOtpBtn').style.display = 'block';
        
        document.getElementById('otpMsg').textContent = '✅ OTP sent! Check your phone';
    } catch (error) {
        document.getElementById('otpMsg').textContent = '❌ ' + error.message;
    }
}

/**
 * Load User Profile
 */
async function loadUserProfile() {
    try {
        const result = await getUserProfile();
        userData = result.data;
        
        const profileInfo = document.getElementById('profileInfo');
        profileInfo.innerHTML = `
            <div class="info-row">
                <strong>Name:</strong> ${userData.full_name}
            </div>
            <div class="info-row">
                <strong>Email:</strong> ${userData.email}
            </div>
            <div class="info-row">
                <strong>Phone:</strong> ${userData.phone}
            </div>
            <div class="info-row">
                <strong>Role:</strong> <span class="badge">${userData.role}</span>
            </div>
            <div class="info-row">
                <strong>KYC Status:</strong> <span class="badge ${userData.kyc_status}">${userData.kyc_status}</span>
            </div>
        `;

        // Pre-fill edit form
        document.getElementById('editFullName').value = userData.full_name;
        document.getElementById('editPhone').value = userData.phone;
        document.getElementById('currentRole').textContent = userData.role;

        // Load addresses
        loadAddresses();
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

/**
 * Load Addresses
 */
async function loadAddresses() {
    try {
        const result = await getAddresses();
        const addresses = result.data;
        
        const addressesList = document.getElementById('addressesList');
        
        if (addresses.length === 0) {
            addressesList.innerHTML = '<p>No addresses added yet</p>';
            return;
        }

        addressesList.innerHTML = addresses.map(addr => `
            <div class="address-card">
                <div class="address-info">
                    <strong>${addr.type.toUpperCase()}</strong>
                    ${addr.is_default ? '<span class="badge success">Default</span>' : ''}
                    <p>${addr.address_line1}, ${addr.city}, ${addr.state} - ${addr.zip_code}</p>
                    <p>${addr.country}</p>
                </div>
                <div class="address-actions">
                    <button class="btn small" onclick="editAddress(${addr.id}, '${addr.address_line1}', '${addr.city}', '${addr.state}', '${addr.zip_code}', '${addr.country}', '${addr.type}', ${addr.is_default})">Edit</button>
                    <button class="btn small danger" onclick="deleteAddressAction(${addr.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

/**
 * Delete Address
 */
async function deleteAddressAction(id) {
    if (confirm('Are you sure you want to delete this address?')) {
        try {
            await deleteAddress(id);
            showToast('Address deleted successfully!', 'success');
            loadAddresses();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

/**
 * Edit Address (for now just reload the list)
 */
function editAddress(id, address_line1, city, state, zipCode, country, type, isDefault) {
    // This can be extended with a modal/form for editing
    showToast('Edit address feature coming soon!', 'info');
}

/**
 * UI Functions
 */

function setupNavigation() {
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(sectionId)?.classList.remove('hidden');
    
    // Update nav
    document.getElementById('dashboardLink').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}

function showDashboard() {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById('dashboard')?.classList.remove('hidden');
    document.getElementById('dashboardLink').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';
    showTab('profile');
}

function showTab(tabId) {
    document.querySelectorAll('#dashboard .tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
}

function switchTab(tabId) {
    document.querySelectorAll('#auth .tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');

    document.querySelectorAll('#auth .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function showEditProfile() {
    const form = document.getElementById('editProfileForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showAddAddressForm() {
    const form = document.getElementById('addAddressForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function scrollTo(sectionId) {
    showSection(sectionId);
}

function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    userData = null;
    showSection('home');
    document.querySelectorAll('form').forEach(f => f.reset());
    showToast('Logged out successfully!', 'success');
}

/**
 * Toast Notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
