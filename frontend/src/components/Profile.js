import React, { useState, useEffect } from 'react';
import './Profile.css';
import { getOrders } from '../api';

function Profile({ user, onLogout, setCurrentPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      setOrders(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="no-auth">
          <span className="icon">🔒</span>
          <h2>Требуется авторизация</h2>
          <p>Пожалуйста, войдите в свой аккаунт для доступа к профилю</p>
          <button className="btn btn-primary" onClick={() => setCurrentPage('products')}>
            ← Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <h1>Мой профиль</h1>
          <p className="user-email">{user.email}</p>
        </div>
        <button className="btn btn-logout" onClick={onLogout}>
          Выход
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Информация
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Мои заказы ({orders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Настройки
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'info' && <ProfileInfo user={user} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} loading={loading} />}
        {activeTab === 'settings' && <SettingsTab user={user} />}
      </div>
    </div>
  );
}

function ProfileInfo({ user }) {
  return (
    <div className="tab-content">
      <div className="info-card">
        <h3>👤 Основная информация</h3>
        <div className="info-item">
          <label>Email:</label>
          <span>{user.email}</span>
        </div>
        <div className="info-item">
          <label>ID пользователя:</label>
          <span>#{user.id}</span>
        </div>
        <div className="info-item">
          <label>Статус:</label>
          <span className="status-badge">Активный пользователь ✓</span>
        </div>
      </div>

      <div className="info-card">
        <h3>📊 Статистика</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">42</span>
            <span className="stat-label">Заказов</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">$2,450</span>
            <span className="stat-label">Сумма покупок</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">15</span>
            <span className="stat-label">Товаров куплено</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">⭐ 4.8</span>
            <span className="stat-label">Рейтинг</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ orders, loading }) {
  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading">Загрузка заказов...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="tab-content">
        <div className="empty-state">
          <span className="icon">📦</span>
          <h3>Нет заказов</h3>
          <p>У вас пока нет заказов. Начните покупать!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="orders-list">
        {orders.map((order, idx) => (
          <div key={idx} className="order-card">
            <div className="order-header">
              <div className="order-id">
                <span className="label">Заказ №</span>
                <span className="value">{order.id || idx + 1}</span>
              </div>
              <div className="order-status">
                <span className={`status-badge status-${order.status || 'completed'}`}>
                  {order.status === 'pending' ? '⏳ Обработка' : '✓ Завершен'}
                </span>
              </div>
            </div>
            <div className="order-details">
              <div className="detail">
                <span className="label">Дата:</span>
                <span className="value">{order.date || new Date().toLocaleDateString()}</span>
              </div>
              <div className="detail">
                <span className="label">Сумма:</span>
                <span className="value">${order.total || '0.00'}</span>
              </div>
              <div className="detail">
                <span className="label">Товаров:</span>
                <span className="value">{order.items_count || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ user }) {
  const [notifications, setNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <div className="tab-content">
      <div className="settings-card">
        <h3>🔔 Уведомления</h3>
        <div className="setting-item">
          <div className="setting-label">
            <span className="title">Email уведомления</span>
            <span className="description">Получайте обновления о заказах</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span className="title">Подписка на новости</span>
            <span className="description">Узнавайте о скидках и новых товарах</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-card">
        <h3>🔐 Безопасность</h3>
        <button className="btn btn-secondary">
          Изменить пароль
        </button>
        <p className="security-note">
          ℹ️ Последний вход: сегодня, 14:23
        </p>
      </div>

      <div className="settings-card danger">
        <h3>⚠️ Опасная зона</h3>
        <button className="btn btn-danger">
          Удалить аккаунт
        </button>
        <p className="danger-note">
          ⚠️ Это действие необратимо. Все ваши данные будут удалены.
        </p>
      </div>
    </div>
  );
}

export default Profile;
