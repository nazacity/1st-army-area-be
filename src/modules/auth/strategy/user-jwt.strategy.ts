import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtConfigService } from '../../config/jwt'
import { UserService } from 'src/modules/user/user.service'

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'userJwt') {
  constructor(
    private readonly jwtConfigService: JwtConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConfigService.secret,
    })
  }

  async validate(payload: any) {
    try {
      const userInfo = await this.userService.getUserById(payload.id)

      return userInfo
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
