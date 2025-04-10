// Authentication service
const AuthService = {
    // Email/password login
    async login(email, password) {
        try {
            // Show loading state
            document.getElementById('loginBtn').disabled = true;
            document.getElementById('loginBtn').innerHTML = 'Signing in...';
            
            // Debug log
            console.log('Login attempt with:', { email, password });
            
            // Call backend API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: email.trim(), 
                    password: password.trim() 
                })
            });

            console.log('Response status:', response.status);

            let data;
            try {
                data = await response.json();
            } catch (error) {
                throw new Error('Invalid server response');
            }
            
            if (!response.ok) {
                throw new Error(data?.message || 'Login failed');
            }
            
            // Store user data
            localStorage.setItem('resuwise_user', JSON.stringify(data.user));
            localStorage.setItem('resuwise_token', data.token);
            
            // Redirect to builder
            window.location.href = 'builder.html';
            
        } catch (error) {
            // Show error message
            const errorEl = document.getElementById('loginError');
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
            
            // Reset button
            document.getElementById('loginBtn').disabled = false;
            document.getElementById('loginBtn').innerHTML = 'Sign in';
        }
    },

    // Initialize auth
    init() {
        console.log('AuthService.init() called');
        
        // Setup login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('Found login form, adding submit handler');
            loginForm.addEventListener('submit', (e) => {
                console.log('Form submit triggered');
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                console.log('Form values:', {email, password});
                this.login(email, password);
            });
        } else {
            console.error('Login form not found!');
        }
        
        // Setup OAuth providers
        this.initGoogleAuth();
        this.initLinkedInAuth();
    },

    // Google OAuth
    initGoogleAuth() {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    },

    // LinkedIn OAuth
    initLinkedInAuth() {
        const script = document.createElement('script');
        script.src = 'https://platform.linkedin.com/in.js';
        script.text = `api_key: [YOUR_LINKEDIN_API_KEY]\nauthorize: true`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    },

    // Handle Google auth callback
    handleGoogleAuth(credential) {
        // Verify credential with backend
        fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            localStorage.setItem('resuwise_user', JSON.stringify(data.user));
            localStorage.setItem('resuwise_token', data.token);
            window.location.href = 'builder.html';
        })
        .catch(error => {
            console.error('Google auth failed:', error);
            alert('Google login failed');
        });
    },

    // Handle LinkedIn auth callback
    handleLinkedInAuth() {
        window.IN.User.authorize(() => {
            window.IN.API.Raw("/people/~:(id,first-name,last-name,email-address)?format=json")
                .result(profile => {
                    fetch('/api/auth/linkedin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ profile })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) throw new Error(data.error);
                        
                        localStorage.setItem('resuwise_user', JSON.stringify(data.user));
                        localStorage.setItem('resuwise_token', data.token);
                        window.location.href = 'builder.html';
                    })
                    .catch(error => {
                        console.error('LinkedIn auth failed:', error);
                        alert('LinkedIn login failed');
                    });
                });
        });
    }
};

// Initialize auth when DOM is loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // DOM already loaded, initialize immediately
    AuthService.init();
} else {
    // Wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        AuthService.init();
    });
}

// Also expose AuthService globally for debugging
window.AuthService = AuthService;
