import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Profile from './components/Profile';

function App() {
  const [currentPage, setCurrentPage] = useState('products');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // Загружаем корзину и пользователя из локального хранилища
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Сохраняем корзину в локальное хранилище
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentPage('products');
  };

  return (
    <div className="App">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartCount={cart.length}
        user={user}
        onLogout={handleLogout}
        onLogin={setUser}
      />

      <main className="main-content">
        {currentPage === 'products' && (
          <ProductList onAddToCart={addToCart} user={user} setUser={setUser} />
        )}
        {currentPage === 'cart' && (
          <Cart
            items={cart}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onClear={clearCart}
            user={user}
          />
        )}
        {currentPage === 'profile' && (
          <Profile user={user} onLogout={handleLogout} setCurrentPage={setCurrentPage} />
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2025 INDICATOR - Магазин ноутбуков. Все права защищены.</p>
      </footer>
    </div>
  );
}

export default App;
