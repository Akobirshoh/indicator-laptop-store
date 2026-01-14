import React, { useState } from 'react';
import { login, register } from '../api';
import './AuthModal.css';

function AuthModal({ onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
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
        const response = await login(email, password);
        const { access_token, user_id } = response.data;

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify({
          email,
          id: user_id,
        }));

        onSuccess({ email, id: user_id });
      } else {
        // Регистрация
        await register(email, password, fullName);

        // Автоматический вход после регистрации
        const loginResponse = await login(email, password);
        const { access_token, user_id } = loginResponse.data;

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify({
          email,
          id: user_id,
        }));

        onSuccess({ email, id: user_id });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <span>&times;</span>
        </button>

        <div className="modal-header">
          <h2 className="modal-title">
            {isLogin ? '🔐 Вход в аккаунт' : '✨ Создать аккаунт'}
          </h2>
          <p className="modal-subtitle">
            {isLogin ? 'Войдите в свой аккаунт' : 'Зарегистрируйтесь для покупок'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Полное имя</label>
              <input
                id="fullName"
                type="text"
                placeholder="Ваше имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Загрузка...
              </>
            ) : (
              isLogin ? '🔓 Войти' : '🎉 Зарегистрироваться'
            )}
          </button>
        </form>

        <div className="modal-footer">
          <p className="toggle-text">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="toggle-mode-button"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
