// ============================================================
// Permission Guards - CRUD Button Visibility
// ============================================================

import React from 'react';
import { useRole, Role } from '../contexts/RoleContext';
import { Pencil, Trash, Plus, Eye } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { role } = useRole();

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Create Button
interface CreateButtonProps {
  allowedRoles?: Role[];
  onClick?: () => void;
  className?: string;
  label?: string;
}

export const CreateButton: React.FC<CreateButtonProps> = ({
  allowedRoles = ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt', 'rt', 'rw'],
  onClick,
  className = '',
  label = 'Tambah'
}) => {
  const { canCreate } = useRole();

  if (!canCreate) return null;

  return (
    <button
      onClick={onClick}
      className={`btn btn-primary ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
      }}
    >
      <Plus size={18} />
      {label}
    </button>
  );
};

// Edit Button
interface EditButtonProps {
  allowedRoles?: Role[];
  onClick?: () => void;
  className?: string;
}

export const EditButton: React.FC<EditButtonProps> = ({
  allowedRoles = ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt'],
  onClick,
  className = '',
}) => {
  const { canUpdate } = useRole();

  if (!canUpdate) return null;

  return (
    <button
      onClick={onClick}
      className={`btn btn-edit ${className}`}
      style={{
        padding: '8px',
        background: '#f3f4f6',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#667eea',
      }}
      title="Edit"
    >
      <Pencil size={16} />
    </button>
  );
};

// Delete Button
interface DeleteButtonProps {
  allowedRoles?: Role[];
  onClick?: () => void;
  className?: string;
  confirmMessage?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  allowedRoles = ['admin', 'kepala_lingkungan'],
  onClick,
  className = '',
  confirmMessage = 'Yakin hapus?'
}) => {
  const { canDelete } = useRole();

  if (!canDelete) return null;

  const handleClick = () => {
    if (window.confirm(confirmMessage)) {
      onClick?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`btn btn-delete ${className}`}
      style={{
        padding: '8px',
        background: '#fef2f2',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#dc2626',
      }}
      title="Delete"
    >
      <Trash size={16} />
    </button>
  );
};

// View Button (always visible for authenticated users)
interface ViewButtonProps {
  onClick?: () => void;
  className?: string;
}

export const ViewButton: React.FC<ViewButtonProps> = ({
  onClick,
  className = '',
}) => {
  const { user } = useRole();

  if (!user) return null;

  return (
    <button
      onClick={onClick}
      className={`btn btn-view ${className}`}
      style={{
        padding: '8px',
        background: '#f0fdf4',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        color: '#059669',
      }}
      title="View"
    >
      <Eye size={16} />
    </button>
  );
};

// Action Buttons Group
interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onView,
  showEdit = true,
  showDelete = true,
  showView = true,
}) => {
  const { user } = useRole();

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {showView && user && <ViewButton onClick={onView} />}
      {showEdit && <EditButton onClick={onEdit} />}
      {showDelete && <DeleteButton onClick={onDelete} />}
    </div>
  );
};

// Table Row with Permissions
interface PermissionTableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export const PermissionTableRow: React.FC<PermissionTableRowProps> = ({
  children,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <tr>
      {children}
      <td>
        <ActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      </td>
    </tr>
  );
};
