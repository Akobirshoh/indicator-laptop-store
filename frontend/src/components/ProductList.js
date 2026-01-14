import React, { useState, useEffect } from 'react';
import './ProductList.css';
import { getItems, getCategories, addToCart } from '../api';

function ProductList({ onAddToCart, user, setUser }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('name');
  const [addedNotification, setAddedNotification] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        getItems(),
        getCategories(),
      ]);

      setProducts(itemsRes.data || getMockProducts());
      setCategories(categoriesRes.data || getMockCategories());
    } catch (err) {
      console.error('API Error:', err);
      setProducts(getMockProducts());
      setCategories(getMockCategories());
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      
      // Всегда добавляем в локальную корзину
      onAddToCart(product);
      
      // Если пользователь авторизован, добавляем на сервер
      if (user) {
        try {
          await addToCart(product.id, 1);
        } catch (err) {
          console.warn('Cannot add to server cart, saved to local cart');
        }
      }
      
      setAddedNotification(product.name);
      setTimeout(() => setAddedNotification(null), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAddedNotification('❌ Ошибка добавления в корзину');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="product-list-container">
      <div className="page-header">
        <h1 className="page-title">🎯 Каталог товаров</h1>
        <p className="page-subtitle">Выберите идеальный товар из нашей коллекции</p>
      </div>

      {/* Уведомление о добавлении */}
      {addedNotification && (
        <div className="notification success">
          ✅ {addedNotification} добавлен в корзину!
        </div>
      )}

      {/* Панель фильтрации */}
      <div className="filter-panel">
        <div className="filter-group search-box">
          <input
            type="text"
            placeholder="🔍 Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group sort-box">
          <label>Сортировка:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="name">По названию</option>
            <option value="price-low">Цена: дешевле</option>
            <option value="price-high">Цена: дороже</option>
          </select>
        </div>

        <div className="filter-group price-range">
          <label>Цена: ${priceRange[0]} - ${priceRange[1]}</label>
          <div className="price-inputs">
            <input
              type="number"
              min="0"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="price-input"
            />
            <span>-</span>
            <input
              type="number"
              max="10000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
              className="price-input"
            />
          </div>
        </div>
      </div>

      {/* Категории */}
      <div className="categories-filter">
        <button
          className={`category-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          Все товары ({products.length})
        </button>
        {categories.map(cat => {
          const count = products.filter(p => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Статус загрузки */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>⏳ Загрузка товаров...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Список товаров */}
      <div className="results-info">
        Найдено товаров: <strong>{filteredAndSortedProducts.length}</strong>
      </div>

      <div className="products-grid">
        {filteredAndSortedProducts.length > 0 ? (
          filteredAndSortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              isAdding={addingToCart[product.id]}
            />
          ))
        ) : (
          <div className="no-products">
            <span className="no-products-emoji">🔍</span>
            <h3>Товары не найдены</h3>
            <p>Попробуйте изменить критерии поиска или фильтрации</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, isAdding }) {
  const [showDetails, setShowDetails] = useState(false);

  const getEmoji = () => {
    const name = product.name?.toLowerCase() || '';
    if (name.includes('ноут') || name.includes('laptop') || name.includes('book')) return '💻';
    if (name.includes('мыш') || name.includes('mouse')) return '🖱️';
    if (name.includes('клав') || name.includes('keyboard')) return '⌨️';
    if (name.includes('монит') || name.includes('monitor')) return '🖥️';
    if (name.includes('наушник') || name.includes('headphone')) return '🎧';
    return '📦';
  };

  return (
    <div className="product-card">
      <div className="product-header">
        <div className="product-image">
          <div className="image-emoji">{getEmoji()}</div>
        </div>
        {product.discount && (
          <div className="discount-badge">-{product.discount}%</div>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        {product.specs && (
          <div className="product-specs">
            <p className="specs-text">{product.specs}</p>
          </div>
        )}

        <div className="product-footer">
          <div className="product-price">
            <span className="price">${product.price.toFixed(2)}</span>
          </div>

          <div className="product-actions">
            <button
              className="btn btn-primary"
              onClick={() => onAddToCart(product)}
              title="Добавить в корзину"
              disabled={isAdding}
            >
              {isAdding ? '⏳ Добавл...' : '🛒 Добавить'}
            </button>
            <button
              className={`btn btn-secondary ${showDetails ? 'active' : ''}`}
              onClick={() => setShowDetails(!showDetails)}
              title="Подробная информация"
            >
              {showDetails ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="product-details">
            <div className="details-content">
              <div className="detail-item">
                <span className="detail-label">Артикул:</span>
                <span className="detail-value">#{product.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">В наличии:</span>
                <span className="detail-value">{product.stock || 'Много'} шт.</span>
              </div>
              {product.category_id && (
                <div className="detail-item">
                  <span className="detail-label">Категория:</span>
                  <span className="detail-value">ID: {product.category_id}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Моковые данные для демонстрации
function getMockProducts() {
  return [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      description: 'Мощный ноутбук для профессионалов',
      price: 2499,
      specs: 'Apple M2 Pro, 16GB RAM, 512GB SSD',
      category_id: 1,
      stock: 5,
      discount: 10,
    },
    {
      id: 2,
      name: 'Dell XPS 13',
      description: 'Компактный и быстрый ноутбук',
      price: 1299,
      specs: 'Intel Core i7, 8GB RAM, 512GB SSD',
      category_id: 1,
      stock: 8,
    },
    {
      id: 3,
      name: 'Logitech MX Master 3S',
      description: 'Профессиональная беспроводная мышь',
      price: 99,
      specs: '8K DPI, 8 программируемых кнопок',
      category_id: 2,
      stock: 20,
      discount: 5,
    },
    {
      id: 4,
      name: 'Keychron K8 Pro',
      description: 'Механическая клавиатура с RGB',
      price: 199,
      specs: 'RGB подсветка, Hot-swap, Bluetooth',
      category_id: 3,
      stock: 12,
    },
    {
      id: 5,
      name: 'Lenovo ThinkPad X1',
      description: 'Надежный бизнес-ноутбук',
      price: 1199,
      specs: 'Intel Core i5, 16GB RAM, 256GB SSD',
      category_id: 1,
      stock: 15,
    },
    {
      id: 6,
      name: 'Apple Magic Mouse',
      description: 'Стильная сенсорная мышь',
      price: 79,
      specs: 'Lightning charging, Multi-touch surface',
      category_id: 2,
      stock: 25,
    },
    {
      id: 7,
      name: 'ASUS ROG Gaming Laptop',
      description: 'Мощный игровой ноутбук',
      price: 1899,
      specs: 'RTX 4070, Intel i9, 32GB RAM, 1TB SSD',
      category_id: 1,
      stock: 3,
      discount: 15,
    },
    {
      id: 8,
      name: 'Corsair K95 Platinum',
      description: 'Премиум механическая клавиатура',
      price: 229,
      specs: 'Cherry MX switches, RGB, программируемые макросы',
      category_id: 3,
      stock: 7,
    },
  ];
}

function getMockCategories() {
  return [
    { id: 1, name: '💻 Ноутбуки' },
    { id: 2, name: '🖱️ Мыши' },
    { id: 3, name: '⌨️ Клавиатуры' },
  ];
}

export default ProductList;
