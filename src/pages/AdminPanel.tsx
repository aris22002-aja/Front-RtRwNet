// ============================================================
// AdminPanel.tsx — User Role Management (Pengurus CRUD)
// Follows: firebase/SKILL.md + RoleContext pattern
// ============================================================

import React, { useState, useEffect } from 'react';
import { useRole, ROLE_DISPLAY_NAMES, PERMISSIONS, Role } from '../contexts/RoleContext';
import { saveUserProfile, getUserProfile } from '../firebase/config';
import { Shield, Users, Save, Search, AlertCircle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { profile, isAdmin, canUpdate, canDelete, loading } = useRole();
  const [users, setUsers] = useState<Array<{
    uid: string;
    email: string;
    role: Role;
    roleDisplay: string;
    name: string;
  }>>([]);
  const [selectedUserUid, setSelectedUserUid] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>('warga');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [searchEmail, setSearchEmail] = useState('');

  // Role options for dropdown
  const ROLE_OPTIONS: Role[] = [
    'admin',
    'kepala_lingkungan',
    'ketua_rw',
    'ketua_rt',
    'rt',
    'rw',
    'warga'
  ];

  // Load users with managerial roles from Firebase RTDB
  useEffect(() => {
    const loadUsersFromRTDB = async () => {
      try {
        const { getDatabase, ref, get } = await import('firebase/database');
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        
        const snapshot = await get(usersRef);
        
        const usersData: Array<{
          uid: string;
          email: string;
          role: Role;
          roleDisplay: string;
          name: string;
        }> = [];
        
        snapshot.forEach((child: any) => {
          const data = child.val() || {};
          const role = (data.role as Role) || 'warga';
          const roleDisplay = ROLE_DISPLAY_NAMES[role] || 'Warga';
          
          // Show users with managerial roles
          if (['ketua_rw', 'ketua_rt', 'rt', 'rw'].includes(role)) {
            usersData.push({
              uid: child.key as string,
              email: data.email || '',
              name: data.displayName || data.email || 'Unknown',
              role: role,
              roleDisplay: roleDisplay,
            });
          }
        });
        
        setUsers(usersData);
      } catch (err) {
        console.error('[AdminPanel] Load users error:', err);
        setUsers([]);
      }
    };
    
    loadUsersFromRTDB();
  }, []);

  // Save role update to Firebase RTDB
  const handleUpdateRole = async () => {
    if (!selectedUserUid || !selectedRole) return;
    
    setSaveStatus('saving');
    try {
      await saveUserProfile(selectedUserUid, {
        role: selectedRole,
        roleDisplay: ROLE_DISPLAY_NAMES[selectedRole],
        updatedAt: new Date().toISOString(),
        updatedBy: profile?.uid,
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('[AdminPanel] Update role error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    u.name.toLowerCase().includes(searchEmail.toLowerCase())
  );

  // Check permissions
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Memuat...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
        <p>Anda tidak memiliki akses ke panel ini.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '2rem'
      }}>
        <Shield size={32} style={{ color: '#667eea' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Panel Admin</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Kelola peran pengguna ({ROLE_DISPLAY_NAMES[profile?.role as Role] || 'Admin'})
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <Search 
          size={18} 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }} 
        />
        <input
          type="text"
          placeholder="Cari email atau nama..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 42px',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '0.95rem',
          }}
        />
      </div>

      {/* User List */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Users size={20} style={{ color: '#667eea' }} />
          <span style={{ fontWeight: '600' }}>Daftar Pengguna</span>
          <span style={{ 
            background: '#667eea', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: '12px',
            fontSize: '0.75rem'
          }}>
            {filteredUsers.length}
          </span>
        </div>

        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {filteredUsers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
              {searchEmail ? 'Tidak ada hasil' : 'Tidak ada data'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>
                    NAMA
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>
                    EMAIL
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>
                    PERAN
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#6b7280' }}>
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.uid}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      background: selectedUserUid === user.uid ? '#f0f9ff' : 'transparent'
                    }}
                    onClick={() => {
                      setSelectedUserUid(user.uid);
                      setSelectedRole(user.role);
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>{user.name}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {user.roleDisplay}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserUid(user.uid);
                          setSelectedRole(user.role);
                        }}
                        style={{
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedUserUid && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '1.5rem',
          width: '320px',
          zIndex: 100
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Ubah Peran</h3>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '0.95rem',
              marginBottom: '1rem'
            }}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {ROLE_DISPLAY_NAMES[role]}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleUpdateRole}
              disabled={saveStatus === 'saving'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: saveStatus === 'success' ? '#059669' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <Save size={18} />
              {saveStatus === 'saving' ? 'Menyimpan...' : saveStatus === 'success' ? 'Tersimpan!' : 'Simpan'}
            </button>
            <button
              onClick={() => setSelectedUserUid('')}
              style={{
                padding: '12px 16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
          </div>

          {saveStatus === 'error' && (
            <p style={{ color: '#dc2626', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Gagal menyimpan. Coba lagi.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
