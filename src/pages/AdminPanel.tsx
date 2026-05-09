// ============================================================
// AdminPanel.tsx — User Role Management (Pengurus CRUD)
// ============================================================

import React, { useState, useEffect } from 'react';
import { useRole, Role, RoleDisplayName } from '../contexts/RoleContext';
import { saveUserProfile, getUserProfile } from '../firebase/config';

const ALL_ROLES = Object.values(Role);

export const AdminPanel: React.FC = () => {
  const { user, hasPermission, loading: roleLoading } = useRole();
  const [users, setUsers] = useState<Array<{ uid: string; email: string; role: Role; roleDisplay: string; name: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.WARGANEGARA);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [searchEmail, setSearchEmail] = useState('');

  // Dynamic admin lookup from Firebase RTDB - queries users with managerial roles
  useEffect(() => {
    const loadUsersFromRTDB = async () => {
      try {
        const { getDatabase, ref, get, DataSnapshot } = await import('firebase/database');
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        
        const snapshot = await get(usersRef);
        
        const usersData: Array<{ uid: string; email: string; role: Role; roleDisplay: string; name: string }> = [];
        snapshot.forEach((child) => {
          const data = child.val() || {};
          const role = data.role as Role;
          if ([Role.KETUA_RW, Role.KETUA_RT].includes(role)) {
            usersData.push({
              uid: child.key as string,
              email: data.email || '',
              name: data.name || data.email || 'Unknown',
              role: role,
              roleDisplay: data.roleDisplay || RoleDisplayName[role] || 'Warga',
            });
          }
        });
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to load users from RTDB:', err);
        setUsers([]);
      }
    };
    loadUsersFromRTDB();
  }, []);

  const handleSaveRole = async () => {
    if (!selectedUser || !user) return;

    setSaveStatus('saving');
    try {
      await saveUserProfile(selectedUser, {
        role: selectedRole,
        roleDisplay: RoleDisplayName[selectedRole],
        updatedBy: user.uid,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.uid === selectedUser
          ? { ...u, role: selectedRole, roleDisplay: RoleDisplayName[selectedRole] }
          : u
      ));

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save role:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleUserSelect = (uid: string) => {
    setSelectedUser(uid);
    const selected = users.find(u => u.uid === uid);
    if (selected) setSelectedRole(selected.role);
  };

  if (roleLoading) return <div className="p-4">Loading...</div>;

  // Check permission - hanya SUPER_ADMIN, KETUA_RW, KETUA_RT yang bisa akses
  if (!hasPermission?.('users') && user?.role !== Role.SUPER_ADMIN && user?.role !== Role.KETUA_RW && user?.role !== Role.KETUA_RT) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold text-lg mb-2">Akses Ditolak</h2>
          <p>Hanya pengurus (Ketua RW/RT) yang dapat mengakses halaman ini.</p>
          <p className="text-sm mt-2">Role Anda: <span className="font-semibold">{user?.role ? RoleDisplayName[user.role] : 'Tidak diketahui'}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel Admin</h1>
        <p className="text-gray-600 mb-6">Kelola role pengguna aplikasi Rt-Rw-Net</p>

        {/* User List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Daftar User</h2>
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.uid}
                onClick={() => handleUserSelect(u.uid)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedUser === u.uid
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-400 mt-1">UID: {u.uid}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.role !== Role.WARGANEGARA
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {u.roleDisplay}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Editor */}
        {selectedUser && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Edit Role</h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Pilih Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ALL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {RoleDisplayName[role]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveRole}
              disabled={saveStatus === 'saving'}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${saveStatus === 'saving'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan Role'}
            </button>

            {saveStatus === 'success' && (
              <p className="mt-3 text-green-600 font-medium">✓ Role berhasil diupdate!</p>
            )}
            {saveStatus === 'error' && (
              <p className="mt-3 text-red-600 font-medium">✗ Gagal menyimpan role</p>
            )}
          </div>
        )}

        {/* Role Legend */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Keterangan Role</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-green-700 mb-2">Pengurus (Bisa CRUD):</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Super Admin</li>
                <li>• Ketua RW</li>
                <li>• Ketua RT</li>
                <li>• Sekretaris</li>
                <li>• Bendahara</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Warga (Hanya Baca):</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Warga</li>
                <li>• Karang Taruna</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
