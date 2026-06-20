import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'node:fs'
import { SignJWT, importPKCS8 } from 'jose'

/**
 * APNS push helper for iOS Live Activity updates.
 *
 * AuthKey_U5ZQ5X92RP.p8 → KeyID = U5ZQ5X92RP
 * Place the file at the path configured by VOLTRA_APNS_P8_PATH, or default
 * to the shared cert under ant-army/.
 */
@Injectable()
export class VoltraApnsService {
  private readonly logger = new Logger(VoltraApnsService.name)
  private readonly host: string
  private readonly topic: string
  private readonly teamId: string
  private readonly keyId: string
  private readonly p8Path: string
  private cachedKey: Uint8Array | null = null

  constructor(private readonly config: ConfigService) {
    this.host = this.config.get<string>(
      'VOLTRA_APNS_HOST',
      'api.push.apple.com',
    )
    this.topic = this.config.get<string>(
      'VOLTRA_APNS_TOPIC',
      'com.antdeliveryapp.app.push-type.liveactivity',
    )
    this.teamId = this.config.get<string>('VOLTRA_APNS_TEAM_ID', '2Y3RS9378C')
    this.keyId = this.config.get<string>('VOLTRA_APNS_KEY_ID', 'U5ZQ5X92RP')
    this.p8Path = this.config.get<string>(
      'VOLTRA_APNS_P8_PATH',
      '/Users/nazacity/Desktop/Project/ant-army/AuthKey_U5ZQ5X92RP.p8',
    )
  }

  private async loadPrivateKey(): Promise<Uint8Array> {
    if (this.cachedKey) return this.cachedKey
    const pem = readFileSync(this.p8Path, 'utf8')
    // jose v5 expects imported key — but ES256 accepts raw PEM bytes via TextEncoder
    this.cachedKey = new TextEncoder().encode(pem)
    return this.cachedKey
  }

  private async signJwt(): Promise<string> {
    if (!this.teamId || !this.keyId) {
      throw new Error('VOLTRA_APNS_TEAM_ID and VOLTRA_APNS_KEY_ID must be set')
    }
    const key = await this.loadPrivateKey()
    const pkcs8 = await importPKCS8(readFileSync(this.p8Path, 'utf8'), 'ES256')
    return new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: this.keyId, typ: 'JWT' })
      .setIssuer(this.teamId)
      .setIssuedAt()
      .sign(pkcs8)
  }

  async sendLiveActivityUpdate(args: {
    pushToken: string
    contentState: Record<string, unknown>
    staleDateSeconds?: number
    dismissalPolicy?: 'default' | 'immediate' | 'never'
  }): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
    const jwt = await this.signJwt()
    const now = Math.floor(Date.now() / 1000)
    const body = {
      aps: {
        timestamp: now,
        event: 'update',
        'content-state': args.contentState,
        'stale-date': args.staleDateSeconds
          ? now + args.staleDateSeconds
          : now + 3600,
        dismissal: { policy: args.dismissalPolicy || 'default' },
      },
    }
    try {
      const res = await fetch(
        `https://${this.host}/2/device/${args.pushToken}`,
        {
          method: 'POST',
          headers: {
            authorization: `bearer ${jwt}`,
            'apns-topic': this.topic,
            'apns-push-type': 'liveactivity',
            'apns-priority': '10',
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      )
      if (res.ok) return { ok: true }
      const text = await res.text()
      this.logger.warn(`APNS update failed ${res.status}: ${text}`)
      return { ok: false, status: res.status, body: text }
    } catch (err) {
      this.logger.error(`APNS update threw: ${String(err)}`)
      return { ok: false, status: 0, body: String(err) }
    }
  }

  async sendLiveActivityStart(args: {
    pushToStartToken: string
    contentState: Record<string, unknown>
    activityName: string
  }): Promise<{ ok: boolean; status: number }> {
    const jwt = await this.signJwt()
    const now = Math.floor(Date.now() / 1000)
    const body = {
      activityName: args.activityName,
      aps: {
        timestamp: now,
        event: 'start',
        'content-state': args.contentState,
      },
    }
    try {
      const res = await fetch(
        `https://${this.host}/2/device/${args.pushToStartToken}`,
        {
          method: 'POST',
          headers: {
            authorization: `bearer ${jwt}`,
            'apns-topic': this.topic,
            'apns-push-type': 'liveactivity',
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      )
      return { ok: res.ok, status: res.status }
    } catch (err) {
      this.logger.error(`APNS start threw: ${String(err)}`)
      return { ok: false, status: 0 }
    }
  }
}
