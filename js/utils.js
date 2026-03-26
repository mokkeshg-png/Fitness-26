// js/utils.js

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Defaulting to dark for premium feel
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    let targetTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    updateThemeIcon(targetTheme);
    
    // Dispatch custom event for charts to redraw
    window.dispatchEvent(new Event('themeChanged'));
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('themeToggle');
    if(themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }
}

// Notifications
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    
    let icon = 'fa-info-circle';
    if(type === 'success') icon = 'fa-check-circle';
    if(type === 'error') icon = 'fa-circle-exclamation';

    notif.innerHTML = `
        <div class="notification-content">
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
    `;
    container.appendChild(notif);
    
    setTimeout(() => {
        if(notif.parentElement) {
            notif.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notif.remove(), 300);
        }
    }, 4000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
    `;
    document.body.appendChild(container);

    const style = document.createElement('style');
    style.innerHTML = `
        .notification {
            background: var(--surface);
            border-left: 4px solid var(--primary);
            padding: 16px 20px;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 320px;
            gap: 20px;
            animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            color: var(--text-dark);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(10px);
        }
        .notification.error { border-left-color: var(--danger); }
        .notification.success { border-left-color: var(--success); }
        .notification.warning { border-left-color: var(--warning); }
        
        .notification i { font-size: 1.25rem; }
        .notification.error i { color: var(--danger); }
        .notification.success i { color: var(--success); }
        .notification.warning i { color: var(--warning); }
        
        .notification-content { display: flex; align-items: center; gap: 12px; font-weight: 500; }
        .notification button { 
            background: none; 
            border: none; 
            color: var(--text-light); 
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
        }
        .notification button:hover { background: var(--bg-color); color: var(--text-dark); }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    return container;
}

// Generate an ID for mock db
function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Global Init
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const themeToggleBtn = document.getElementById('themeToggle');
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
});
