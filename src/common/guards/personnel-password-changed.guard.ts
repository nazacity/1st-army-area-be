import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'

@Injectable()
export class PersonnelPasswordChangedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest()

    if (user && user.isChangePassword === false) {
      throw new ForbiddenException('MUST_CHANGE_PASSWORD')
    }

    return true
  }
}
