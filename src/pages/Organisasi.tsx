import React, { useEffect, useState } from 'react';
import { getOrganizations } from '../api';
import { Building2, Search, Users, Phone, Mail, Badge } from 'lucide-react';

// ✅ Definisikan tipe data
interface Member {
  name: string;
  position: string;
  phone?: string;
  email?: string;
}

interface Organization {
  name: string;
  description: string;
  members?: Member[];
}

const Organisasi = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]); // ✅ tipe state
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrganizations()
      .then((data: Organization[]) => setOrganizations(data)) // ✅ parameter bertipe
      .catch(() => setOrganizations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Building2 size={32} />
        <p>Memuat organisasi...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Organisasi</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Struktur organisasi & kepengurusan Graha Harmony 5
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Cari organisasi atau pengurus..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem 0.6rem 2.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Struktur Organisasi */}
      {organizations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {organizations
            .filter((org) =>
              org.name?.toLowerCase().includes(search.toLowerCase()) ||
              org.members?.some((member) => member.name?.toLowerCase().includes(search.toLowerCase()))
            )
            .map((org, idx) => (
              <div key={idx} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={28} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{org.name}</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {org.description}
                    </p>
                  </div>
                </div>

                {/* Daftar Pengurus */}
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  <Users size={16} /> Daftar Pengurus
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {org.members?.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        background: 'var(--bg-secondary)',
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: '#8b5cf620',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#8b5cf6',
                          flexShrink: 0,
                        }}
                      >
                        {member.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.9rem' }}>{member.name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                          <Badge size={12} color="#8b5cf6" />
                          <span style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 600 }}>
                            {member.position}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {member.phone && (
                          <a href={`tel:${member.phone}`} style={{ color: 'var(--text-muted)' }}>
                            <Phone size={16} />
                          </a>
                        )}
                        {member.email && (
                          <a href={`mailto:${member.email}`} style={{ color: 'var(--text-muted)' }}>
                            <Mail size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Belum ada data organisasi.</p>
        </div>
      )}
    </div>
  );
};

export default Organisasi;