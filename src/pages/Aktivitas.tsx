import React, { useEffect, useState } from 'react';
import { getActivities } from '../api';
import { Activity, Clock, User } from 'lucide-react';

// ✅ Tambahkan tipe data aktivitas
interface ActivityItem {
  type: string;
  time: string;
  message: string;
  user?: string;
}

const Aktivitas = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]); // ✅ state bertipe
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua');

  useEffect(() => {
    getActivities()
      .then((data: ActivityItem[]) => setActivities(data)) // ✅ parameter bertipe
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  const typeColors: Record<string, string> = {
    postingan: '#10b981',
    pembayaran: '#f59e0b',
    kegiatan: '#0ea5e9',
    komunitas: '#ec4899',
    sistem: '#6b7280',
  };

  const typeIcons: Record<string, string> = {
    postingan: '📝',
    pembayaran: '💰',
    kegiatan: '🎯',
    komunitas: '🤝',
    sistem: '⚙️',
  };

  const filteredActivities =
    filter === 'semua' ? activities : activities.filter((a) => a.type === filter);

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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Aktivitas</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Log aktivitas terbaru di lingkungan Graha Harmony 5
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['semua', 'postingan', 'pembayaran', 'kegiatan', 'komunitas', 'sistem'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: filter === type ? `2px solid ${typeColors[type] || '#6b7280'}` : '1px solid var(--border)',
              background: filter === type ? `${typeColors[type] || '#6b7280'}20` : 'transparent',
              color: filter === type ? typeColors[type] || '#6b7280' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
              textTransform: 'capitalize',
            }}
          >
            {typeIcons[type] || '📋'} {type}
          </button>
        ))}
      </div>

      {/* Timeline Aktivitas */}
      {filteredActivities.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filteredActivities.map((activity, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem 0',
                borderLeft: idx < filteredActivities.length - 1 ? '2px solid var(--border)' : '2px solid transparent',
                marginLeft: '10px',
                position: 'relative',
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: typeColors[activity.type] || '#6b7280',
                  position: 'absolute',
                  left: '-7px',
                  top: '1.3rem',
                  border: '3px solid var(--bg)',
                }}
              />
              <div style={{ marginLeft: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
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
                      }}
                    >
                      {typeIcons[activity.type] || '📋'} {activity.type}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {activity.time}
                  </span>
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