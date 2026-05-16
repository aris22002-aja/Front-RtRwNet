import React, { useEffect, useState } from 'react';
import { residentsApi, housesApi } from '../api';
import { UserPlus, Trash2, Edit2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Tipe data penduduk
interface Resident {
  id: number;
  name: string;
  house_id: number;
  phone?: string;
  ktp_number?: string;
  is_owner: boolean;
  move_in_date: string;
  block?: string;   // dari join
  number?: string;  // dari join
}

// Tipe data rumah
interface House {
  id: number;
  block: string;
  number: string;
  status: string;
}

const Residents = () => {
  const { isAdmin } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [formData, setFormData] = useState({
    house_id: 0,
    name: '',
    phone: '',
    ktp_number: '',
    is_owner: true,
    move_in_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = () => {
    residentsApi.getAll().then((data) => {
      const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id as number,
        name: item.name as string,
        house_id: item.house_id as number,
        phone: item.phone as string | undefined,
        ktp_number: item.ktp_number as string | undefined,
        is_owner: item.is_owner as boolean,
        move_in_date: item.move_in_date as string,
        block: item.block as string | undefined,
        number: item.number as string | undefined,
      }));
      setResidents(mapped);
    });
    housesApi.getAll().then((data) => setHouses(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({ house_id: 0, name: '', phone: '', ktp_number: '', is_owner: true, move_in_date: new Date().toISOString().split('T')[0] });
    setEditingResident(null);
    setShowForm(false);
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({
      house_id: resident.house_id,
      name: resident.name,
      phone: resident.phone || '',
      ktp_number: resident.ktp_number || '',
      is_owner: resident.is_owner,
      move_in_date: resident.move_in_date,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingResident ? residentsApi.update(editingResident.id, formData) : residentsApi.create(formData);
    action.then(() => { resetForm(); fetchData(); });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await residentsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchData();
    } catch (error) { /* silent */ }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Data Penghuni</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditingResident(null); setShowForm(!showForm); }}>
            <UserPlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Tambah Penghuni
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="card">
          <h3>{editingResident ? 'Edit Penghuni' : 'Tambah Penghuni Baru'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
            <div>
              <label className="label">Nama Lengkap</label>
              <input type="text" className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Rumah (Blok/No)</label>
                <select className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }} value={formData.house_id} onChange={e => setFormData({...formData, house_id: parseInt(e.target.value)})} required>
                  <option value={0}>-- Pilih Rumah --</option>
                  {houses.map(h => <option key={h.id} value={h.id}>{h.block} / {h.number}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }} value={formData.is_owner ? 'owner' : 'tenant'} onChange={e => setFormData({...formData, is_owner: e.target.value === 'owner'})}>
                  <option value="owner">Pemilik</option>
                  <option value="tenant">Penyewa</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">No. Telepon</label>
                <input type="text" className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="label">No. KTP</label>
                <input type="text" className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }} value={formData.ktp_number} onChange={e => setFormData({...formData, ktp_number: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Tanggal Masuk</label>
              <input type="date" className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }} value={formData.move_in_date} onChange={e => setFormData({...formData, move_in_date: e.target.value})} required />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Simpan</button>
              <button type="button" className="btn" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Rumah</th>
              <th>Status</th>
              <th>Telepon</th>
              {isAdmin && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {residents.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.block} / {r.number}</td>
                <td>
                  <span className={`status-badge status-${r.is_owner ? 'owned' : 'tenant'}`}>
                    {r.is_owner ? 'Pemilik' : 'Penyewa'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                    {r.phone || '-'}
                  </div>
                </td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-sm" onClick={() => handleEdit(r)} style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-sm" onClick={() => setDeleteTarget({ id: r.id, name: r.name })} style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {residents.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Belum ada data penghuni.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Konfirmasi Hapus</h3>
            <p>Yakin hapus penghuni <strong>{deleteTarget.name}</strong>?</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDeleteTarget(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Residents;