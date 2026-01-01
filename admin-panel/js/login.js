// Admin Login JavaScript

const API_BASE = window.location.origin;

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');

    // Check if already logged in and validate token
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Validate token before redirecting
        validateAdminToken(token);
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Store token and admin info
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminInfo', JSON.stringify(data.admin));

                showToast('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast(data.message || 'Login failed', 'error');
                submitBtn.textContent = 'Login to Admin Panel';
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Connection error. Please check if the server is running.', 'error');
            submitBtn.textContent = 'Login to Admin Panel';
            submitBtn.disabled = false;
        }
    });
});

// Validate admin token
async function validateAdminToken(token) {
    try {
        const API_BASE = window.location.origin;
        const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Token is valid, redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Token is invalid, clear it and stay on login page
            localStorage.removeItem('adminToken');
            console.log('Session expired, please login again');
        }
    } catch (error) {
        // Error validating token, clear it
        localStorage.removeItem('adminToken');
        console.log('Error validating session');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0077b5'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
