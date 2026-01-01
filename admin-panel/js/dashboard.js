// Admin Dashboard JavaScript

const API_BASE = window.location.origin;

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    return token;
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = 'index.html';
}

// Load dashboard data
async function loadDashboard() {
    const token = checkAuth();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            updateAnalytics(data.data.analytics);
            updatePendingUsers(data.data.pendingUsersList);
            updateRecentUsers(data.data.recentUsers);
        } else {
            if (response.status === 401) {
                logout();
            } else {
                showToast(data.message || 'Failed to load dashboard', 'error');
            }
        }
    } catch (error) {
        console.error('Dashboard load error:', error);
        showToast('Connection error. Please check if the server is running.', 'error');
    }
}

// Update analytics cards
function updateAnalytics(analytics) {
    document.getElementById('totalUsers').textContent = analytics.totalUsers || 0;
    document.getElementById('approvedUsers').textContent = analytics.approvedUsers || 0;
    document.getElementById('pendingUsers').textContent = analytics.pendingUsers || 0;
    document.getElementById('rejectedUsers').textContent = analytics.rejectedUsers || 0;
    document.getElementById('activeUsers').textContent = analytics.activeUsers || 0;
    document.getElementById('approvalRate').textContent = (analytics.approvalRate || 0) + '%';
}

// Update pending users table
function updatePendingUsers(users) {
    const tbody = document.getElementById('pendingUsersBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No pending users</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        const regDate = new Date(user.createdAt).toLocaleDateString();
        let renewalInfo = '<span class="status-badge status-pending">Not Approved</span>';
        
        if (user.subscriptionEndDate) {
            const renewalDate = new Date(user.subscriptionEndDate);
            const daysLeft = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));
            const renewalDateStr = renewalDate.toLocaleDateString();
            
            if (daysLeft > 0) {
                renewalInfo = `<span class="status-badge status-approved">${renewalDateStr} (${daysLeft} days left)</span>`;
            } else if (daysLeft === 0) {
                renewalInfo = `<span class="status-badge" style="background: #f59e0b">Today</span>`;
            } else {
                renewalInfo = `<span class="status-badge status-rejected">Expired ${Math.abs(daysLeft)} days ago</span>`;
            }
        }
        
        return `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.paymentMethod}">${user.paymentMethod}</span></td>
            <td>${regDate}</td>
            <td>${renewalInfo}</td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="viewScreenshot('${user.paymentScreenshot}')">
                    View
                </button>
            </td>
            <td>
                <button class="btn btn-small btn-success" onclick="approveUser('${user._id}')">
                    Approve
                </button>
                <button class="btn btn-small btn-danger" onclick="showRejectModal('${user._id}')">
                    Reject
                </button>
            </td>
        </tr>
    `}).join('');
}

// Update recent users table
function updateRecentUsers(users) {
    const tbody = document.getElementById('recentUsersBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No recent users</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// View payment screenshot
// View payment screenshot
window.viewScreenshot = function(screenshotPath) {
    const modal = document.getElementById('screenshotModal');
    const img = document.getElementById('screenshotImage');
    
    img.src = `${API_BASE}/${screenshotPath}`;
    modal.classList.add('active');
}

// Approve user
window.approveUser = async function(userId) {
    console.log('Approve button clicked for user:', userId);
    
    if (!confirm('Are you sure you want to approve this user?')) {
        return;
    }

    const token = checkAuth();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/admin/users/${userId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Approve response:', data);

        if (data.success) {
            showToast('User approved successfully!', 'success');
            loadDashboard(); // Reload dashboard
        } else {
            showToast(data.message || 'Failed to approve user', 'error');
        }
    } catch (error) {
        console.error('Approve error:', error);
        showToast('Connection error', 'error');
    }
}

// Show reject modal
let rejectUserId = null;

window.showRejectModal = function(userId) {
    console.log('Reject button clicked for user:', userId);
    rejectUserId = userId;
    const modal = document.getElementById('rejectModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error('Reject modal not found!');
    }
}

// Reject user with reason
window.rejectUser = async function() {
    if (!rejectUserId) return;

    const reason = document.getElementById('rejectReason').value.trim();
    
    if (!reason) {
        showToast('Please provide a rejection reason', 'error');
        return;
    }

    const token = checkAuth();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/admin/users/${rejectUserId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (data.success) {
            showToast('User rejected', 'success');
            closeModal('rejectModal');
            document.getElementById('rejectReason').value = '';
            rejectUserId = null;
            loadDashboard(); // Reload dashboard
        } else {
            showToast(data.message || 'Failed to reject user', 'error');
        }
    } catch (error) {
        console.error('Reject error:', error);
        showToast('Connection error', 'error');
    }
}

// Close modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Clear reject form if closing reject modal
    if (modalId === 'rejectModal') {
        document.getElementById('rejectReason').value = '';
        rejectUserId = null;
    }
}

// Show toast notification
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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load admin info
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');
    if (adminInfo.name) {
        document.getElementById('adminName').textContent = adminInfo.name;
    }

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Reject confirmation button
    const confirmRejectBtn = document.getElementById('confirmRejectBtn');
    if (confirmRejectBtn) {
        confirmRejectBtn.addEventListener('click', rejectUser);
    }

    // Load dashboard data
    loadDashboard();

    // Refresh every 30 seconds
    setInterval(loadDashboard, 30000);
});

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
