import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtConfigService } from '../../config/jwt'
import { PersonnelService } from 'src/modules/personnel/personnel.service'

@Injectable()
export class PersonnelJwtStrategy extends PassportStrategy(
  Strategy,
  'personnelJwt',
) {
  constructor(
    private readonly jwtConfigService: JwtConfigService,
    private readonly personnelService: PersonnelService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConfigService.secret,
    })
  }

  async validate(payload: any) {
    try {
      const userInfo = await this.personnelService.getPersonnelById(payload.id)

      return userInfo
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
