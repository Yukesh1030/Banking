// Authentication System

// Helper to show dynamic toast alerts
function showToast(message, type = 'success') {
    // Remove existing toasts first
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose icon based on type
    const iconSvg = type === 'success' 
        ? `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        : `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;

    toast.innerHTML = `
        ${iconSvg}
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation frame
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// Retrieve users from localStorage
function getUsers() {
    const users = localStorage.getItem('banking_users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('banking_users', JSON.stringify(users));
}

// Check if user session is active
function getSession() {
    const session = sessionStorage.getItem('banking_session');
    return session ? JSON.parse(session) : null;
}

// Check authentication status for dashboard pages
function validateSession(expectedRole) {
    const session = getSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    if (session.role.toLowerCase() !== expectedRole.toLowerCase()) {
        if (session.role.toLowerCase() === 'admin') {
            window.location.href = 'Admin%20Dashboard.html';
        } else {
            window.location.href = 'CustommerDashboard.html';
        }
        return null;
    }
    return session;
}

// Register user
function handleSignup(username, userId, password, acType) {
    const users = getUsers();
    
    // Check if user already exists
    const userExists = users.some(u => u.userId.toLowerCase() === userId.toLowerCase());
    if (userExists) {
        showToast('A user with this User ID / Email already exists.', 'error');
        return false;
    }
    
    // Save new user
    const newUser = { username, userId, password, acType };
    users.push(newUser);
    saveUsers(users);
    
    // Show success overlay modal
    const overlay = document.getElementById('successOverlay');
    if (overlay) {
        overlay.classList.add('active');
        setTimeout(() => {
            overlay.classList.remove('active');
            window.location.href = 'index.html';
        }, 2500);
    } else {
        showToast('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    return true;
}

// Log in user
function handleLogin(userId, password, role, rememberMe) {
    if (!userId || !password) {
        showToast('Please enter both User ID and Password.', 'error');
        return false;
    }

    const users = getUsers();
    
    // 1. Try to find user in localStorage (registered accounts)
    const registeredUser = users.find(u => 
        u.userId.toLowerCase() === userId.toLowerCase() && 
        u.password === password &&
        u.acType.toLowerCase() === role.toLowerCase()
    );
    
    let loggedInUser = null;
    
    if (registeredUser) {
        loggedInUser = {
            username: registeredUser.username,
            userId: registeredUser.userId,
            role: registeredUser.acType
        };
    } else {
        // 2. Dummy login fallback: any user ID and password will pass
        // Display entered name or format a readable name from userId
        let displayUsername = userId.split('@')[0];
        // Capitalize
        displayUsername = displayUsername.charAt(0).toUpperCase() + displayUsername.slice(1);
        
        loggedInUser = {
            username: displayUsername,
            userId: userId,
            role: role // Redirects to selected login role (Admin or Customer)
        };
        
        // Inform user via toast about fallback login
        showToast(`Logged in via demo access as ${role}.`, 'success');
    }
    
    // Save session
    sessionStorage.setItem('banking_session', JSON.stringify(loggedInUser));
    
    // Handle remember me
    if (rememberMe) {
        localStorage.setItem('remembered_banking_user', JSON.stringify({
            userId: userId,
            role: role
        }));
    } else {
        localStorage.removeItem('remembered_banking_user');
    }
    
    // Redirect to dashboard based on role
    setTimeout(() => {
        if (role.toLowerCase() === 'admin') {
            window.location.href = 'Admin%20Dashboard.html';
        } else {
            window.location.href = 'CustommerDashboard.html';
        }
    }, 1000);
    
    return true;
}

// Logout
function handleLogout() {
    sessionStorage.removeItem('banking_session');
    showToast('Logged out successfully. Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
}
