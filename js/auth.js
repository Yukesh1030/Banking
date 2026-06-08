// Authentication System

// Helper to show dynamic toast alerts
function showToast(message, type = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Find active form in the document
    const activeForm = document.querySelector('form');
    if (!activeForm) return;

    // Remove any existing inline feedback in this form
    const existingFeedback = activeForm.querySelector('.inline-feedback');
    if (existingFeedback) existingFeedback.remove();

    // Create inline feedback banner
    const feedback = document.createElement('div');
    feedback.className = `inline-feedback ${type}`;
    feedback.style.padding = '12px 16px';
    feedback.style.borderRadius = '8px';
    feedback.style.marginBottom = '20px';
    feedback.style.fontSize = '14px';
    feedback.style.fontWeight = '500';
    feedback.style.animation = 'fadeIn 0.3s ease';

    if (type === 'success') {
        feedback.style.background = '#ecfdf5';
        feedback.style.color = '#10b981';
        feedback.style.border = '1px solid rgba(16, 185, 129, 0.2)';
    } else {
        feedback.style.background = '#fef2f2';
        feedback.style.color = '#ef4444';
        feedback.style.border = '1px solid rgba(239, 68, 68, 0.2)';
    }

    feedback.textContent = message;

    // Insert at the top of the form
    activeForm.insertBefore(feedback, activeForm.firstChild);

    // Auto remove success feedback after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
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
    
    // Redirect immediately to login page
    window.location.href = 'index.html';
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
