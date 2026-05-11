import { useRole } from '../contexts/RoleContext';
import { PERMISSIONS, Role } from '../contexts/RoleContext';

/**
 * Hook untuk permission check CRUD operations
 * Admin automatically has full access
 */
export const useCRUDPermission = () => {
  const { isAdmin, canCreate, canUpdate, canDelete, checkRole, profile } = useRole();

  type EntityType = 'houses' | 'activities' | 'payments';

  const canCreateEntity = (section: EntityType): boolean => {
    if (isAdmin) return true;
    return checkRole(PERMISSIONS[section].create as Role[]);
  };

  const canUpdateEntity = (section: EntityType): boolean => {
    if (isAdmin) return true;
    return checkRole(PERMISSIONS[section].update as Role[]);
  };

  const canDeleteEntity = (section: EntityType): boolean => {
    if (isAdmin) return true;
    return checkRole(PERMISSIONS[section].delete as Role[]);
  };

  return {
    isAdmin,
    canCreate: canCreate || isAdmin,
    canUpdate: canUpdate || isAdmin,
    canDelete: canDelete || isAdmin,
    canCreateEntity,
    canUpdateEntity,
    canDeleteEntity,
    profile
  };
};
