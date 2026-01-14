import React, { useState } from 'react';
import './Cart.css';
import { createOrder, removeFromCart } from '../api';

function Cart({ items, onRemove, onUpdateQuantity, onClear, user }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [isRemoving, setIsRemoving] = useState({});
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    phone: '',
    email: user?.email || '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = items.length > 0 ? 10 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (!user) {
      setOrderStatus('⚠️ Требуется авторизация для оформления заказа');
      setStatusType('error');
      return;
    }

    if (!deliveryInfo.address || !deliveryInfo.phone) {
      setOrderStatus('⚠️ Заполните адрес доставки и телефон');
      setStatusType('error');
      return;
    }

    if (items.length === 0) {
      setOrderStatus('⚠️ Корзина пуста');
      setStatusType('error');
      return;
    }

    setIsCheckingOut(true);
    setOrderStatus('⏳ Обработка заказа...');
    setStatusType('loading');

    try {
      const orderData = {
        items: items.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_price: total,
        delivery_address: deliveryInfo.address,
        delivery_phone: deliveryInfo.phone,
        status: 'pending'
      };

      const response = await createOrder(orderData);
      
      if (response.status === 200 || response.status === 201) {
        setOrderStatus('✅ Заказ успешно оформлен! Спасибо за покупку!');
        setStatusType('success');
        
        onClear();
        setDeliveryInfo({ address: '', phone: '', email: user?.email || '' });

        setTimeout(() => {
          setOrderStatus('');
        }, 3000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Ошибка при оформлении заказа';
      setOrderStatus('❌ ' + errorMsg);
      setStatusType('error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [itemId]: true }));
      
      // Попытка удалить с сервера (если авторизован)
      if (user) {
        try {
          await removeFromCart(itemId);
        } catch (err) {
          console.warn('Cannot remove from server cart, removing from local cart');
        }
      }
      
      // Всегда удаляем из локальной корзины
      onRemove(itemId);
    } finally {
      setIsRemoving(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <div className="cart-container">
      <div className="page-header">
        <h1 className="page-title">🛒 Корзина покупок</h1>
        {items.length > 0 && (
          <p className="cart-subtitle">Всего товаров: {itemCount}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛍️</div>
          <h2>Корзина пуста</h2>
          <p>Добавьте товары из каталога, чтобы начать покупки</p>
          <a href="/" className="btn btn-primary" style={{textDecoration: 'none', display: 'inline-block'}}>
            ← Вернуться в каталог
          </a>
        </div>
      ) : (
        <div className="cart-wrapper">
          {/* Товары в корзине */}
          <div className="cart-items-section">
            <h2 className="section-title">Товары в корзине</h2>
            <div className="cart-items-list">
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={onUpdateQuantity}
                  isRemoving={isRemoving[item.id]}
                />
              ))}
            </div>
          </div>

          {/* Итоги и оформление */}
          <div className="cart-summary-section">
            <div className="cart-summary">
              <h2>Сумма заказа</h2>

              <div className="summary-items">
                <div className="summary-line">
                  <span>Товары ({itemCount}):</span>
                  <span className="value">${subtotal.toFixed(2)}</span>
                </div>

                <div className="summary-line">
                  <span>Налог (10%):</span>
                  <span className="value">${tax.toFixed(2)}</span>
                </div>

                <div className="summary-line">
                  <span>Доставка:</span>
                  <span className="value">${shipping.toFixed(2)}</span>
                </div>

                <div className="summary-line total-line">
                  <span>Итого:</span>
                  <span className="value">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Форма доставки */}
              <div className="delivery-form">
                <h3>📦 Информация о доставке</h3>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={user?.email || ''}
                    disabled
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Адрес доставки</label>
                  <input
                    type="text"
                    placeholder="ул. Примерная, д. 123, кв. 45"
                    value={deliveryInfo.address}
                    onChange={(e) =>
                      setDeliveryInfo({ ...deliveryInfo, address: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Номер телефона</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={deliveryInfo.phone}
                    onChange={(e) =>
                      setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                {orderStatus && (
                  <div className={`order-status ${statusType}`}>
                    {orderStatus}
                  </div>
                )}

                <button
                  className="btn btn-checkout"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !user}
                >
                  {isCheckingOut ? (
                    <>
                      <span className="spinner-small"></span>
                      Обработка...
                    </>
                  ) : (
                    '✅ Оформить заказ'
                  )}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={onClear}
                  disabled={isCheckingOut}
                >
                  🗑️ Очистить корзину
                </button>

                {!user && (
                  <div className="auth-warning">
                    <span>⚠️</span>
                    <div>
                      <strong>Требуется вход в аккаунт</strong>
                      <p>Пожалуйста, авторизуйтесь для оформления заказа</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItem({ item, onRemove, onUpdateQuantity, isRemoving }) {
  const getEmoji = () => {
    const name = item.name?.toLowerCase() || '';
    if (name.includes('ноут') || name.includes('laptop') || name.includes('book')) return '💻';
    if (name.includes('мыш') || name.includes('mouse')) return '🖱️';
    if (name.includes('клав') || name.includes('keyboard')) return '⌨️';
    if (name.includes('монит') || name.includes('monitor')) return '🖥️';
    return '📦';
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="item-image">
        <span className="item-emoji">{getEmoji()}</span>
      </div>

      <div className="item-details">
        <h4 className="item-name">{item.name}</h4>
        {item.description && (
          <p className="item-description">{item.description}</p>
        )}
      </div>

      <div className="item-price">
        <span className="label">Цена:</span>
        <span className="value">${item.price.toFixed(2)}</span>
      </div>

      <div className="item-quantity">
        <button
          className="qty-btn minus"
          onClick={() => {
            if (item.quantity > 1) {
              onUpdateQuantity(item.id, item.quantity - 1);
            }
          }}
          disabled={item.quantity <= 1}
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max="99"
          value={item.quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val > 0) onUpdateQuantity(item.id, val);
          }}
          className="qty-input"
        />
        <button
          className="qty-btn plus"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div className="item-total">
        <span className="label">Итого:</span>
        <span className="value">${itemTotal.toFixed(2)}</span>
      </div>

      <button
        className="btn-remove"
        onClick={() => handleRemoveItem(item.id)}
        title="Удалить из корзины"
        disabled={isRemoving[item.id]}
      >
        {isRemoving[item.id] ? '⏳' : '🗑️'}
      </button>
    </div>
  );
}

export default Cart;
