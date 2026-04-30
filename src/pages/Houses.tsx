import React, { useEffect, useState } from 'react';
import { housesApi } from '../api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const Houses = () => {
  const [houses, setHouses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ block: '', number: '', address: '', ipl_amount: 100000 });

  const fetchHouses = () => housesApi.getAll().then(setHouses);

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    housesApi.create(formData).then(() => {
      setShowForm(false);
      fetchHouses();
      setFormData({ block: '', number: '', address: '', ipl_amount: 100000 });
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus rumah ini?')) {
      housesApi.delete(id).then(fetchHouses);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Data Rumah</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Tambah Rumah
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Tambah Rumah Baru</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Blok</label>
              <input 
                type="text" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.block} 
                onChange={e => setFormData({...formData, block: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="label">Nomor</label>
              <input 
                type="text" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.number} 
                onChange={e => setFormData({...formData, number: e.target.value})} 
                required 
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Alamat Lengkap</label>
              <input 
                type="text" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
              />
            </div>
            <div>
              <label className="label">Iuran IPL (Rp)</label>
              <input 
                type="number" 
                className="btn" style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.ipl_amount} 
                onChange={e => setFormData({...formData, ipl_amount: parseInt(e.target.value)})} 
                required 
              />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Simpan</button>
              <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ marginLeft: '0.5rem' }}>Batal</button>
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
              <th>Aksi</th>
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
      <td>Rp {house.ipl_amount.toLocaleString()}</td>
      <td>
        <button className="btn btn-sm" onClick={() => handleDelete(house.id)} style={{ color: 'var(--danger)' }}>
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  ))}
  {houses.length === 0 && (
    <tr>
      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        Belum ada data rumah.
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default Houses;
