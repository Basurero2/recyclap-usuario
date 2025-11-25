// ===== State Management =====
const AppState = {
    user: null,
    points: 0,
    history: [],
    rewards: [
        {
            id: 1,
            title: '20% Descuento Cine',
            description: 'Válido para cualquier función en Cinemark',
            category: 'Entretenimiento',
            points: 150,
            icon: 'film'
        },
        {
            id: 2,
            title: 'Café Gratis',
            description: 'Un café grande en Starbucks',
            category: 'Comida',
            points: 100,
            icon: 'coffee'
        },
        {
            id: 3,
            title: '15% Descuento Restaurante',
            description: 'Descuento en restaurantes participantes',
            category: 'Comida',
            points: 200,
            icon: 'utensils'
        },
        {
            id: 4,
            title: 'Entrada Gratis Museo',
            description: 'Entrada para el Museo de Arte',
            category: 'Cultura',
            points: 120,
            icon: 'landmark'
        },
        {
            id: 5,
            title: '10% Descuento Tienda',
            description: 'Descuento en tiendas de ropa',
            category: 'Compras',
            points: 80,
            icon: 'shopping-bag'
        },
        {
            id: 6,
            title: 'Clase de Yoga Gratis',
            description: 'Una sesión gratis en YogaFit',
            category: 'Deporte',
            points: 90,
            icon: 'heart'
        }
    ],
    stats: {
        totalEarned: 0,
        bottlesRecycled: 0
    }
};

// ===== Initialize & Auth Check =====
function checkAuth() {
    const currentUser = localStorage.getItem('ecopoints_current_user');

    if (!currentUser) {
        window.location.href = 'index.html';
        return false;
    }

    const user = JSON.parse(currentUser);
    const users = JSON.parse(localStorage.getItem('ecopoints_users') || '[]');
    const fullUser = users.find(u => u.id === user.id);

    if (fullUser) {
        AppState.user = fullUser;
        AppState.points = fullUser.points || 0;
        AppState.history = fullUser.history || [];
        AppState.stats = fullUser.stats || { totalEarned: 0, bottlesRecycled: 0 };
        return true;
    }

    window.location.href = 'index.html';
    return false;
}

function handleLogout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        saveUserData();
        localStorage.removeItem('ecopoints_current_user');
        window.location.href = 'index.html';
    }
}

function saveUserData() {
    if (!AppState.user) return;

    const users = JSON.parse(localStorage.getItem('ecopoints_users') || '[]');
    const userIndex = users.findIndex(u => u.id === AppState.user.id);

    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            points: AppState.points,
            history: AppState.history,
            stats: AppState.stats
        };
        localStorage.setItem('ecopoints_users', JSON.stringify(users));
    }
}

// ===== Navigation =====
function showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    document.getElementById(`${viewName}-view`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const navItems = document.querySelectorAll('.nav-item');
    if (viewName === 'dashboard') navItems[0].classList.add('active');
    else if (viewName === 'scanner') navItems[1].classList.add('active');
    else if (viewName === 'rewards') navItems[2].classList.add('active');
    else if (viewName === 'history') navItems[3].classList.add('active');
}

// ===== Dashboard Functions =====
function updateDashboard() {
    document.getElementById('points-display').textContent = AppState.points;
    document.getElementById('user-name').textContent = AppState.user?.name || 'Usuario';
    document.getElementById('total-earned').textContent = AppState.stats.totalEarned;
    document.getElementById('bottles-recycled').textContent = AppState.stats.bottlesRecycled;

    // Update rewards points banner
    const rewardsPointsDisplay = document.getElementById('rewards-points-display');
    if (rewardsPointsDisplay) {
        rewardsPointsDisplay.textContent = AppState.points;
    }
}

