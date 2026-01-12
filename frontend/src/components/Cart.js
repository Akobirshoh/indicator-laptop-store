import React, { useState } from 'react';
import './Cart.css';
import { createOrder } from '../api';

function Cart({ items, onRemove, onUpdateQuantity, onClear, user }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    phone: '',
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      alert('Пожалуйста, войдите перед оформлением заказа');
      return;
    }

    if (!deliveryInfo.address || !deliveryInfo.phone) {
      alert('Пожалуйста, заполните адрес доставки и телефон');
      return;
    }

    setIsCheckingOut(true);
    setOrderStatus('Обработка заказа...');

    try {
      const orderData = {
        items: items.map(item => ({
          item_id: item.id,
          quantity: item.quantity,
        })),
        shipping_address: deliveryInfo.address,
        phone: deliveryInfo.phone,
      };

      const response = await createOrder(orderData);

      setOrderStatus('✅ Заказ успешно оформлен!');
      onClear();
      setDeliveryInfo({ address: '', phone: '' });

      setTimeout(() => {
        alert('Спасибо за покупку! Ваш заказ готов к отправке.');
      }, 1000);
    } catch (error) {
      setOrderStatus('❌ Ошибка при оформлении заказа: ' + error.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="cart-container">
      <h1 className="page-title">🛒 Корзина покупок</h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛍️</div>
          <h2>Корзина пуста</h2>
          <p>Добавьте товары из каталога!</p>
        </div>
      ) : (
        <div className="cart-content">
          {/* Таблица товаров */}
          <div className="cart-items-section">
            <div className="cart-items-table">
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  onUpdateQuantity={onUpdateQuantity}
                />
              ))}
            </div>
          </div>

          {/* Итоги и оформление */}
          <div className="cart-summary-section">
            <div className="cart-summary">
              <h2>Итоги</h2>

              <div className="summary-line">
                <span>Количество товаров:</span>
                <span className="value">{itemCount}</span>
              </div>

              <div className="summary-line">
                <span>Итоговая сумма:</span>
                <span className="value price">${total.toFixed(2)}</span>
              </div>

              <div className="summary-line">
                <span>Доставка:</span>
                <span className="value">$10.00</span>
              </div>

              <div className="summary-line total">
                <span>К оплате:</span>
                <span className="value">${(total + 10).toFixed(2)}</span>
              </div>

              {/* Форма доставки */}
              <div className="delivery-form">
                <h3>Информация о доставке</h3>

                <input
                  type="text"
                  placeholder="Адрес доставки"
                  value={deliveryInfo.address}
                  onChange={(e) =>
                    setDeliveryInfo({ ...deliveryInfo, address: e.target.value })
                  }
                  className="input-field"
                />

                <input
                  type="tel"
                  placeholder="Номер телефона"
                  value={deliveryInfo.phone}
                  onChange={(e) =>
                    setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })
                  }
                  className="input-field"
                />

                {orderStatus && (
                  <div className={`order-status ${orderStatus.includes('✅') ? 'success' : 'error'}`}>
                    {orderStatus}
                  </div>
                )}

                <button
                  className="btn btn-checkout"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !user}
                >
                  {isCheckingOut ? '⏳ Обработка...' : '✅ Оформить заказ'}
                </button>

                <button
                  className="btn btn-clear"
                  onClick={onClear}
                  disabled={isCheckingOut}
                >
                  🗑️ Очистить корзину
                </button>
              </div>

              {!user && (
                <div className="auth-required">
                  ⚠️ Требуется авторизация для оформления заказа
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItem({ item, onRemove, onUpdateQuantity }) {
  return (
    <div className="cart-item">
      <div className="item-image">
        <span className="item-icon">
          {item.name?.includes('Ноут')
            ? '💻'
            : item.name?.includes('Мышь')
            ? '🖱️'
            : item.name?.includes('Клав')
            ? '⌨️'
            : '📦'}
        </span>
      </div>

      <div className="item-details">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
      </div>

      <div className="item-price">
        <span className="unit-price">${item.price}</span>
      </div>

      <div className="item-quantity">
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          −
        </button>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
          className="qty-input"
        />
        <button
          className="qty-btn"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div className="item-total">
        <span className="total-price">${(item.price * item.quantity).toFixed(2)}</span>
      </div>

      <button
        className="btn-remove"
        onClick={() => onRemove(item.id)}
        title="Удалить из корзины"
      >
        ✕
      </button>
    </div>
  );
}

export default Cart;
