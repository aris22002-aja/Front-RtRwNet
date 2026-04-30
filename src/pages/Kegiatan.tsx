import React, { useEffect, useState } from 'react';
import { kegiatanApi } from '../api';
import { Bike, MapPin, Calendar, Clock, Users, Plus, Trash2 } from 'lucide-react';

const Kegiatan = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<'semua' | 'akan datang' | 'selesai'>('semua');
  const [loading, setLoading] = useState(true);

  // State untuk form tambah
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    participants: 0,
    status: 'akan datang',
    image: '',
  });

  const fetchEvents = () => {
    kegiatanApi.getAll()
      .then((data) => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await kegiatanApi.create(form);
      setForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        participants: 0,
        status: 'akan datang',
        image: '',
      });
      setShowForm(false);
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleHapus = async (id: number, title: string) => {
    if (confirm(`Yakin ingin menghapus "${title}"?`)) {
      try {
        await kegiatanApi.delete(id);
        fetchEvents();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filter === 'semua') return true;
    return e.status === filter;
  });

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Bike size={32} />
        <p>Memuat kegiatan...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Kegiatan</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Daftar kegiatan & acara warga Graha Harmony 5
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Tambah Kegiatan
        </button>
      </div>

      {/* Form tambah */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Tambah Kegiatan Baru</h3>
          <form onSubmit={handleTambah} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Judul Kegiatan</label>
              <input className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div>
              <label className="label">Lokasi</label>
              <input className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Deskripsi</label>
              <input className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div>
              <label className="label">Tanggal</label>
              <input type="date" className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div>
              <label className="label">Waktu</label>
              <input type="time" className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
            </div>
            <div>
              <label className="label">Peserta (target)</label>
              <input type="number" className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.participants} onChange={e => setForm({...form, participants: +e.target.value})} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="akan datang">Akan Datang</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">URL Gambar (opsional)</label>
              <input className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Simpan</button>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'semua', label: 'Semua' },
          { key: 'akan datang', label: 'Akan Datang' },
          { key: 'selesai', label: 'Selesai' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '24px',
              border: filter === tab.key ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: filter === tab.key ? 'var(--primary)' : 'transparent',
              color: filter === tab.key ? '#fff' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Daftar Kegiatan */}
      {filteredEvents.length > 0 ? (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filteredEvents.map((event) => (
            <div key={event.id} className="card" style={{ cursor: 'pointer', position: 'relative' }}>
              {/* Tombol hapus */}
              <button
                onClick={() => handleHapus(event.id, event.title)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--danger)',
                  zIndex: 10,
                }}
                title="Hapus kegiatan"
              >
                <Trash2 size={16} />
              </button>

              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    marginBottom: '1rem',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0ea5e940, #0ea5e920)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <Bike size={56} color="#0ea5e9" />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, flex: 1 }}>{event.title}</h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    background: event.status === 'akan datang' ? '#0ea5e920' : '#6b728020',
                    color: event.status === 'akan datang' ? '#0ea5e9' : '#6b7280',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.status === 'akan datang' ? '🔜 Akan Datang' : '✅ Selesai'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                {event.description}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {event.date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} /> {event.date}
                  </span>
                )}
                {event.time && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> {event.time}
                  </span>
                )}
                {event.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> {event.location}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Users size={14} /> {event.participants || 0} peserta
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bike size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>
            {filter === 'semua'
              ? 'Belum ada kegiatan yang terdaftar.'
              : filter === 'akan datang'
              ? 'Tidak ada kegiatan yang akan datang.'
              : 'Belum ada kegiatan yang selesai.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Kegiatan;