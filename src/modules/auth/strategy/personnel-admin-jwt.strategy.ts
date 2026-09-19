import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtConfigService } from '../../config/jwt'
import { PersonnelAdminService } from 'src/modules/personnel-admin/personnel-admin.service'

@Injectable()
export class PersonnelAdminJwtStrategy extends PassportStrategy(
  Strategy,
  'personnelAdminJwt',
) {
  constructor(
    private readonly jwtConfigService: JwtConfigService,
    private readonly personnelAdminService: PersonnelAdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConfigService.secret,
    })
  }

  async validate(payload: any) {
    try {
      const userInfo = await this.personnelAdminService.getPersonnelAdminById(
        payload.id,
      )

      if (!userInfo || !userInfo.isActive) {
        throw new UnauthorizedException()
      }

      return userInfo
    } catch {
      throw new UnauthorizedException()
    }
  }
}
