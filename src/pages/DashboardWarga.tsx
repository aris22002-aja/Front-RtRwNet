// ============================================================
// DashboardWarga — Citizen Dashboard (Read-Only)
// ============================================================

import React, { useEffect, useState } from 'react';
import { useRole, RoleDisplayName, Role } from '../contexts/RoleContext';
import { getStats } from '../api';
import {
  Users,
  Home,
  CreditCard,
  Calendar,
  HeartHandshake,
  Bike,
  Building2,
  Eye,
  Bell,
  Info,
  MessageSquare,
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
  recentUpdates: string[];
}

const DashboardWarga = () => {
  const { user } = useRole();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    getStats()
      .then((data: StatsData) => setStats(data))
      .catch(() => {
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
          recentUpdates: [],
        });
      });
  }, []);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <p>Memuat data...</p>
      </div>
    );
  }

  const renderRoleBadge = (role: Role) => {
    const badges: Record<Role, { color: string; icon: React.ReactNode }> = {
      [Role.SUPER_ADMIN]: { color: 'var(--danger)', icon: null },
      [Role.KETUA_RW]: { color: '#8b5cf6', icon: null },
      [Role.KETUA_RT]: { color: '#6366f1', icon: null },
      [Role.SEKRETARIS]: { color: '#06b6d4', icon: null },
      [Role.BENDAHARA]: { color: '#f59e0b', icon: null },
      [Role.WARGANEGARA]: { color: '#10b981', icon: null },
      [Role.KARANG_TARUNA]: { color: '#ec4899', icon: null },
    };
    return (
      <span className="role-badge" style={{ backgroundColor: badges[role].color }}>
        {RoleDisplayName[role]}
      </span>
    );
  };

  return (
    <div className="dashboard-warga">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>
            <Users size={28} />
            Dashboard Warga
          </h1>
          <p className="header-subtitle">
            Selamat datang, <strong>{user.name || user.email}</strong>
          </p>
        </div>
        <div className="header-meta">
          {renderRoleBadge(user.role)}
          {user.rt && <span className="meta-tag">RT {user.rt}</span>}
          {user.rw && <span className="meta-tag">RW {user.rw}</span>}
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <Info size={20} />
        <p>
          Anda login sebagai <strong>Warga</strong>. Fitur pengelolaan data hanya dapat dilakukan oleh
          pengurus lingkungan.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Info size={18} />
          Info Umum
        </button>
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={18} />
          Iuran IPL
        </button>
        <button
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <Calendar size={18} />
          Agenda
        </button>
        <button
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <HeartHandshake size={18} />
          Komunitas
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'info' && (
          <div className="info-section">
            {/* Read-Only Stats */}
            <div className="readonly-stats">
              <div className="readonly-stat">
                <Home size={24} />
                <div className="stat-details">
                  <span className="stat-label">Total Rumah</span>
                  <span className="stat-value">{stats?.totalHouses ?? 0}</span>
                </div>
              </div>

              <div className="readonly-stat">
                <Users size={24} />
                <div className="stat-details">
                  <span className="stat-label">Total Penghuni</span>
                  <span className="stat-value">{stats?.totalResidents ?? 0}</span>
                </div>
              </div>

              <div className="readonly-stat">
                <Bike size={24} />
                <div className="stat-details">
                  <span className="stat-label">Total Kegiatan</span>
                  <span className="stat-value">{stats?.totalEvents ?? 0}</span>
                </div>
              </div>

              <div className="readonly-stat">
                <Building2 size={24} />
                <div className="stat-details">
                  <span className="stat-label">Organisasi</span>
                  <span className="stat-value">{stats?.totalOrganizations ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name || 'User'} />
                ) : (
                  <Users size={32} />
                )}
              </div>
              <div className="profile-info">
                <h3>{user.name || 'Warga'}</h3>
                <p>{user.email}</p>
                <div className="profile-badges">
                  {user.rt && <span className="badge">RT {user.rt}</span>}
                  {user.rw && <span className="badge">RW {user.rw}</span>}
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="updates-card">
              <h3>
                <Bell size={18} />
                Pembaruan Terkini
              </h3>
              {stats?.recentUpdates && stats.recentUpdates.length > 0 ? (
                <ul>
                  {stats.recentUpdates.map((update, idx) => (
                    <li key={idx}>{update}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-updates">Belum ada pembaruan terbaru.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-section">
            <div className="ipl-info-card">
              <CreditCard size={48} />
              <h3>Informasi Iuran IPL</h3>
              <div className="ipl-amount">
                <span className="label">IPL Bulan Ini</span>
                <span className="amount">Rp {(stats?.monthlyRevenue ?? 0).toLocaleString()}</span>
              </div>
              <p className="info-text">
                Untuk informasi lebih lanjut mengenai pembayaran IPL, silakan hubungi Bendahara
                lingkungan Anda.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="activities-section">
            <div className="activities-card">
              <Calendar size={48} />
              <h3>Agenda Mendatang</h3>
              <div className="agenda-list">
                {stats?.upcomingAgendas && stats.upcomingAgendas > 0 ? (
                  <p>Ada {stats.upcomingAgendas} agenda mendatang</p>
                ) : (
                  <p className="no-activities">Belum ada agenda yang terjadwal.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="community-section">
            <div className="community-grid">
              <div className="community-card">
                <HeartHandshake size={32} />
                <h4>Komunitas</h4>
                <span className="count">{stats?.totalCommunities ?? 0}</span>
              </div>
              <div className="community-card">
                <Bike size={32} />
                <h4>Kegiatan</h4>
                <span className="count">{stats?.totalEvents ?? 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardWarga;
