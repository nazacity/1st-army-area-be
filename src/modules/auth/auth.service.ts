import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { AuthTokenModel } from './model/auth-token.model'

export interface ILineProfile {
  lineUserId: string
  displayName: string
  pictureUrl?: string
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

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

  // แลก authorization code เป็น LINE profile — secret อยู่ฝั่ง server เท่านั้น
  public async exchangeLineCode(code: string): Promise<ILineProfile> {
    const clientId = process.env.LINE_CLIENT_ID
    const clientSecret = process.env.LINE_CLIENT_SECRET
    const redirectUri = process.env.LINE_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('LINE env is not configured (LINE_CLIENT_ID / LINE_CLIENT_SECRET / LINE_REDIRECT_URI)')
    }

    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString()

      const tokenRes = await firstValueFrom(
        this.httpService.post('https://api.line.me/oauth2/v2.1/token', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      )

      const profileRes = await firstValueFrom(
        this.httpService.get('https://api.line.me/v2/profile', {
          headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
        }),
      )

      return {
        lineUserId: profileRes.data.userId,
        displayName: profileRes.data.displayName,
        pictureUrl: profileRes.data.pictureUrl,
      }
    } catch (error) {
      this.logger.debug(error?.response?.data ?? error)
      throw new Error('LINE authentication failed')
    }
  }
}
