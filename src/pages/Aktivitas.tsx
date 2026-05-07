import React, { useEffect, useMemo, useState } from 'react';
import { activitiesApi } from '../api';
import { Activity, Clock, User, Plus, Trash2, Pencil } from 'lucide-react';

type ActivityType = 'postingan' | 'pembayaran' | 'kegiatan' | 'komunitas' | 'sistem' | string;

interface ActivityItem {
  id?: number | string;
  type: ActivityType;
  time: string;
  message: string;
  user?: string;
}

const Aktivitas = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityType | 'semua'>('semua');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState({
    type: 'postingan' as ActivityType,
    time: '',
    message: '',
    user: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ActivityItem | null>(null);

  const typeColors: Record<string, string> = useMemo(
    () => ({
      postingan: '#10b981',
      pembayaran: '#f59e0b',
      kegiatan: '#0ea5e9',
      komunitas: '#ec4899',
      sistem: '#6b7280',
    }),
    [],
  );

  const typeIcons: Record<string, string> = useMemo(
    () => ({
      postingan: '📝',
      pembayaran: '💰',
      kegiatan: '🎯',
      komunitas: '🤝',
      sistem: '⚙️',
    }),
    [],
  );

  const ACTIVITY_TYPES = useMemo(() => ['postingan', 'pembayaran', 'kegiatan', 'komunitas', 'sistem'], []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await activitiesApi.getAll();
      setActivities(Array.isArray(data) ? (data as ActivityItem[]) : []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredActivities = useMemo(() => {
    if (filter === 'semua') return activities;
    return activities.filter((a) => a.type === filter);
  }, [activities, filter]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ type: 'postingan', time: '', message: '', user: '' });
    setShowForm(true);
  };

  const openEditForm = (activity: ActivityItem) => {
    if (activity.id === undefined || activity.id === null) return;
    setEditingId(activity.id);
    setForm({
      type: activity.type ?? 'postingan',
      time: activity.time ?? '',
      message: activity.message ?? '',
      user: activity.user ?? '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    if (!form.type) return;

    setSaving(true);
    try {
      const payload: Omit<ActivityItem, 'id'> = {
        type: form.type,
        time: form.time,
        message: form.message,
        user: form.user ? form.user : undefined,
      };

      if (editingId === null) {
        await activitiesApi.create(payload);
      } else {
        await activitiesApi.update(editingId, payload);
      }

      closeForm();
      await fetchActivities();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (activity: ActivityItem) => {
    if (activity.id === undefined || activity.id === null) return;
    if (!confirm(`Yakin ingin menghapus aktivitas "${activity.message}"?`)) return;

    try {
      await activitiesApi.delete(activity.id);
      await fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Activity size={32} />
        <p>Memuat aktivitas...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Aktivitas</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Log aktivitas terbaru di lingkungan Graha Harmony 5</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={openCreateForm}>
            <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Tambah Aktivitas
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>{editingId === null ? 'Tambah Aktivitas' : 'Edit Aktivitas'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Tipe</label>
              <select
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Waktu</label>
              <input
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="mis. 10:30"
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Pesan</label>
              <input
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">User (opsional)</label>
              <input
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                placeholder="Nama / inisial"
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button type="button" className="btn" onClick={closeForm} disabled={saving}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {(['semua', ...ACTIVITY_TYPES] as Array<ActivityType | 'semua'>).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: filter === type ? `2px solid ${typeColors[String(type)] || '#6b7280'}` : '1px solid var(--border)',
              background: filter === type ? `${typeColors[String(type)] || '#6b7280'}20` : 'transparent',
              color: filter === type ? typeColors[String(type)] || '#6b7280' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'capitalize',
            }}
          >
            {type === 'semua' ? '📋 Semua' : `${typeIcons[String(type)] || '📋'} ${type}`}
          </button>
        ))}
      </div>

      {/* Timeline Aktivitas */}
      {filteredActivities.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filteredActivities.map((activity, idx) => (
            <div
              key={activity.id ?? idx}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem 0',
                borderLeft: idx < filteredActivities.length - 1 ? '2px solid var(--border)' : '2px solid transparent',
                marginLeft: '10px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: typeColors[activity.type] || '#6b7280',
                  position: 'absolute',
                  left: '-7px',
                  top: '1.3rem',
                  border: '3px solid var(--bg-main)',
                }}
              />

              <div style={{ marginLeft: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '20px',
                        background: `${typeColors[activity.type] || '#6b7280'}20`,
                        color: typeColors[activity.type] || '#6b7280',
                        fontWeight: 600,
                        marginRight: '0.5rem',
                        textTransform: 'capitalize',
                        display: 'inline-block',
                        maxWidth: '100%',
                      }}
                    >
                      {typeIcons[activity.type] || '📋'} {activity.type}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {activity.time}
                    </span>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => openEditForm(activity)}
                        style={{
                          background: 'rgba(255,255,255,0.85)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          cursor: activity.id === undefined ? 'not-allowed' : 'pointer',
                          opacity: activity.id === undefined ? 0.5 : 1,
                          color: 'var(--text)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                        title={activity.id === undefined ? 'Tidak bisa edit (id tidak tersedia)' : 'Edit aktivitas'}
                        disabled={activity.id === undefined}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(activity)}
                        style={{
                          background: 'rgba(255,255,255,0.85)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          cursor: activity.id === undefined ? 'not-allowed' : 'pointer',
                          opacity: activity.id === undefined ? 0.5 : 1,
                          color: 'var(--danger)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                        title={activity.id === undefined ? 'Tidak bisa hapus (id tidak tersedia)' : 'Hapus aktivitas'}
                        disabled={activity.id === undefined}
                      >
                        <Trash2 size={14} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>

                <p style={{ margin: '0.3rem 0', fontWeight: 500 }}>{activity.message}</p>

                {activity.user && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={12} /> {activity.user}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Activity size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Belum ada aktivitas tercatat.</p>
        </div>
      )}
    </div>
  );
};

export default Aktivitas;
