// ============================================================
// DashboardPengurus — Officer Dashboard with Full CRUD Access
// ============================================================

import React, { useEffect, useState } from 'react';
import { useRole, RoleDisplayName, Role } from '../contexts/RoleContext';
import { getStats } from '../api';
import {
  Home,
  Users,
  CreditCard,
  TrendingUp,
  Calendar,
  HeartHandshake,
  Building2,
  Bike,
  UserPlus,
  Shield,
  Edit,
  Trash2,
  Plus,
  Eye,
  BarChart3,
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

const DashboardPengurus = () => {
  const { user, hasPermission } = useRole();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

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
          totalProducts: 0,
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
      [Role.SUPER_ADMIN]: { color: 'var(--danger)', icon: <Shield size={14} /> },
      [Role.KETUA_RW]: { color: '#8b5cf6', icon: <Shield size={14} /> },
      [Role.KETUA_RT]: { color: '#6366f1', icon: <Shield size={14} /> },
      [Role.SEKRETARIS]: { color: '#06b6d4', icon: <Edit size={14} /> },
      [Role.BENDAHARA]: { color: '#f59e0b', icon: <CreditCard size={14} /> },
      [Role.WARGANEGARA]: { color: '#10b981', icon: <Users size={14} /> },
      [Role.KARANG_TARUNA]: { color: '#ec4899', icon: <Bike size={14} /> },
    };
    const badge = badges[role];
    return (
      <span className="role-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon}
        {RoleDisplayName[role]}
      </span>
    );
  };

  const renderCRUDBar = (section: string, label: string) => {
    if (!hasPermission(section as 'residents' | 'payments' | 'houses' | 'users')) {
      return null;
    }
    return (
      <div className="crud-bar">
        <span className="crud-label">{label}</span>
        <div className="crud-actions">
          <button className="btn-action btn-add">
            <Plus size={16} />
            Tambah
          </button>
          <button className="btn-action btn-edit">
            <Edit size={16} />
            Edit
          </button>
          <button className="btn-action btn-delete">
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-pengurus">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>
            <BarChart3 size={28} />
            Dashboard Pengurus
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

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          <Eye size={18} />
          Overview
        </button>
        {hasPermission('houses') && (
          <button
            className={`tab-btn ${activeSection === 'houses' ? 'active' : ''}`}
            onClick={() => setActiveSection('houses')}
          >
            <Home size={18} />
            Data Rumah
          </button>
        )}
        {hasPermission('residents') && (
          <button
            className={`tab-btn ${activeSection === 'residents' ? 'active' : ''}`}
            onClick={() => setActiveSection('residents')}
          >
            <Users size={18} />
            Penghuni
          </button>
        )}
        {hasPermission('payments') && (
          <button
            className={`tab-btn ${activeSection === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveSection('payments')}
          >
            <CreditCard size={18} />
            Iuran IPL
          </button>
        )}
        {hasPermission('users') && (
          <button
            className={`tab-btn ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <UserPlus size={18} />
            Kelola Pengguna
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeSection === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <Home size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Rumah</span>
                  <span className="stat-value">{stats?.totalHouses ?? 0}</span>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Rumah Terisi</span>
                  <span className="stat-value">{stats?.occupiedHouses ?? 0}</span>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Penghuni</span>
                  <span className="stat-value">{stats?.totalResidents ?? 0}</span>
                </div>
              </div>

              <div className="stat-card danger">
                <div className="stat-icon">
                  <CreditCard size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">IPL Bulan Ini</span>
                  <span className="stat-value">Rp {(stats?.monthlyRevenue ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="secondary-stats">
              <div className="stat-mini">
                <Calendar size={18} />
                <div>
                  <span className="label">Agenda Mendatang</span>
                  <span className="value">{stats?.upcomingAgendas ?? 0}</span>
                </div>
              </div>
              <div className="stat-mini">
                <HeartHandshake size={18} />
                <div>
                  <span className="label">Komunitas</span>
                  <span className="value">{stats?.totalCommunities ?? 0}</span>
                </div>
              </div>
              <div className="stat-mini">
                <Bike size={18} />
                <div>
                  <span className="label">Kegiatan</span>
                  <span className="value">{stats?.totalEvents ?? 0}</span>
                </div>
              </div>
              <div className="stat-mini">
                <Building2 size={18} />
                <div>
                  <span className="label">Organisasi</span>
                  <span className="value">{stats?.totalOrganizations ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>
                <BarChart3 size={18} />
                Aksi Cepat
              </h3>
              <div className="action-buttons">
                {hasPermission('residents') && (
                  <button className="quick-action-btn">
                    <UserPlus size={20} />
                    Tambah Penghuni Baru
                  </button>
                )}
                {hasPermission('payments') && (
                  <button className="quick-action-btn">
                    <CreditCard size={20} />
                    Catat Pembayaran IPL
                  </button>
                )}
                {hasPermission('users') && (
                  <button className="quick-action-btn">
                    <Users size={20} />
                    Kelola Akun Warga
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {activeSection === 'houses' && hasPermission('houses') && (
          <div className="section-content">
            {renderCRUDBar('houses', 'Data Rumah')}
            <p className="section-placeholder">
              <Home size={48} />
              Data rumah akan ditampilkan di sini
            </p>
          </div>
        )}

        {activeSection === 'residents' && hasPermission('residents') && (
          <div className="section-content">
            {renderCRUDBar('residents', 'Data Penghuni')}
            <p className="section-placeholder">
              <Users size={48} />
              Data penghuni akan ditampilkan di sini
            </p>
          </div>
        )}

        {activeSection === 'payments' && hasPermission('payments') && (
          <div className="section-content">
            {renderCRUDBar('payments', 'Iuran IPL')}
            <p className="section-placeholder">
              <CreditCard size={48} />
              Data pembayaran IPL akan ditampilkan di sini
            </p>
          </div>
        )}

        {activeSection === 'users' && hasPermission('users') && (
          <div className="section-content">
            {renderCRUDBar('users', 'Kelola Pengguna')}
            <p className="section-placeholder">
              <UserPlus size={48} />
              Manajemen pengguna akan ditampilkan di sini
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPengurus;
