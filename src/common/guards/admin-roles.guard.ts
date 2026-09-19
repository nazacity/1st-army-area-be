import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PersonnelAdminRole } from 'src/modules/personnel-admin/entities/personnel-admin.entity'
import { ADMIN_ROLES_KEY } from 'src/common/decorators/admin-roles.decorator'

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<PersonnelAdminRole[]>(
        ADMIN_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      )

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (user?.role === PersonnelAdminRole.SUPER_ADMIN) {
      return true
    }

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient admin role')
    }

    return true
  }
}
