import React, { useEffect, useState } from 'react';
import { getProducts } from '../api';
import { Package, Search, MapPin, Phone, Tag } from 'lucide-react';

// ✅ Definisikan tipe produk
interface Product {
  name: string;
  category: string;
  price: number;
  description: string;
  seller: string;
  phone?: string;
  image?: string;
}

const Produk = () => {
  const [products, setProducts] = useState<Product[]>([]); // ✅ state bertipe
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data: Product[]) => setProducts(data)) // ✅ parameter bertipe
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['semua', ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.seller?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'semua' || p.category === category;
    return matchSearch && matchCategory;
  });

  const formatPrice = (price: number) => {
    return `Rp ${price?.toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Package size={32} />
        <p>Memuat produk...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Produk Warga</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Jelajahi produk & jualan warga Graha Harmony 5
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Cari produk atau penjual..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem 0.6rem 2.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Filter Kategori */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              border: category === cat ? '2px solid #f97316' : '1px solid var(--border)',
              background: category === cat ? '#f9731620' : 'transparent',
              color: category === cat ? '#f97316' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'capitalize',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Produk */}
      {filteredProducts.length > 0 ? (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredProducts.map((product, idx) => (
            <div key={idx} className="card" style={{ cursor: 'pointer', overflow: 'hidden' }}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    marginBottom: '0.75rem',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f9731640, #f9731620)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Package size={56} color="#f97316" />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                <Tag size={14} color="#f97316" />
                <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 600, textTransform: 'capitalize' }}>
                  {product.category}
                </span>
              </div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>{product.name}</h3>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>
                {formatPrice(product.price)}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.75rem 0' }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} /> {product.seller}
                </span>
                {product.phone && (
                  <a
                    href={`https://wa.me/${product.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: '#10b981',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <Phone size={14} /> Hubungi
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Belum ada produk yang dijual. Ayo mulai berjualan!</p>
        </div>
      )}
    </div>
  );
};

export default Produk;