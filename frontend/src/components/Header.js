import React, { useState } from 'react';
import './Header.css';

function Header({ currentPage, setCurrentPage, cartCount, user, onLogout }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

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
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(user) => {
            setShowAuthModal(false);
          }}
        />
      )}
    </header>
  );
}

function AuthModal({ isLogin, setIsLogin, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Логин
        const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        });

        if (!response.ok) {
          throw new Error('Ошибка входа. Проверьте данные.');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({
          email,
          id: data.user_id,
        }));

        window.location.reload();
      } else {
        // Регистрация
        const response = await fetch('http://localhost:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка регистрации.');
        }

        setIsLogin(true);
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!isLogin && (
            <input
              type="text"
              placeholder="ФИО"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <p className="toggle-auth">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-btn"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Header;
