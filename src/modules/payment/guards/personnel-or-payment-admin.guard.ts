import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PersonnelAdminRole } from 'src/modules/personnel-admin/entities/personnel-admin.entity'

// อนุญาต personnel (เจ้าของ — ตรวจ ownership ใน service) หรือ admin role personnel/super_admin
// ใช้คู่กับ AuthGuard(['personnelJwt', 'adminJwt'])
@Injectable()
export class PersonnelOrPaymentAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest()

    if (!user) {
      throw new UnauthorizedException()
    }

    if (user.role) {
      if (
        user.role === PersonnelAdminRole.SUPER_ADMIN ||
        user.role === PersonnelAdminRole.PERSONNEL
      ) {
        return true
      }

      throw new ForbiddenException('Insufficient admin role')
    }

    return true
  }
}
