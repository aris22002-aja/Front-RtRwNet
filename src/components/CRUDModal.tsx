// ============================================================
// CRUDModal.tsx — Reusable CRUD Modal Component
// Admin CRUD Interface for DashboardPengurus
// ============================================================

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, AlertTriangle } from 'lucide-react';

export type CrudAction = 'add' | 'edit' | 'delete';
export type EntityType = 'houses' | 'residents' | 'payments' | 'users';

interface CRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: CrudAction;
  entityType: EntityType;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const ENTITY_LABELS: Record<EntityType, string> = {
  houses: 'Rumah',
  residents: 'Penghuni',
  payments: 'Iuran IPL',
  users: 'Pengguna',
};

// Form field definitions per entity type
const FORM_FIELDS: Record<EntityType, Array<{ key: string; label: string; type: string; required?: boolean }>> = {
  houses: [
    { key: 'address', label: 'Alamat', type: 'text', required: true },
    { key: 'houseNumber', label: 'Nomor Rumah', type: 'text', required: true },
    { key: 'rt', label: 'RT', type: 'text', required: true },
    { key: 'rw', label: 'RW', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'select', required: true },
    { key: 'ownerName', label: 'Nama Pemilik', type: 'text' },
  ],
  residents: [
    { key: 'name', label: 'Nama Lengkap', type: 'text', required: true },
    { key: 'nik', label: 'NIK', type: 'text', required: true },
    { key: 'phone', label: 'Telepon', type: 'text' },
    { key: 'houseId', label: 'ID Rumah', type: 'text', required: true },
    { key: 'relation', label: 'Hubungan', type: 'select' },
    { key: 'occupation', label: 'Pekerjaan', type: 'text' },
  ],
  payments: [
    { key: 'residentId', label: 'ID Penghuni', type: 'text', required: true },
    { key: 'houseId', label: 'ID Rumah', type: 'text', required: true },
    { key: 'amount', label: 'Jumlah', type: 'number', required: true },
    { key: 'month', label: 'Bulan', type: 'number', required: true },
    { key: 'year', label: 'Tahun', type: 'number', required: true },
    { key: 'status', label: 'Status', type: 'select', required: true },
    { key: 'dueDate', label: 'Jatuh Tempo', type: 'date' },
  ],
  users: [
    { key: 'name', label: 'Nama', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'role', label: 'Peran', type: 'select', required: true },
    { key: 'phone', label: 'Telepon', type: 'text' },
  ],
};

export const CRUDModal: React.FC<CRUDModalProps> = ({
  isOpen,
  onClose,
  action,
  entityType,
  initialData,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const fields = FORM_FIELDS[entityType];
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} wajib diisi`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('[CRUDModal] Submit error:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await onSubmit(initialData);
      onClose();
    } catch (err) {
      console.error('[CRUDModal] Delete error:', err);
    }
  };

  const getActionTitle = () => {
    const label = ENTITY_LABELS[entityType];
    switch (action) {
      case 'add': return `Tambah ${label}`;
      case 'edit': return `Edit ${label}`;
      case 'delete': return `Hapus ${label}`;
    }
  };

  const fields = FORM_FIELDS[entityType];

  return (
    <div className="crud-modal-overlay" onClick={onClose}>
      <div className="crud-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="crud-modal-header">
          <h3>{getActionTitle()}</h3>
          <button className="crud-modal-close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="crud-modal-body">
          {action === 'delete' ? (
            <div className="crud-delete-confirm">
              <AlertTriangle size={48} color="#dc2626" />
              <p>Apakah Anda yakin ingin menghapus data ini?</p>
              <p className="crud-delete-detail">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          ) : (
            <div className="crud-form-grid">
              {fields.map((field) => (
                <div key={field.key} className={`crud-form-field ${field.type === 'select' ? 'select' : ''}`}>
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={errors[field.key] ? 'error' : ''}
                      disabled={loading}
                    >
                      <option value="">Pilih...</option>
                      {field.key === 'status' && entityType === 'houses' && (
                        <>
                          <option value="occupied">Terisi</option>
                          <option value="empty">Kosong</option>
                        </>
                      )}
                      {field.key === 'status' && entityType === 'payments' && (
                        <>
                          <option value="paid">Lunas</option>
                          <option value="pending">Menunggu</option>
                          <option value="overdue">Jatuh Tempo</option>
                        </>
                      )}
                      {field.key === 'relation' && (
                        <>
                          <option value="owner">Pemilik</option>
                          <option value="tenant">Penyewa</option>
                          <option value="family">Keluarga</option>
                        </>
                      )}
                      {field.key === 'role' && (
                        <>
                          <option value="admin">Admin</option>
                          <option value="kepala_lingkungan">Kepala Lingkungan</option>
                          <option value="ketua_rw">Ketua RW</option>
                          <option value="ketua_rt">Ketua RT</option>
                          <option value="rt">RT</option>
                          <option value="rw">RW</option>
                          <option value="warga">Warga</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={errors[field.key] ? 'error' : ''}
                      disabled={loading}
                      placeholder={`Masukkan ${field.label.toLowerCase()}`}
                    />
                  )}
                  
                  {errors[field.key] && (
                    <span className="crud-error">{errors[field.key]}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="crud-modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Batal
            </button>
            
            {action === 'delete' ? (
              <button type="button" className="btn-danger" onClick={handleDelete} disabled={loading}>
                <Trash2 size={16} />
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            ) : (
              <button type="submit" className="btn-save" disabled={loading}>
                <Save size={16} />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        .crud-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .crud-modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 560px;
          max-height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease-out;
        }

        .crud-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .crud-modal-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .crud-modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .crud-modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .crud-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .crud-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .crud-form-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .crud-form-field label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .crud-form-field .required {
          color: #dc2626;
          margin-left: 2px;
        }

        .crud-form-field input,
        .crud-form-field select {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.2s;
          background: white;
        }

        .crud-form-field input:focus,
        .crud-form-field select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .crud-form-field input.error,
        .crud-form-field select.error {
          border-color: #dc2626;
        }

        .crud-form-field input:disabled,
        .crud-form-field select:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }

        .crud-error {
          font-size: 0.75rem;
          color: #dc2626;
        }

        .crud-delete-confirm {
          text-align: center;
          padding: 2rem 1rem;
        }

        .crud-delete-confirm p {
          margin: 1rem 0 0.5rem;
          font-size: 1rem;
          color: #374151;
        }

        .crud-delete-detail {
          color: #6b7280 !important;
          font-size: 0.875rem !important;
        }

        .crud-modal-footer {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
          margin-top: 1.5rem;
        }

        .btn-cancel,
        .btn-save,
        .btn-danger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-save {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-danger {
          background: #dc2626;
          color: white;
        }

        .btn-danger:hover {
          background: #b91c1c;
        }

        .btn-cancel:disabled,
        .btn-save:disabled,
        .btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .crud-form-grid {
            grid-template-columns: 1fr;
          }
          
          .crud-modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }
        }
      `}</style>
    </div>
  );
};

export default CRUDModal;
