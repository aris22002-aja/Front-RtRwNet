import React, { useEffect, useState } from 'react';
import { residentsApi, housesApi } from '../api';
import { UserPlus, Trash2, Phone } from 'lucide-react';

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
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    house_id: '',
    name: '',
    phone: '',
    ktp_number: '',
    is_owner: true,
    move_in_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = () => {
    residentsApi.getAll().then(setResidents);
    housesApi.getAll().then((data: House[]) =>
      setHouses(data.filter((h) => h.status === 'vacant'))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    residentsApi.create(formData).then(() => {
      setShowForm(false);
      fetchData();
      setFormData({
        house_id: '',
        name: '',
        phone: '',
        ktp_number: '',
        is_owner: true,
        move_in_date: new Date().toISOString().split('T')[0],
      });
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus penghuni ini?')) {
      residentsApi.delete(id).then(fetchData);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Data Penghuni (Kepala Keluarga)</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <UserPlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Tambah Penghuni
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Pendaftaran Penghuni Baru</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Pilih Rumah (Kosong)</label>
              <select
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.house_id}
                onChange={(e) => setFormData({ ...formData, house_id: e.target.value })}
                required
              >
                <option value="">-- Pilih Rumah --</option>
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.block} / {house.number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nama Lengkap</label>
              <input
                type="text"
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">No. HP</label>
              <input
                type="text"
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">No. KTP</label>
              <input
                type="text"
                className="btn"
                style={{ width: '100%', border: '1px solid var(--border)', textAlign: 'left' }}
                value={formData.ktp_number}
                onChange={(e) => setFormData({ ...formData, ktp_number: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Daftarkan
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setShowForm(false)}
                style={{ marginLeft: '0.5rem' }}
              >
                Batal
              </button>
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
              <th>Kontak</th>
              <th>Tgl Masuk</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident, idx) => (
              <tr key={resident.id ?? idx}>
                <td>
                  <strong>{resident.name}</strong>
                </td>
                <td>
                  {resident.block} / {resident.number}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="var(--text-muted)" />
                    {resident.phone || '-'}
                  </div>
                </td>
                <td>{resident.move_in_date}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleDelete(resident.id)}
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {residents.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Belum ada data penghuni.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Residents;