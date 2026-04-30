import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Houses from './pages/Houses';
import Residents from './pages/Residents';
import Payments from './pages/Payments';
import Agenda from './pages/Agenda';
import Kegiatan from './pages/Kegiatan';
import Komunitas from './pages/Komunitas';
import Aktivitas from './pages/Aktivitas';      // ✅ tambahan
import Postingan from './pages/Postingan';      // ✅ tambahan
import Organisasi from './pages/Organisasi';   // ✅ tambahan
import Produk from './pages/Produk';           // ✅ tambahan
import WargaHome from './pages/WargaHome';     // ✅ untuk /resume
import {
  LayoutDashboard,
  Home,
  Users,
  Wallet,
  FileText,
  Activity,
  MessageSquare,
  Calendar,
  HeartHandshake,
  Building2,
  Bike,
  Package,
  Clock,
} from 'lucide-react';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app-container">
        <aside className="sidebar">
          <h2>RtRwNet</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '-0.5rem 0 1rem 0' }}>
            Graha Harmony 5
          </p>
          <nav>
            <ul className="nav-links">
              {/* Menu Utama */}
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                  <LayoutDashboard size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/houses" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Home size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Data Rumah
                </NavLink>
              </li>
              <li>
                <NavLink to="/residents" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Users size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Penghuni
                </NavLink>
              </li>
              <li>
                <NavLink to="/payments" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Wallet size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Iuran IPL
                </NavLink>
              </li>

              {/* Separator */}
              <li style={{ margin: '1rem 0 0.5rem', paddingLeft: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Dashboard Warga
                </span>
              </li>

              {/* Kategori Warga */}
              <li>
                <NavLink to="/resume" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <FileText size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Resume
                </NavLink>
              </li>
              <li>
                <NavLink to="/pengguna" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Users size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Pengguna
                </NavLink>
              </li>
              <li>
                <NavLink to="/aktivitas" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Activity size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Aktivitas
                </NavLink>
              </li>
              <li>
                <NavLink to="/postingan" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <MessageSquare size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Postingan
                </NavLink>
              </li>
              <li>
                <NavLink to="/agenda" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Calendar size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Agenda
                </NavLink>
              </li>
              <li>
                <NavLink to="/komunitas" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <HeartHandshake size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Komunitas
                </NavLink>
              </li>
              <li>
                <NavLink to="/organisasi" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Building2 size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Organisasi
                </NavLink>
              </li>
              <li>
                <NavLink to="/kegiatan" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Bike size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Kegiatan
                </NavLink>
              </li>
              <li>
                <NavLink to="/produk" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Package size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Produk
                </NavLink>
              </li>
              <li>
                <NavLink to="/update-hari-ini" className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Clock size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Update Hari Ini
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/houses" element={<Houses />} />
            <Route path="/residents" element={<Residents />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/kegiatan" element={<Kegiatan />} />
            <Route path="/komunitas" element={<Komunitas />} />

            {/* Halaman yang sudah diperbaiki */}
            <Route path="/resume" element={<WargaHome />} />
            <Route path="/aktivitas" element={<Aktivitas />} />
            <Route path="/postingan" element={<Postingan />} />
            <Route path="/organisasi" element={<Organisasi />} />
            <Route path="/produk" element={<Produk />} />

            {/* Placeholder untuk halaman yang belum dibuat */}
            <Route path="/pengguna" element={<Dashboard />} />
            <Route path="/update-hari-ini" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;