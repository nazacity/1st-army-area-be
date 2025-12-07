import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthTokenModel } from './model/auth-token.model'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(private readonly jwtService: JwtService) {}

  public async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token)

      return payload
    } catch {
      throw new UnauthorizedException()
    }
  }

  public async getNewToken(payload: any): Promise<AuthTokenModel> {
    const accessToken = await this.jwtService.signAsync(payload)

    return { accessToken } as AuthTokenModel
  }
}
