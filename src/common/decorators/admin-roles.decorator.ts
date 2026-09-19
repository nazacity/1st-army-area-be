import { SetMetadata } from '@nestjs/common'
import { PersonnelAdminRole } from 'src/modules/personnel-admin/entities/personnel-admin.entity'

export const ADMIN_ROLES_KEY = 'adminRoles'

export const AdminRoles = (...roles: PersonnelAdminRole[]) =>
  SetMetadata(ADMIN_ROLES_KEY, roles)
