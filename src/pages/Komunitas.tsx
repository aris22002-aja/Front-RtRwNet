import React, { useEffect, useState } from 'react';
import { komunitasApi } from '../api';
import {
  HeartHandshake,
  Search,
  Users,
  MapPin,
  Plus,
  Trash2,
  ArrowRight,
} from 'lucide-react';

const Komunitas = () => {
  const [communities, setCommunities] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'lainnya',
    memberCount: 0,
    location: 'GH5',
  });

  const categoryColors: Record<string, string> = {
    olahraga: '#10b981',
    seni: '#ec4899',
    sosial: '#f59e0b',
    keagamaan: '#8b5cf6',
    pendidikan: '#0ea5e9',
    lainnya: '#6b7280',
  };

  const fetchData = () => {
    komunitasApi
      .getAll()
      .then((data) => setCommunities(data))
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await komunitasApi.create(form);
      setForm({
        name: '',
        description: '',
        category: 'lainnya',
        memberCount: 0,
        location: 'GH5',
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleHapus = async (id: number, name: string) => {
    if (confirm(`Yakin ingin menghapus komunitas "${name}"?`)) {
      try {
        await komunitasApi.delete(id);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredCommunities = communities.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <HeartHandshake size={32} />
        <p>Memuat komunitas...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Komunitas</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Temukan dan bergabunglah dengan komunitas di Graha Harmony 5
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Tambah Komunitas
        </button>
      </div>

      {/* Form Tambah Komunitas */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Tambah Komunitas Baru</h3>
          <form onSubmit={handleTambah} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Nama Komunitas</label>
              <input
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Kategori</label>
              <select
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="olahraga">Olahraga</option>
                <option value="seni">Seni</option>
                <option value="sosial">Sosial</option>
                <option value="keagamaan">Keagamaan</option>
                <option value="pendidikan">Pendidikan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Deskripsi</label>
              <input
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Jumlah Anggota</label>
              <input
                type="number"
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.memberCount}
                onChange={(e) => setForm({ ...form, memberCount: +e.target.value })}
              />
            </div>
            <div>
              <label className="label">Lokasi</label>
              <input
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Simpan</button>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            top: '50%',
            left: '12px',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Cari komunitas..."
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

      {/* Daftar Komunitas */}
      {filteredCommunities.length > 0 ? (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredCommunities.map((komunitas) => (
            <div key={komunitas.id} className="card" style={{ position: 'relative' }}>
              {/* Tombol Hapus */}
              <button
                onClick={() => handleHapus(komunitas.id, komunitas.name)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--danger)',
                  zIndex: 10,
                }}
                title="Hapus komunitas"
              >
                <Trash2 size={16} />
              </button>

              {/* Banner */}
              <div
                style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${categoryColors[komunitas.category] || '#6b7280'}40, ${categoryColors[komunitas.category] || '#6b7280'}20)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <HeartHandshake size={48} color={categoryColors[komunitas.category] || '#6b7280'} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{komunitas.name}</h3>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '20px',
                      background: `${categoryColors[komunitas.category] || '#6b7280'}20`,
                      color: categoryColors[komunitas.category] || '#6b7280',
                      fontWeight: 600,
                      marginTop: '0.3rem',
                      display: 'inline-block',
                    }}
                  >
                    {komunitas.category?.toUpperCase()}
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                {komunitas.description}
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Users size={14} /> {komunitas.memberCount || 0} anggota
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} /> {komunitas.location || 'GH5'}
                </span>
              </div>
              <button
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                }}
              >
                Lihat Detail <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <HeartHandshake size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Belum ada komunitas yang terdaftar.</p>
        </div>
      )}
    </div>
  );
};

export default Komunitas;