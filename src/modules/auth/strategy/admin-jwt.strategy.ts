import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtConfigService } from '../../config/jwt'
import { AdminService } from 'src/modules/admin/admin.service'

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'adminJwt') {
  constructor(
    private readonly jwtConfigService: JwtConfigService,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConfigService.secret,
    })
  }

  async validate(payload: any) {
    try {
      const userInfo = await this.adminService.getAdminById(payload.id)

      return userInfo
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
