// User Management JavaScript

const API_BASE = window.location.origin;

let currentStatus = 'all';
let currentPage = 1;
let searchQuery = '';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }
    return token;
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = 'index.html';
}

// Load users
async function loadUsers(status = 'all', search = '', page = 1) {
    const token = checkAuth();
    if (!token) return;

    try {
        const queryParams = new URLSearchParams({
            status: status,
            page: page,
            limit: 20
        });

        if (search) {
            queryParams.append('search', search);
        }

        const response = await fetch(`${API_BASE}/api/admin/users?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            updateUsersTable(data.data.users);
            updatePagination(data.data.pagination);
            updateCounts();
        } else {
            if (response.status === 401) {
                logout();
            } else {
                showToast(data.message || 'Failed to load users', 'error');
            }
        }
    } catch (error) {
        console.error('Load users error:', error);
        showToast('Connection error', 'error');
    }
}

// Update users table
function updateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {
        let renewalInfo = '<span class="status-badge status-pending">Not Approved</span>';
        
        if (user.subscriptionEndDate) {
            const renewalDate = new Date(user.subscriptionEndDate);
            const daysLeft = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));
            const renewalDateStr = renewalDate.toLocaleDateString();
            
            if (daysLeft > 0) {
                renewalInfo = `${renewalDateStr} <small>(${daysLeft}d left)</small>`;
            } else if (daysLeft === 0) {
                renewalInfo = `<span style="color: #f59e0b; font-weight: bold;">Today</span>`;
            } else {
                renewalInfo = `<span style="color: #ef4444; font-weight: bold;">Expired ${Math.abs(daysLeft)}d ago</span>`;
            }
        }
        
        return `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status-badge status-${user.paymentMethod}">${user.paymentMethod}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>${renewalInfo}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="viewUserDetails('${user._id}')">
                    View
                </button>
                ${user.status === 'pending' ? `
                    <button class="btn btn-small btn-success" onclick="approveUser('${user._id}')">
                        Approve
                    </button>
                    <button class="btn btn-small btn-danger" onclick="showRejectModal('${user._id}')">
                        Reject
                    </button>
                ` : ''}
            </td>
        </tr>
    `}).join('');
}

// Update pagination
function updatePagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    
    if (pagination.pages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `<button ${pagination.page === 1 ? 'disabled' : ''} onclick="changePage(${pagination.page - 1})">Previous</button>`;

    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === 1 || i === pagination.pages || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
            html += `<button class="${i === pagination.page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === pagination.page - 3 || i === pagination.page + 3) {
            html += `<span>...</span>`;
        }
    }

    // Next button
    html += `<button ${pagination.page === pagination.pages ? 'disabled' : ''} onclick="changePage(${pagination.page + 1})">Next</button>`;

    paginationDiv.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    loadUsers(currentStatus, searchQuery, currentPage);
}

// Update counts in filter tabs
async function updateCounts() {
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
            document.getElementById('pendingCount').textContent = data.data.analytics.pendingUsers || 0;
            document.getElementById('approvedCount').textContent = data.data.analytics.approvedUsers || 0;
            document.getElementById('rejectedCount').textContent = data.data.analytics.rejectedUsers || 0;
        }
    } catch (error) {
        console.error('Update counts error:', error);
    }
}

// View user details
// View user details
window.viewUserDetails = async function(userId) {
    const token = checkAuth();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showUserDetailsModal(data.data);
        } else {
            showToast(data.message || 'Failed to load user details', 'error');
        }
    } catch (error) {
        console.error('Load user details error:', error);
        showToast('Connection error', 'error');
    }
}

// Show user details modal
function showUserDetailsModal(user) {
    const modal = document.getElementById('userModal');
    const body = document.getElementById('userDetailsBody');

    body.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div>
                <h4 style="margin-bottom: 1rem; color: var(--dark);">Personal Information</h4>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${user.status}">${user.status}</span></p>
                <p><strong>Approved:</strong> ${user.isApproved ? 'Yes' : 'No'}</p>
            </div>
            <div>
                <h4 style="margin-bottom: 1rem; color: var(--dark);">Account Details</h4>
                <p><strong>Payment Method:</strong> ${user.paymentMethod}</p>
                <p><strong>Registered:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
                <p><strong>Last Login:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                <p><strong>Login Count:</strong> ${user.loginCount || 0}</p>
            </div>
        </div>

        ${user.rejectionReason ? `
            <div style="margin-top: 1.5rem; padding: 1rem; background: #fee2e2; border-radius: 6px;">
                <strong>Rejection Reason:</strong><br>
                ${user.rejectionReason}
            </div>
        ` : ''}

        <div style="margin-top: 1.5rem;">
            <h4 style="margin-bottom: 1rem; color: var(--dark);">Payment Screenshot</h4>
            <img src="${API_BASE}/${user.paymentScreenshot}" alt="Payment Screenshot" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        </div>

        <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
            ${user.status === 'pending' ? `
                <button class="btn btn-success" onclick="approveUser('${user._id}'); closeModal('userModal');">
                    Approve User
                </button>
                <button class="btn btn-danger" onclick="showRejectModal('${user._id}'); closeModal('userModal');">
                    Reject User
                </button>
            ` : ''}
            <button class="btn btn-danger" onclick="deleteUser('${user._id}')">
                Delete User
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// Approve user
window.approveUser = async function(userId) {
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

        if (data.success) {
            showToast('User approved successfully!', 'success');
            loadUsers(currentStatus, searchQuery, currentPage);
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
    rejectUserId = userId;
    const modal = document.getElementById('rejectModal');
    modal.classList.add('active');
}

// Reject user
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
            loadUsers(currentStatus, searchQuery, currentPage);
        } else {
            showToast(data.message || 'Failed to reject user', 'error');
        }
    } catch (error) {
        console.error('Reject error:', error);
        showToast('Connection error', 'error');
    }
}

// Delete user
// Delete user
window.deleteUser = async function(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    const token = checkAuth();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            showToast('User deleted successfully', 'success');
            closeModal('userModal');
            loadUsers(currentStatus, searchQuery, currentPage);
        } else {
            showToast(data.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Connection error', 'error');
    }
}

// View screenshot
function viewScreenshot(screenshotPath) {
    const modal = document.getElementById('screenshotModal');
    const img = document.getElementById('screenshotImage');
    
    img.src = `${API_BASE}/${screenshotPath}`;
    modal.classList.add('active');
}

// Close modal
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

// Show toast
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

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentStatus = this.dataset.status;
            currentPage = 1;
            loadUsers(currentStatus, searchQuery, currentPage);
        });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = this.value.trim();
            currentPage = 1;
            loadUsers(currentStatus, searchQuery, currentPage);
        }, 500);
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

    // Check URL for status filter
    const urlParams = new URLSearchParams(window.location.search);
    const statusParam = urlParams.get('status');
    if (statusParam) {
        currentStatus = statusParam;
        document.querySelector(`.filter-tab[data-status="${statusParam}"]`)?.classList.add('active');
        document.querySelector('.filter-tab[data-status="all"]')?.classList.remove('active');
    }

    // Load initial data
    loadUsers(currentStatus, searchQuery, currentPage);
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
