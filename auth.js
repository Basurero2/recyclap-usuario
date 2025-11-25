// ===== Auth Functions =====
function switchToRegister(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

function switchToLogin(e) {
    e.preventDefault();
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (email && password) {
        const users = JSON.parse(localStorage.getItem('ecopoints_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('ecopoints_current_user', JSON.stringify(user));
            showToast('¡Bienvenido de nuevo!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showToast('Credenciales incorrectas', 'error');
        }
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (name && email && password) {
        const users = JSON.parse(localStorage.getItem('ecopoints_users') || '[]');
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            showToast('El correo ya está registrado', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            points: 0,
            history: [],
            stats: {
                totalEarned: 0,
                bottlesRecycled: 0
            }
        };

        users.push(newUser);
        localStorage.setItem('ecopoints_users', JSON.stringify(users));
        localStorage.setItem('ecopoints_current_user', JSON.stringify(newUser));

        showToast('Cuenta creada exitosamente', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
