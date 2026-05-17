import React, { useEffect, useState } from 'react';
import { housesApi } from '../api';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Houses = () => {
  const { isAdmin } = useAuth();
  const [houses, setHouses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHouse, setEditingHouse] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [formData, setFormData] = useState({ block: '', number: '', owner_name: '', address: '', ipl_amount: 100000, status: 'vacant', phone: '', email: '' });

  const fetchHouses = () => housesApi.getAll().then(setHouses);

  useEffect(() => {
    fetchHouses();
  }, []);

  const resetForm = () => {
    setFormData({ block: '', number: '', owner_name: '', address: '', ipl_amount: 100000, status: 'vacant', phone: '', email: '' });
    setEditingHouse(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingHouse ? housesApi.update(editingHouse.id, formData) : housesApi.create(formData);
    action.then(() => {
      resetForm();
      fetchHouses();
    });
  };

  const handleEdit = (house: any) => {
    setEditingHouse(house);
    setFormData({
      block: house.block,
      number: house.number,
      owner_name: house.owner_name || '',
      address: house.address || '',
      ipl_amount: house.ipl_amount || 100000,
      status: house.status || 'vacant',
      phone: house.phone || '',
      email: house.email || ''
    });
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await housesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchHouses();
    } catch (error) {
      // silent error - UI stays clean
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Data Rumah</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditingHouse(null); setShowForm(!showForm); }}>
            <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Tambah Rumah
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="card">
          <h3>{editingHouse ? 'Edit Rumah' : 'Tambah Rumah Baru'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label" htmlFor="house-block">Blok</label>
              <input 
                id="house-block"
                type="text" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.block} 
                onChange={e => setFormData({...formData, block: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="label" htmlFor="house-number">Nomor</label>
              <input 
                id="house-number"
                type="text" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.number} 
                onChange={e => setFormData({...formData, number: e.target.value})} 
                required 
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label" htmlFor="house-address">Alamat Lengkap</label>
              <input 
                id="house-address"
                type="text" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
              />
            </div>
            <div>
              <label className="label" htmlFor="house-ipl">Iuran IPL (Rp)</label>
              <input 
                id="house-ipl"
                type="number" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.ipl_amount} 
                onChange={e => setFormData({...formData, ipl_amount: parseInt(e.target.value)})} 
                required 
              />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
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
              <th>Blok/No</th>
              <th>Alamat</th>
              <th>Status</th>
              <th>IPL</th>
              {isAdmin && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {houses.map(house => (
              <tr key={house.id}>
                <td><strong>{house.block} / {house.number}</strong></td>
                <td>{house.address || '-'}</td>
                <td>
                  <span className={`status-badge status-${(house.status || '').toLowerCase()}`}>
                    {house.status || '-'}
                  </span>
                </td>
                <td>Rp {(house.ipl_amount || 0).toLocaleString()}</td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-sm" onClick={() => handleEdit(house)} style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-sm" onClick={() => setDeleteTarget({ id: house.id, label: `${house.block}/${house.number}` })} style={{ color: 'var(--danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {houses.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Belum ada data rumah.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Konfirmasi Hapus</h3>
            <p>Yakin hapus rumah <strong>{deleteTarget.label}</strong>?</p>
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

export default Houses;