// ===== Scanner Functions =====
function simulateScan() {
    const button = document.querySelector('.btn-simulate');
    button.disabled = true;
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Escaneando...';

    setTimeout(() => {
        const pointsEarned = Math.floor(Math.random() * 20) + 10;

        AppState.points += pointsEarned;
        AppState.stats.totalEarned += pointsEarned;
        AppState.stats.bottlesRecycled += 1;

        const transaction = {
            id: Date.now(),
            type: 'earn',
            points: pointsEarned,
            description: 'Botella reciclada',
            date: new Date().toISOString()
        };

        AppState.history.unshift(transaction);

        saveUserData();
        updateDashboard();
        renderHistory();

        showToast(`¡Ganaste ${pointsEarned} EcoPoints!`, 'success');

        button.disabled = false;
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Escanear QR';
    }, 2000);
}

// ===== Rewards Functions =====
function renderRewards() {
    const grid = document.getElementById('rewards-grid');
    grid.innerHTML = '';

    AppState.rewards.forEach(reward => {
        const card = createRewardCard(reward);
        grid.appendChild(card);
    });
}

function createRewardCard(reward) {
    const card = document.createElement('div');
    card.className = 'reward-card';

    const canAfford = AppState.points >= reward.points;

    card.innerHTML = `
        <div class="reward-image" style="background: ${getGradientForCategory(reward.category)}">
            ${getIconSVG(reward.icon)}
        </div>
        <div class="reward-content">
            <div class="reward-header">
                <h3 class="reward-title">${reward.title}</h3>
                <div class="reward-points">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    ${reward.points}
                </div>
            </div>
            <p class="reward-description">${reward.description}</p>
            <div class="reward-footer">
                <span class="reward-category">${reward.category}</span>
                <button class="btn-redeem" ${!canAfford ? 'disabled' : ''} onclick="redeemReward(${reward.id})">
                    ${canAfford ? 'Canjear' : 'Insuficiente'}
                </button>
            </div>
        </div>
    `;

    return card;
}

function getGradientForCategory(category) {
    const gradients = {
        'Entretenimiento': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Comida': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'Cultura': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'Compras': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'Deporte': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function getIconSVG(iconName) {
    const icons = {
        'film': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
        'coffee': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
        'utensils': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
        'landmark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
        'shopping-bag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
        'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    };
    return icons[iconName] || icons['heart'];
}

function redeemReward(rewardId) {
    const reward = AppState.rewards.find(r => r.id === rewardId);

    if (!reward) return;

    if (AppState.points < reward.points) {
        showToast('No tienes suficientes puntos', 'error');
        return;
    }

    if (confirm(`¿Canjear ${reward.title} por ${reward.points} puntos?`)) {
        AppState.points -= reward.points;

        const transaction = {
            id: Date.now(),
            type: 'redeem',
            points: reward.points,
            description: reward.title,
            date: new Date().toISOString()
        };

        AppState.history.unshift(transaction);

        saveUserData();
        updateDashboard();
        renderRewards();
        renderHistory();

        showToast(`¡Canjeaste ${reward.title}!`, 'success');
    }
}

// ===== History Functions =====
function renderHistory() {
    const list = document.getElementById('history-list');

    if (AppState.history.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>No hay actividad aún</p>
            </div>
        `;
        return;
    }

    list.innerHTML = '';

    AppState.history.forEach(item => {
        const historyItem = createHistoryItem(item);
        list.appendChild(historyItem);
    });
}

function createHistoryItem(item) {
    const div = document.createElement('div');
    div.className = 'history-item';

    const isEarn = item.type === 'earn';
    const icon = isEarn ?
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' :
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>';

    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="history-icon ${isEarn ? 'earn' : 'redeem'}">
            ${icon}
        </div>
        <div class="history-details">
            <div class="history-title">${item.description}</div>
            <div class="history-date">${formattedDate}</div>
        </div>
        <div class="history-points ${isEarn ? 'positive' : 'negative'}">
            ${isEarn ? '+' : '-'}${item.points}
        </div>
    `;

    return div;
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

// ===== Initialize App =====
window.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        updateDashboard();
        renderRewards();
        renderHistory();
    }
});

window.addEventListener('beforeunload', () => {
    saveUserData();
});

