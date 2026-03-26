// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Login Form logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = document.getElementById('loginBtn');
            
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging in...';
            btn.disabled = true;

            try {
                await api.login(email, password);
                showNotification('Login successful!', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 800);
            } catch (error) {
                showNotification(error.message, 'error');
                btn.innerHTML = 'Login <i class="fa-solid fa-arrow-right"></i>';
                btn.disabled = false;
            }
        });
    }

    // Register Form logic
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const height = document.getElementById('height').value;
            const weight = document.getElementById('weight').value;
            const fitnessGoal = document.getElementById('fitnessGoal').value;
            const terms = document.getElementById('terms').checked;

            // Password validation regex
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
            let isValid = true;

            if (!passwordRegex.test(password)) {
                document.getElementById('password').classList.add('error');
                document.getElementById('passwordError').classList.add('show');
                isValid = false;
            } else {
                document.getElementById('password').classList.remove('error');
                document.getElementById('passwordError').classList.remove('show');
            }

            if (password !== confirmPassword) {
                document.getElementById('confirmPassword').classList.add('error');
                document.getElementById('confirmError').classList.add('show');
                isValid = false;
            } else {
                document.getElementById('confirmPassword').classList.remove('error');
                document.getElementById('confirmError').classList.remove('show');
            }

            const parsedHeight = parseFloat(height);
            const parsedWeight = parseFloat(weight);

            if (!parsedHeight || parsedHeight <= 0 || !parsedWeight || parsedWeight <= 0) {
                showNotification('Please enter valid positive numbers for height and weight.', 'error');
                isValid = false;
            }

            if (!isValid) return;

            const btn = document.getElementById('registerBtn');
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating...';
            btn.disabled = true;

            try {
                await api.register({
                    fullName,
                    email,
                    password,
                    height: parseFloat(height),
                    weight: parseFloat(weight),
                    fitnessGoal
                });
                
                showNotification('Account created successfully!', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 800);
            } catch (error) {
                showNotification(error.message, 'error');
                btn.innerHTML = 'Create Account <i class="fa-solid fa-user-plus"></i>';
                btn.disabled = false;
            }
        });
    }
});
