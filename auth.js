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
                    
                    // Redirect after 1 second
                    setTimeout(() => {
                        window.location.href = '../index.html';
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
    
    // Update UI based on auth status
    function updateAuthUI() {
        const user = checkAuth();
        const signinButton = document.querySelector('.btn-signin');
        const navLinks = document.querySelector('.nav-links');
        
        if (user && signinButton) {
            signinButton.textContent = user.name || user.email;
            signinButton.href = '#profile';
            
            // Admin button is already in the static navigation, no need to add dynamically
            
            // Add sign out option (only if not already added)
            if (!signinButton.hasAttribute('data-signout-handler')) {
                signinButton.setAttribute('data-signout-handler', 'true');
                signinButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (confirm('Do you want to sign out?')) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.reload();
                    }
                });
            }
        }
    }
    
    // Run auth UI update on all pages
    updateAuthUI();
});