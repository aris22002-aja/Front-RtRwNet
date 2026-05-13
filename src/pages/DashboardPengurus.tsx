// ============================================================
// DashboardPengurus — Officer Dashboard with Full CRUD Access
// Admin: aris.22002.priyanto@gmail.com has full access
// ============================================================

import React, { useEffect, useState } from 'react';
import { useRole, ROLE_DISPLAY_NAMES, PERMISSIONS, Role } from '../contexts/RoleContext';
import { getStats, housesApi, residentsApi, paymentsApi, usersApi } from '../api';
import CRUDModal, { CrudAction, EntityType } from '../components/CRUDModal';
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
  Bell,
  Info,
  MessageSquare,
  CreditCard as PaymentIcon,
  Users as ResidentsIcon,
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

const DashboardPengurus = () => {
  const { profile, isAdmin, canCreate, canUpdate, canDelete, checkRole } = useRole();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeTab, setActiveTab] = useState('info'); // For warga-style tabs in overview

  // CRUD Data States
  const [houses, setHouses] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CRUD Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<CrudAction>('add');
  const [modalEntity, setModalEntity] = useState<EntityType>('houses');
  const [modalData, setModalData] = useState<any>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Data Fetching for CRUD sections
  useEffect(() => {
    if (activeSection === 'houses' && houses.length === 0) {
      setLoading(true);
      housesApi.getAll()
        .then(setHouses)
        .catch(() => setError('Gagal memuat data rumah'))
        .finally(() => setLoading(false));
    }
    if (activeSection === 'residents' && residents.length === 0) {
      setLoading(true);
      residentsApi.getAll()
        .then(setResidents)
        .catch(() => setError('Gagal memuat data penghuni'))
        .finally(() => setLoading(false));
    }
    if (activeSection === 'payments') {
      const now = new Date();
      setLoading(true);
      paymentsApi.getAll(now.getMonth() + 1, now.getFullYear())
        .then(setPayments)
        .catch(() => setError('Gagal memuat data IPL'))
        .finally(() => setLoading(false));
    }
    if (activeSection === 'users' && users.length === 0) {
      setLoading(true);
      usersApi.getAll()
        .then(setUsers)
        .catch(() => setError('Gagal memuat data pengguna'))
        .finally(() => setLoading(false));
    }
  }, [activeSection]);

  // Data Fetching for CRUD sections
  useEffect(() => {
    if (activeSection === 'houses' && houses.length === 0) {
      setLoading(true);
      housesApi.getAll()
        .then(setHouses)
        .catch(() => setError('Gagal memuat data rumah'))
        .finally(() => setLoading(false));
    }
    if (activeSection === 'residents' && residents.length === 0) {
      setLoading(true);
      residentsApi.getAll()
        .then(setResidents)
        .catch(() => setError('Gagal memuat data penghuni'))
        .finally(() => setLoading(false));
    }
    if (activeSection === 'payments') {
      const now = new Date();
      setLoading(true);
      paymentsApi.getAll(now.getMonth() + 1, now.getFullYear())
        .then(setPayments)
        .catch(() => setError('Gagal memuat data IPL'))
        .finally(() => setLoading(false));
    }
    if (activeSection === 'users' && users.length === 0) {
      setLoading(true);
      usersApi.getAll()
        .then(setUsers)
        .catch(() => setError('Gagal memuat data pengguna'))
        .finally(() => setLoading(false));
    }
  }, [activeSection]);

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

  // CRUD Modal Handlers
  const openAddModal = (entity: EntityType) => {
    setModalAction('add');
    setModalEntity(entity);
    setModalData(null);
    setModalOpen(true);
  };

  const openEditModal = (entity: EntityType, data: any) => {
    setModalAction('edit');
    setModalEntity(entity);
    setModalData(data);
    setModalOpen(true);
  };

  const openDeleteModal = (entity: EntityType, data: any) => {
    setModalAction('delete');
    setModalEntity(entity);
    setModalData(data);
    setModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      switch (modalEntity) {
        case 'houses':
          if (modalAction === 'add') await housesApi.create(data);
          else if (modalAction === 'edit') await housesApi.update(modalData.id, data);
          else await housesApi.delete(modalData.id);
          if (modalAction !== 'delete') {
            const updated = await housesApi.getAll();
            setHouses(updated);
          } else {
            setHouses((prev) => prev.filter((h) => h.id !== modalData.id));
          }
          break;
        case 'residents':
          if (modalAction === 'add') await residentsApi.create(data);
          else if (modalAction === 'edit') await residentsApi.update(modalData.id, data);
          else await residentsApi.delete(modalData.id);
          if (modalAction !== 'delete') {
            const updated = await residentsApi.getAll();
            setResidents(updated);
          } else {
            setResidents((prev) => prev.filter((r) => r.id !== modalData.id));
          }
          break;
        case 'payments':
          if (modalAction === 'add') await paymentsApi.create(data);
          else if (modalAction === 'edit') await paymentsApi.update(modalData.id, data);
          else await paymentsApi.delete(modalData.id);
          if (modalAction !== 'delete') {
            const now = new Date();
            const updated = await paymentsApi.getAll(now.getMonth() + 1, now.getFullYear());
            setPayments(updated);
          } else {
            setPayments((prev) => prev.filter((p) => p.id !== modalData.id));
          }
          break;
        case 'users':
          if (modalAction === 'add') await usersApi.create(data);
          else if (modalAction === 'edit') await usersApi.update(modalData.id, data);
          else await usersApi.delete(modalData.id);
          if (modalAction !== 'delete') {
            const updated = await usersApi.getAll();
            setUsers(updated);
          } else {
            setUsers((prev) => prev.filter((u) => u.id !== modalData.id));
          }
          break;
      }
      setModalOpen(false);
    } catch (err) {
      console.error('[DashboardPengurus] Modal submit error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="dashboard-loading">
        <p>Memuat data...</p>
      </div>
    );
  }

  // Permission check helper - all valid sections including residents/users
  const hasPermission = (section: 'houses' | 'activities' | 'payments' | 'residents' | 'users') => {
    if (isAdmin) return true;
    const permission = PERMISSIONS[section as keyof typeof PERMISSIONS];
    if (!permission) return false;
    return checkRole(permission.create as Role[]);
  };

  // Render role badge
  const renderRoleBadge = () => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      admin: { color: 'var(--danger)', icon: <Shield size={14} /> },
      kepala_lingkungan: { color: '#8b5cf6', icon: <Shield size={14} /> },
      ketua_rw: { color: '#6366f1', icon: <Shield size={14} /> },
      ketua_rt: { color: '#06b6d4', icon: <Shield size={14} /> },
      rt: { color: '#f59e0b', icon: <Shield size={14} /> },
      rw: { color: '#f59e0b', icon: <Shield size={14} /> },
      warga: { color: '#10b981', icon: <Users size={14} /> },
    };
    const badge = badges[profile.role] || badges.warga;
    return (
      <span className="role-badge" style={{ backgroundColor: badge.color }}>
        {badge.icon}
        {ROLE_DISPLAY_NAMES[profile.role]}
      </span>
    );
  };

  // CRUD action bar
  const renderCRUDBar = (section: string, label: string) => {
    if (isAdmin) {
      return (
        <div className="crud-bar">
          <span className="crud-label">{label}</span>
          <div className="crud-actions">
            {canCreate && (
              <button className="btn-action btn-add" onClick={() => openAddModal('houses')}>
                <Plus size={16} />
                Tambah
              </button>
            )}
            {canUpdate && (
              <button className="btn-action btn-edit" onClick={() => {
                const firstHouse = houses[0];
                if (firstHouse) openEditModal('houses', firstHouse);
              }}>
                <Edit size={16} />
                Edit
              </button>
            )}
            {canDelete && (
              <button className="btn-action btn-delete" onClick={() => {
                const firstHouse = houses[0];
                if (firstHouse) openDeleteModal('houses', firstHouse);
              }}>
                <Trash2 size={16} />
                Hapus
              </button>
            )}
          </div>
        </div>
      );
    }
    return null;
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
            Selamat datang, <strong>{profile?.displayName || profile?.email}</strong>
          </p>
        </div>
        <div className="header-meta">
          {renderRoleBadge()}
          {profile?.rt && <span className="meta-tag">RT {profile?.rt}</span>}
          {profile?.block && <span className="meta-tag">Block {profile?.block}</span>}
        </div>
      </div>

      {/* Info Banner - shows warga content */}
      <div className="info-banner">
        <Info size={20} />
        <p>
          Anda login sebagai <strong>Pengurus</strong>. Anda memiliki akses penuh untuk mengelola data lingkungan.
          {isAdmin && ' Sebagai Admin, Anda memiliki akses CRUD lengkap.'}
        </p>
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
        <button
          className={`tab-btn ${activeSection === 'warga-view' ? 'active' : ''}`}
          onClick={() => setActiveSection('warga-view')}
        >
          <Users size={18} />
          Lihat Warga
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
        {/* OVERVIEW SECTION */}
        {activeSection === 'overview' && (
          <>
            {/* Stats Grid - Admin has full view */}
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

        {/* WARGA VIEW - Same as DashboardWarga */}
        {activeSection === 'warga-view' && (
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
                <ResidentsIcon size={24} />
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
                {profile?.photoURL ? (
                  <img src={profile?.photoURL ?? ''} alt={profile?.displayName || 'User'} />
                ) : (
                  <Users size={32} />
                )}
              </div>
              <div className="profile-info">
                <h3>{profile?.displayName || 'Pengurus'}</h3>
                <p>{profile?.email}</p>
                <div className="profile-badges">
                  {profile?.rt && <span className="badge">RT {profile?.rt}</span>}
                  {profile?.block && <span className="badge">Block {profile?.block}</span>}
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="updates-card">
              <h3>
                <Bell size={18} />
                Pembaruan Terkini
              </h3>
              {stats?.recentUpdates && (stats?.recentUpdates?.length ?? 0) > 0 ? (
                <ul>
                  {stats?.recentUpdates?.map((update, idx) => (
                    <li key={idx}>{update}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-updates">Belum ada pembaruan terbaru.</p>
              )}
            </div>

            {/* IPL Info Card */}
            <div className="ipl-info-card">
              <PaymentIcon size={48} />
              <h3>Informasi Iuran IPL</h3>
              <div className="ipl-amount">
                <span className="label">IPL Bulan Ini</span>
                <span className="amount">Rp {(stats?.monthlyRevenue ?? 0).toLocaleString()}</span>
              </div>
              <p className="info-text">
                Untuk informasi lebih lanjut mengenai pembayaran IPL, silakan hubungi Bendahara lingkungan Anda.
              </p>
            </div>
          </div>
        )}

        {/* HOUSES CRUD */}
        {activeSection === 'houses' && hasPermission('houses') && (
          <div className="section-content">
            {renderCRUDBar('houses', 'Data Rumah')}
            {loading ? (
              <div className="loading-state">Memuat data rumah...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Block</th>
                      <th>Nomor</th>
                      <th>Status</th>
                      {isAdmin && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {houses.length === 0 ? (
                      <tr><td colSpan={5} className="empty-state">Belum ada data rumah</td></tr>
                    ) : (
                      houses.map((house: any, idx: number) => (
                        <tr key={house.id || idx}>
                          <td>{idx + 1}</td>
                          <td>{house.block || '-'}</td>
                          <td>{house.number || '-'}</td>
                          <td><span className={`status-badge ${house.occupied ? 'occupied' : 'empty'}`}>{house.occupied ? 'Terisi' : 'Kosong'}</span></td>
                          {isAdmin && (
                            <td className="action-cell">
                              <button className="btn-sm btn-edit" title="Edit" onClick={() => openEditModal('houses', house)}><Edit size={14} /></button>
                              <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('houses', house)}><Trash2 size={14} /></button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* RESIDENTS CRUD */}
        {activeSection === 'residents' && hasPermission('residents') && (
          <div className="section-content">
            {renderCRUDBar('residents', 'Data Penghuni')}
            {loading ? (
              <div className="loading-state">Memuat data penghuni...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Rumah</th>
                      <th>NIK</th>
                      <th>Telepon</th>
                      {isAdmin && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {residents.length === 0 ? (
                      <tr><td colSpan={6} className="empty-state">Belum ada data penghuni</td></tr>
                    ) : (
                      residents.map((resident: any, idx: number) => (
                        <tr key={resident.id || idx}>
                          <td>{idx + 1}</td>
                          <td>{resident.name || resident.nama || '-'}</td>
                          <td>Block {resident.block || '-'}, No {resident.number || '-'}</td>
                          <td>{resident.nik || resident.nik_number || '-'}</td>
                          <td>{resident.phone || resident.telepon || '-'}</td>
                          {isAdmin && (
                            <td className="action-cell">
                              <button className="btn-sm btn-edit" title="Edit" onClick={() => openEditModal('residents', resident)}><Edit size={14} /></button>
                              <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('residents', resident)}><Trash2 size={14} /></button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS CRUD */}
        {activeSection === 'payments' && hasPermission('payments') && (
          <div className="section-content">
            {renderCRUDBar('payments', 'Iuran IPL')}
            {loading ? (
              <div className="loading-state">Memuat data IPL...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Rumah</th>
                      <th>Jumlah</th>
                      <th>Status</th>
                      <th>Tanggal Bayar</th>
                      {isAdmin && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan={6} className="empty-state">Belum ada data pembayaran IPL</td></tr>
                    ) : (
                      payments.map((payment: any, idx: number) => (
                        <tr key={payment.id || idx}>
                          <td>{idx + 1}</td>
                          <td>Block {payment.block || '-'}, No {payment.number || '-'}</td>
                          <td>Rp {(payment.amount || payment.jumlah || 0).toLocaleString()}</td>
                          <td><span className={`status-badge ${payment.paid || payment.status === 'paid' ? 'paid' : 'unpaid'}`}>{payment.paid || payment.status === 'paid' ? 'Lunas' : 'Belum Bayar'}</span></td>
                          <td>{payment.paid_at || payment.payment_date || '-'}</td>
                          {isAdmin && (
                            <td className="action-cell">
                              <button className="btn-sm btn-edit" title="Edit" onClick={() => openEditModal('payments', payment)}><Edit size={14} /></button>
                              <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('payments', payment)}><Trash2 size={14} /></button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USERS MANAGEMENT */}
        {activeSection === 'users' && hasPermission('users') && (
          <div className="section-content">
            {renderCRUDBar('users', 'Kelola Pengguna')}
            {loading ? (
              <div className="loading-state">Memuat data pengguna...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>RT</th>
                      <th>Block</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={7} className="empty-state">Belum ada data pengguna</td></tr>
                    ) : (
                      users.map((user: any, idx: number) => (
                        <tr key={user.id || user.uid || idx}>
                          <td>{idx + 1}</td>
                          <td>{user.displayName || user.name || '-'}</td>
                          <td>{user.email || '-'}</td>
                          <td><span className={`role-badge-sm ${user.role || 'warga'}`}>{ROLE_DISPLAY_NAMES[user.role as Role] || user.role || 'Warga'}</span></td>
                          <td>{user.rt || '-'}</td>
                          <td>{user.block || '-'}</td>
                          <td className="action-cell">
                            {isAdmin && (
                              <>
                                <button className="btn-sm btn-edit" title="Edit Role" onClick={() => openEditModal('users', user)}><Shield size={14} /></button>
                                <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('users', user)}><Trash2 size={14} /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render CRUD Modal - Single return with modal wrapper
  return (
    <>
      <div className="dashboard-pengurus">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-info">
            <h1>
              <BarChart3 size={28} />
              Dashboard Pengurus
            </h1>
            <p className="header-subtitle">
              Selamat datang, <strong>{profile?.displayName || profile?.email}</strong>
            </p>
          </div>
          <div className="header-meta">
            {renderRoleBadge()}
            {profile?.rt && <span className="meta-tag">RT {profile?.rt}</span>}
            {profile?.block && <span className="meta-tag">Block {profile?.block}</span>}
          </div>
        </div>

        {/* Info Banner */}
        <div className="info-banner">
          <Info size={20} />
          <p>
            Anda login sebagai <strong>Pengurus</strong>. Anda memiliki akses penuh untuk mengelola data lingkungan.
            {isAdmin && ' Sebagai Admin, Anda memiliki akses CRUD lengkap.'}
          </p>
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
          <button
            className={`tab-btn ${activeSection === 'warga-view' ? 'active' : ''}`}
            onClick={() => setActiveSection('warga-view')}
          >
            <Users size={18} />
            Lihat Warga
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
          {/* OVERVIEW SECTION */}
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
                    <button className="quick-action-btn" onClick={() => openAddModal('residents')}>
                      <UserPlus size={20} />
                      Tambah Penghuni Baru
                    </button>
                  )}
                  {hasPermission('payments') && (
                    <button className="quick-action-btn" onClick={() => openAddModal('payments')}>
                      <CreditCard size={20} />
                      Catat Pembayaran IPL
                    </button>
                  )}
                  {hasPermission('users') && (
                    <button className="quick-action-btn" onClick={() => setActiveSection('users')}>
                      <Users size={20} />
                      Kelola Akun Warga
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* WARGA VIEW */}
          {activeSection === 'warga-view' && (
            <div className="info-section">
              <div className="readonly-stats">
                <div className="readonly-stat">
                  <Home size={24} />
                  <div className="stat-details">
                    <span className="stat-label">Total Rumah</span>
                    <span className="stat-value">{stats?.totalHouses ?? 0}</span>
                  </div>
                </div>
                <div className="readonly-stat">
                  <ResidentsIcon size={24} />
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

              <div className="profile-card">
                <div className="profile-avatar">
                  {profile?.photoURL ? (
                    <img src={profile?.photoURL ?? ''} alt={profile?.displayName || 'User'} />
                  ) : (
                    <Users size={32} />
                  )}
                </div>
                <div className="profile-info">
                  <h3>{profile?.displayName || 'Pengurus'}</h3>
                  <p>{profile?.email}</p>
                  <div className="profile-badges">
                    {profile?.rt && <span className="badge">RT {profile?.rt}</span>}
                    {profile?.block && <span className="badge">Block {profile?.block}</span>}
                  </div>
                </div>
              </div>

              <div className="updates-card">
                <h3>
                  <Bell size={18} />
                  Pembaruan Terkini
                </h3>
                {stats?.recentUpdates && (stats?.recentUpdates?.length ?? 0) > 0 ? (
                  <ul>
                    {stats?.recentUpdates?.map((update, idx) => (
                      <li key={idx}>{update}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-updates">Belum ada pembaruan terbaru.</p>
                )}
              </div>

              <div className="ipl-info-card">
                <PaymentIcon size={48} />
                <h3>Informasi Iuran IPL</h3>
                <div className="ipl-amount">
                  <span className="label">IPL Bulan Ini</span>
                  <span className="amount">Rp {(stats?.monthlyRevenue ?? 0).toLocaleString()}</span>
                </div>
                <p className="info-text">
                  Untuk informasi lebih lanjut mengenai pembayaran IPL, silakan hubungi Bendahara lingkungan Anda.
                </p>
              </div>
            </div>
          )}

          {/* HOUSES CRUD */}
          {activeSection === 'houses' && hasPermission('houses') && (
            <div className="section-content">
              <div className="crud-bar">
                <span className="crud-label">Data Rumah</span>
                <div className="crud-actions">
                  <button className="btn-action btn-add" onClick={() => openAddModal('houses')}>
                    <Plus size={16} />
                    Tambah
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="loading-state">Memuat data rumah...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Block</th>
                        <th>Nomor</th>
                        <th>Status</th>
                        {isAdmin && <th>Aksi</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {houses.length === 0 ? (
                        <tr><td colSpan={5} className="empty-state">Belum ada data rumah</td></tr>
                      ) : (
                        houses.map((house: any, idx: number) => (
                          <tr key={house.id || idx}>
                            <td>{idx + 1}</td>
                            <td>{house.block || '-'}</td>
                            <td>{house.number || '-'}</td>
                            <td><span className={`status-badge ${house.occupied ? 'occupied' : 'empty'}`}>{house.occupied ? 'Terisi' : 'Kosong'}</span></td>
                            {isAdmin && (
                              <td className="action-cell">
                                <button className="btn-sm btn-edit" title="Edit" onClick={() => openEditModal('houses', house)}><Edit size={14} /></button>
                                <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('houses', house)}><Trash2 size={14} /></button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RESIDENTS CRUD */}
          {activeSection === 'residents' && hasPermission('residents') && (
            <div className="section-content">
              <div className="crud-bar">
                <span className="crud-label">Data Penghuni</span>
                <div className="crud-actions">
                  <button className="btn-action btn-add" onClick={() => openAddModal('residents')}>
                    <Plus size={16} />
                    Tambah
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="loading-state">Memuat data penghuni...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Rumah</th>
                        <th>NIK</th>
                        <th>Telepon</th>
                        {isAdmin && <th>Aksi</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {residents.length === 0 ? (
                        <tr><td colSpan={6} className="empty-state">Belum ada data penghuni</td></tr>
                      ) : (
                        residents.map((resident: any, idx: number) => (
                          <tr key={resident.id || idx}>
                            <td>{idx + 1}</td>
                            <td>{resident.name || resident.nama || '-'}</td>
                            <td>Block {resident.block || '-'}, No {resident.number || '-'}</td>
                            <td>{resident.nik || resident.nik_number || '-'}</td>
                            <td>{resident.phone || resident.telepon || '-'}</td>
                            {isAdmin && (
                              <td className="action-cell">
                                <button className="btn-sm btn-edit" title="Edit" onClick={() => openEditModal('residents', resident)}><Edit size={14} /></button>
                                <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('residents', resident)}><Trash2 size={14} /></button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS CRUD */}
          {activeSection === 'payments' && hasPermission('payments') && (
            <div className="section-content">
              <div className="crud-bar">
                <span className="crud-label">Iuran IPL</span>
                <div className="crud-actions">
                  <button className="btn-action btn-add" onClick={() => openAddModal('payments')}>
                    <Plus size={16} />
                    Tambah
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="loading-state">Memuat data IPL...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Rumah</th>
                        <th>Jumlah</th>
                        <th>Status</th>
                        <th>Tanggal Bayar</th>
                        {isAdmin && <th>Aksi</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr><td colSpan={6} className="empty-state">Belum ada data pembayaran IPL</td></tr>
                      ) : (
                        payments.map((payment: any, idx: number) => (
                          <tr key={payment.id || idx}>
                            <td>{idx + 1}</td>
                            <td>Block {payment.block || '-'}, No {payment.number || '-'}</td>
                            <td>Rp {(payment.amount || payment.jumlah || 0).toLocaleString()}</td>
                            <td><span className={`status-badge ${payment.paid || payment.status === 'paid' ? 'paid' : 'unpaid'}`}>{payment.paid || payment.status === 'paid' ? 'Lunas' : 'Belum Bayar'}</span></td>
                            <td>{payment.paid_at || payment.payment_date || '-'}</td>
                            {isAdmin && (
                              <td className="action-cell">
                                <button className="btn-sm btn-edit" title="Edit" onClick={() => openEditModal('payments', payment)}><Edit size={14} /></button>
                                <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('payments', payment)}><Trash2 size={14} /></button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* USERS MANAGEMENT */}
          {activeSection === 'users' && hasPermission('users') && (
            <div className="section-content">
              <div className="crud-bar">
                <span className="crud-label">Kelola Pengguna</span>
                <div className="crud-actions">
                  <button className="btn-action btn-add" onClick={() => openAddModal('users')}>
                    <Plus size={16} />
                    Tambah
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="loading-state">Memuat data pengguna...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>RT</th>
                        <th>Block</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan={7} className="empty-state">Belum ada data pengguna</td></tr>
                      ) : (
                        users.map((user: any, idx: number) => (
                          <tr key={user.id || user.uid || idx}>
                            <td>{idx + 1}</td>
                            <td>{user.displayName || user.name || '-'}</td>
                            <td>{user.email || '-'}</td>
                            <td><span className={`role-badge-sm ${user.role || 'warga'}`}>{ROLE_DISPLAY_NAMES[user.role as Role] || user.role || 'Warga'}</span></td>
                            <td>{user.rt || '-'}</td>
                            <td>{user.block || '-'}</td>
                            <td className="action-cell">
                              {isAdmin && (
                                <>
                                  <button className="btn-sm btn-edit" title="Edit Role" onClick={() => openEditModal('users', user)}><Shield size={14} /></button>
                                  <button className="btn-sm btn-delete" title="Hapus" onClick={() => openDeleteModal('users', user)}><Trash2 size={14} /></button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CRUDModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        entityType={modalEntity}
        initialData={modalData}
        onSubmit={handleModalSubmit}
        loading={submitLoading}
      />
    </>
  );
};

export default DashboardPengurus;
