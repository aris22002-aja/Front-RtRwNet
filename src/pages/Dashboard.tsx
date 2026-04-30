import React, { useEffect, useState } from 'react';
import { getStats } from '../api';
import {
  Home,
  Users,
  CreditCard,
  TrendingUp,
  FileText,
  Activity,
  MessageSquare,
  Calendar,
  HeartHandshake,
  Building2,
  Bike,
  Package,
  Clock,
  LayoutDashboard,
} from 'lucide-react';

interface StatsData {
  totalHouses: number;
  occupiedHouses: number;
  totalResidents: number;
  monthlyRevenue: number;
  totalUsers: number;
  totalActivities: number;
  totalPosts: number;
  upcomingAgendas: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  totalProducts: number;
  recentUpdates: string[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    getStats()
      .then((data: StatsData) => setStats(data))
      .catch(() => {
        // Fallback data contoh agar dashboard tetap terlihat
        setStats({
          totalHouses: 0,
          occupiedHouses: 0,
          totalResidents: 0,
          monthlyRevenue: 0,
          totalUsers: 0,
          totalActivities: 0,
          totalPosts: 0,
          upcomingAgendas: 0,
          totalCommunities: 0,
          totalOrganizations: 0,
          totalEvents: 0,
          totalProducts: 0,
          recentUpdates: [],
        });
      });
  }, []);

  if (!stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <LayoutDashboard size={32} />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Dashboard */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Dashboard RtRwNet</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Graha Harmony 5</p>
      </div>

      {/* Baris 1: Statistik Umum */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Total Rumah</span>
            <Home size={20} color="var(--primary)" />
          </div>
          <span className="value">{stats.totalHouses}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Rumah Terisi</span>
            <Users size={20} color="var(--success)" />
          </div>
          <span className="value">{stats.occupiedHouses}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Total Penghuni</span>
            <TrendingUp size={20} color="var(--warning)" />
          </div>
          <span className="value">{stats.totalResidents}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Pendapatan IPL Bulan Ini</span>
            <CreditCard size={20} color="var(--primary)" />
          </div>
          <span className="value">Rp {stats.monthlyRevenue?.toLocaleString()}</span>
        </div>
      </div>

      {/* Baris 2: Kategori Warga */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Resume</span>
            <FileText size={20} color="#6366f1" />
          </div>
          <span className="value">{stats.totalPosts ?? 0}</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Total postingan</p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Pengguna</span>
            <Users size={20} color="#06b6d4" />
          </div>
          <span className="value">{stats.totalUsers ?? 0}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Aktivitas</span>
            <Activity size={20} color="#f59e0b" />
          </div>
          <span className="value">{stats.totalActivities ?? 0}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Postingan</span>
            <MessageSquare size={20} color="#10b981" />
          </div>
          <span className="value">{stats.totalPosts ?? 0}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Agenda</span>
            <Calendar size={20} color="#ef4444" />
          </div>
          <span className="value">{stats.upcomingAgendas ?? 0}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Komunitas</span>
            <HeartHandshake size={20} color="#ec4899" />
          </div>
          <span className="value">{stats.totalCommunities ?? 0}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Organisasi</span>
            <Building2 size={20} color="#8b5cf6" />
          </div>
          <span className="value">{stats.totalOrganizations ?? 0}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Kegiatan</span>
            <Bike size={20} color="#0ea5e9" />
          </div>
          <span className="value">{stats.totalEvents ?? 0}</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="label">Produk</span>
            <Package size={20} color="#f97316" />
          </div>
          <span className="value">{stats.totalProducts ?? 0}</span>
        </div>
      </div>

      {/* Update Hari Ini */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} />
          Update Hari Ini
        </h3>
        {stats.recentUpdates?.length > 0 ? (
          <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem' }}>
            {stats.recentUpdates.map((update, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                {update}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Belum ada pembaruan hari ini. Tetap pantau untuk info terbaru seputar Graha Harmony 5.
          </p>
        )}
      </div>

      {/* Sambutan */}
      <div className="card">
        <h3>Selamat Datang di Sistem Pengelolaan Lingkungan</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Gunakan menu di samping untuk mengelola data rumah, penghuni, pembayaran iuran bulanan (IPL), serta informasi
          warga Graha Harmony 5.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;