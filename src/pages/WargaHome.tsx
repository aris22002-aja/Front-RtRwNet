import React, { useEffect, useState } from 'react';
import { getResume } from '../api';
import {
  FileText,
  Users,
  Activity,
  MessageSquare,
  Calendar,
  HeartHandshake,
  Building2,
  Bike,
  Package,
  Bell,
  ArrowRight,
} from 'lucide-react';

interface Post {
  title: string;
  excerpt: string;
  date: string;
}

interface EventItem {
  name: string;
  date: string;
  location: string;
}

interface ResumeData {
  totalPosts: number;
  totalUsers: number;
  totalActivities: number;
  upcomingAgendas: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  totalProducts: number;
  recentPosts: Post[];
  upcomingEvents: EventItem[];
}

const defaultResume: ResumeData = {
  totalPosts: 0,
  totalUsers: 0,
  totalActivities: 0,
  upcomingAgendas: 0,
  totalCommunities: 0,
  totalOrganizations: 0,
  totalEvents: 0,
  totalProducts: 0,
  recentPosts: [],
  upcomingEvents: [],
};

const WargaHome = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    getResume()
      .then((data: ResumeData) => setResume(data))
      .catch(() => setResume(defaultResume));
  }, []);

  if (!resume) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <FileText size={32} />
        <p>Memuat resume...</p>
      </div>
    );
  }

  const menuItems = [
    { label: 'Postingan', icon: <MessageSquare size={24} />, value: resume.totalPosts, color: '#10b981', path: '/warga/postingan' },
    { label: 'Komunitas', icon: <HeartHandshake size={24} />, value: resume.totalCommunities, color: '#ec4899', path: '/warga/komunitas' },
    { label: 'Organisasi', icon: <Building2 size={24} />, value: resume.totalOrganizations, color: '#8b5cf6', path: '/warga/organisasi' },
    { label: 'Agenda', icon: <Calendar size={24} />, value: resume.upcomingAgendas, color: '#ef4444', path: '/warga/agenda' },
    { label: 'Kegiatan', icon: <Bike size={24} />, value: resume.totalEvents, color: '#0ea5e9', path: '/warga/kegiatan' },
    { label: 'Produk', icon: <Package size={24} />, value: resume.totalProducts, color: '#f97316', path: '/warga/produk' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Beranda Warga</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Selamat datang kembali, Warga Graha Harmony 5 👋
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => (window.location.href = item.path)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label">{item.label}</span>
              <span style={{ color: item.color }}>{item.icon}</span>
            </div>
            <span className="value">{item.value ?? 0}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)' }}>
              Lihat semua <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} />
          Postingan Terbaru
        </h3>
        {resume.recentPosts?.length > 0 ? (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resume.recentPosts.map((post, idx) => (
              <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <h4 style={{ margin: 0 }}>{post.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0' }}>{post.excerpt}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Belum ada postingan terbaru.</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} />
          Kegiatan Mendatang
        </h3>
        {resume.upcomingEvents?.length > 0 ? (
          <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem' }}>
            {resume.upcomingEvents.map((event, idx) => (
              <li key={idx} style={{ marginBottom: '0.75rem' }}>
                <strong>{event.name}</strong>
                <br />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  📅 {event.date} &nbsp; 📍 {event.location}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Tidak ada kegiatan mendatang.</p>
        )}
      </div>
    </div>
  );
};

export default WargaHome;