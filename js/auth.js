// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    // Sign In Handler
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    successMessage.textContent = 'Sign in successful! Redirecting...';
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                    
                    // Store token
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Clear any existing event data for fresh session
                    localStorage.removeItem('attendingEvents');
                    localStorage.removeItem('interestedEvents');
                    
                    // Redirect after 1 second
                    setTimeout(() => {
                        window.location.href = 'user-dashboard.html';
                    }, 1000);
                } else {
                    errorMessage.textContent = data.error || 'Sign in failed';
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                }
            } catch (error) {
                errorMessage.textContent = 'Network error. Please try again.';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            }
        });
    }
    
    // Sign Up Handler
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
                return;
            }
            
            // Validate password strength
            if (password.length < 6) {
                errorMessage.textContent = 'Password must be at least 6 characters';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
                return;
            }
            
            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    successMessage.textContent = 'Account created successfully! Redirecting to sign in...';
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                    
                    // Clear any existing localStorage data for new account
                    localStorage.removeItem('attendingEvents');
                    localStorage.removeItem('interestedEvents');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    // Redirect to signin after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'signin.html';
                    }, 2000);
                } else {
                    errorMessage.textContent = data.error || 'Sign up failed';
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                }
            } catch (error) {
                errorMessage.textContent = 'Network error. Please try again.';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            }
        });
    }
    
    // Check authentication status
    function checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            return JSON.parse(user);
        }
        return null;
    }
    
    // Check if user is admin
    function isAdmin(user) {
        if (!user) return false;
        
        const adminEmails = ['info@alphabots4all.org'];
        const adminUsernames = ['alphabots4all'];
        const adminPasswords = ['alphabots4all123']; // In practice, this would be checked server-side
        
        return adminEmails.includes(user.email) || 
               adminUsernames.includes(user.name) || 
               user.role === 'admin';
    }
    
    // Update UI based on auth status - called immediately and on load
    function updateAuthUI() {
        const user = checkAuth();
        const signinButton = document.querySelector('.btn-signin');
        const navLinks = document.querySelector('.nav-links');
        const adminLink = document.querySelector('a[href*="admin-dashboard"]');
        
        // Show/hide admin link based on user status
        if (adminLink) {
            const adminListItem = adminLink.parentElement;
            if (user && isAdmin(user)) {
                adminListItem.style.display = 'list-item';
                adminListItem.style.opacity = '1';
                adminListItem.style.visibility = 'visible';
            } else {
                adminListItem.style.display = 'none';
                adminListItem.style.opacity = '0';
                adminListItem.style.visibility = 'hidden';
            }
        }
        
        if (user && signinButton) {
            signinButton.textContent = 'Dashboard';
            // Determine correct path based on current location
            const currentPath = window.location.pathname;
            const isInPagesFolder = currentPath.includes('/pages/');
            const dashboardPath = isInPagesFolder ? 'user-dashboard.html' : 'pages/user-dashboard.html';
            signinButton.href = dashboardPath;
            
            // Remove any existing click handlers to allow normal navigation
            signinButton.removeAttribute('data-signout-handler');
            // Clone and replace to remove all event listeners
            const newSigninButton = signinButton.cloneNode(true);
            signinButton.parentNode.replaceChild(newSigninButton, signinButton);
        }
    }
    
    // Run auth UI update on all pages
    updateAuthUI();
});