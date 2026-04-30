import React, { useEffect, useState } from 'react';
import { paymentsApi } from '../api';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Fungsi fetch yang mengembalikan data (untuk digunakan ulang)
  const fetchPayments = async (): Promise<any[]> => {
    try {
      const data = await paymentsApi.getAll(month, year);
      setPayments(data);
      return data;
    } catch (error) {
      console.error(error);
      setPayments([]);                    // reset ke array kosong saat gagal
      return [];
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [month, year]);

  const handleGenerate = async () => {
    if (confirm(`Generate tagihan IPL untuk periode ${month}/${year}?`)) {
      try {
        await paymentsApi.generate(month, year);
        const data = await fetchPayments();  // ambil data terbaru
        // Ekspor hanya jika ada data
        if (data.length > 0) {
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
          XLSX.writeFile(workbook, `payments_${month}_${year}.xlsx`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleExport = () => {
    if (!payments || payments.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(payments);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    XLSX.writeFile(workbook, `payments_${month}_${year}.xlsx`);
  };

  const handlePay = async (id: number) => {
    if (confirm('Tandai tagihan ini sebagai lunas?')) {
      try {
        await paymentsApi.pay(id, {});
        await fetchPayments();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Iuran Pengelolaan Lingkungan (IPL)</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select className="btn" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="btn" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleGenerate}>Generate Tagihan</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Rumah</th>
              <th>Periode</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tgl Bayar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map(payment => (
              <tr key={payment.id}>
                <td><strong>{payment.block} / {payment.number}</strong></td>
                <td><Calendar size={16} /> {payment.month}/{payment.year}</td>
                <td>Rp {payment.amount?.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${(payment.status || '').toLowerCase()}`}>
                    {payment.status === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {payment.status === 'paid' ? ' Lunas' : ' Belum Bayar'}
                  </span>
                </td>
                <td>{payment.paid_date || '-'}</td>
                <td>
                  {payment.status === 'unpaid' && (
                    <button className="btn btn-success" onClick={() => handlePay(payment.id)}>Bayar</button>
                  )}
                </td>
              </tr>
            ))}
            {payments?.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Belum ada data pembayaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
