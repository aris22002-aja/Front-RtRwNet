import React, { useEffect, useState } from 'react';
import { getAgendas } from '../api';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const Agenda = () => {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  useEffect(() => {
    getAgendas({ month: selectedMonth + 1, year: selectedYear })
      .then((data) => setAgendas(data))
      .catch(() => setAgendas([]))
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Calendar size={32} />
        <p>Memuat agenda...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'akan datang':
        return '#0ea5e9';
      case 'sedang berlangsung':
        return '#10b981';
      case 'selesai':
        return '#6b7280';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Agenda Kegiatan</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Jadwal kegiatan warga Graha Harmony 5
        </p>
      </div>

      {/* Navigasi Bulan */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
          {monthNames[selectedMonth]} {selectedYear}
        </h2>
        <button
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Daftar Agenda */}
      {agendas.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {agendas.map((agenda, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }}>
              {/* Tanggal */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '60px',
                  height: '60px',
                  background: 'var(--primary)',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{agenda.day}</span>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  {monthNames[selectedMonth]?.substring(0, 3)}
                </span>
              </div>
              {/* Detail Agenda */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0 }}>{agenda.title}</h3>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      background: `${getStatusColor(agenda.status)}20`,
                      color: getStatusColor(agenda.status),
                      fontWeight: 600,
                    }}
                  >
                    {agenda.status?.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                  {agenda.description}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> {agenda.time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> {agenda.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Tidak ada agenda untuk bulan {monthNames[selectedMonth]} {selectedYear}.</p>
        </div>
      )}
    </div>
  );
};

export default Agenda;
