import React, { useState, useEffect } from 'react';
import './ProductList.css';
import { getItems, getCategories } from '../api';

function ProductList({ onAddToCart, user, setUser }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

      setProducts(itemsRes.data);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError('Ошибка загрузки товаров: ' + err.message);
      // Используем моковые данные при ошибке
      setProducts(getMockProducts());
      setCategories(getMockCategories());
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    onAddToCart(product);
    alert(`${product.name} добавлен в корзину!`);
  };

  return (
    <div className="product-list-container">
      <h1 className="page-title">🎯 Каталог ноутбуков и аксессуаров</h1>

      {/* Панель фильтрации */}
      <div className="filter-panel">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          <button
            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            Все товары
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Статус загрузки */}
      {loading && <div className="loading">⏳ Загрузка товаров...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Список товаров */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))
        ) : (
          <div className="no-products">
            {searchQuery || selectedCategory
              ? 'Товары не найдены'
              : 'Товаров нет'}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="product-card">
      <div className="product-image">
        <div className="image-placeholder">
          {product.name?.includes('Ноут')
            ? '💻'
            : product.name?.includes('Мышь')
            ? '🖱️'
            : product.name?.includes('Клав')
            ? '⌨️'
            : '📦'}
        </div>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-specs">
          {product.specs && (
            <p className="specs-text">{product.specs}</p>
          )}
        </div>

        <div className="product-price">
          <span className="price">${product.price}</span>
          {product.discount && (
            <span className="discount-badge">{product.discount}% скидка</span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="btn btn-primary"
            onClick={() => onAddToCart(product)}
          >
            🛒 В корзину
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '✕ Скрыть' : '👁️ Подробно'}
          </button>
        </div>

        {showDetails && (
          <div className="product-details">
            <h4>Информация о товаре:</h4>
            <ul>
              <li><strong>ID:</strong> {product.id}</li>
              <li><strong>Цена:</strong> ${product.price}</li>
              <li><strong>В наличии:</strong> {product.stock || 'Много'}</li>
              {product.category_id && (
                <li><strong>Категория:</strong> {product.category_id}</li>
              )}
            </ul>
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
    },
    {
      id: 4,
      name: 'Keychron K8 Pro',
      description: 'Механическая клавиатура',
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
