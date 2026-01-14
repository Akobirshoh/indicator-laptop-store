import React, { useState } from 'react';
import './Header.css';
import AuthModal from './AuthModal';

function Header({ currentPage, setCurrentPage, cartCount, user, onLogout, onLogin }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="2" y="6" width="36" height="24" rx="2" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
            <rect x="5" y="9" width="30" height="16" fill="#e5e7eb"/>
            <line x1="2" y1="32" x2="38" y2="32" stroke="#22c55e" strokeWidth="2"/>
            <circle cx="20" cy="36" r="1.5" fill="#22c55e"/>
          </svg>
          <span className="brand-name">INDICATOR</span>
        </div>

        {/* Навигация */}
        <nav className="nav">
          <button
            className={`nav-btn ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => setCurrentPage('products')}
          >
            📱 Каталог
          </button>
          <button
            className={`nav-btn ${currentPage === 'cart' ? 'active' : ''}`}
            onClick={() => setCurrentPage('cart')}
          >
            🛒 Корзина ({cartCount})
          </button>
        </nav>

        {/* Профиль */}
        <div className="profile">
          {user ? (
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button
                className="profile-btn"
                onClick={() => setCurrentPage('profile')}
                title="Мой профиль"
              >
                👤 Профиль
              </button>
              <button className="logout-btn" onClick={onLogout}>Выход</button>
            </div>
          ) : (
            <button
              className="auth-btn"
              onClick={() => setShowAuthModal(true)}
            >
              Вход / Регистрация
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно аутентификации */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setShowAuthModal(false);
            if (onLogin) onLogin(user);
            else window.location.reload();
          }}
        />
      )}
    </header>
  );
}

export default Header;
