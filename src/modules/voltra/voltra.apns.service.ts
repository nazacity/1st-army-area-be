import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import * as http2 from 'node:http2'
import { SignJWT, importPKCS8 } from 'jose'

/**
 * APNS push helper for iOS Live Activity updates.
 *
 * Uses native Node `http2` — Apple's `api.push.apple.com` requires HTTP/2.
 * Node's built-in fetch (undici) is HTTP/1.1 only → fails with HPE_INVALID_CONSTANT.
 */
@Injectable()
export class VoltraApnsService {
  private readonly logger = new Logger(VoltraApnsService.name)
  private readonly host: string
  private readonly topic: string
  private readonly teamId: string
  private readonly keyId: string
  private readonly p8Path: string

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
    this.p8Path = resolve(
      this.config.get<string>(
        'VOLTRA_APNS_P8_PATH',
        join('src', 'modules', 'voltra', 'AuthKey_U5ZQ5X92RP.p8'),
      ),
    )
  }

  private async signJwt(): Promise<string> {
    if (!this.teamId || !this.keyId) {
      throw new Error('VOLTRA_APNS_TEAM_ID and VOLTRA_APNS_KEY_ID must be set')
    }
    const pkcs8 = await importPKCS8(readFileSync(this.p8Path, 'utf8'), 'ES256')
    return new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: this.keyId, typ: 'JWT' })
      .setIssuer(this.teamId)
      .setIssuedAt()
      .sign(pkcs8)
  }

  /**
   * Send HTTP/2 POST to APNS. Returns parsed response status + body.
   */
  private sendHttp2Post(
    path: string,
    headers: Record<string, string>,
    body: object,
  ): Promise<{ ok: boolean; status: number; body: string }> {
    return new Promise((resolve) => {
      const bodyStr = JSON.stringify(body)
      const bodyBuf = Buffer.from(bodyStr, 'utf8')
      const fullUrl = `https://${this.host}${path}`

      // Only set :method + :path. :scheme + :authority auto-set from connect URL.
      // Don't set content-length — let HTTP/2 handle via DATA frames + END_STREAM.
      const requestHeaders: Record<string, string> = {
        ':method': 'POST',
        ':path': path,
        ...headers,
      }

      this.logger.log(`HTTP/2 → ${fullUrl}`)
      this.logger.log(
        `Headers: ${JSON.stringify(
          {
            ...requestHeaders,
            authorization: requestHeaders.authorization
              ? `bearer ${requestHeaders.authorization.slice(7, 20)}...`
              : undefined,
          },
          null,
          2,
        )}`,
      )
      this.logger.log(
        `Body: ${bodyStr.slice(0, 200)}${bodyStr.length > 200 ? '...' : ''}`,
      )
      this.logger.log(`Body bytes: ${bodyBuf.length}`)

      const client = http2.connect(`https://${this.host}`, {
        peerMaxConcurrentStreams: 100,
      })

      client.on('error', (err) => {
        this.logger.error(`HTTP/2 client error: ${String(err)}`)
      })

      const req = client.request(requestHeaders)
      req.write(bodyBuf)
      req.end()

      let responseBody = ''
      req.setEncoding('utf8')
      req.on('response', (responseHeaders) => {
        const status = responseHeaders[':status'] ?? 0
        this.logger.log(`HTTP/2 response status: ${status}`)
        this.logger.log(`Response headers: ${JSON.stringify(responseHeaders)}`)
        req.on('data', (chunk: string) => {
          responseBody += chunk
        })
        req.on('end', () => {
          client.close()
          this.logger.log(`HTTP/2 response body: ${responseBody}`)
          resolve({
            ok: status >= 200 && status < 300,
            status,
            body: responseBody,
          })
        })
      })
      req.on('error', (err) => {
        client.close()
        this.logger.error(`HTTP/2 request error: ${String(err)}`)
        resolve({ ok: false, status: 0, body: String(err) })
      })
    })
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
    const headers = {
      authorization: `bearer ${jwt}`,
      'apns-topic': this.topic,
      'apns-push-type': 'liveactivity',
      'apns-priority': '10',
      'content-type': 'application/json',
    }
    const result = await this.sendHttp2Post(
      `/3/device/${args.pushToken}`,
      headers,
      body,
    )
    if (result.ok) return { ok: true }
    this.logger.warn(`APNS update failed ${result.status}: ${result.body}`)
    return { ok: false, status: result.status, body: result.body }
  }

  async sendLiveActivityEnd(args: {
    pushToken: string
    contentState: Record<string, unknown>
  }): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
    const jwt = await this.signJwt()
    const now = Math.floor(Date.now() / 1000)
    const body = {
      aps: {
        timestamp: now,
        event: 'end',
        'content-state': args.contentState,
        'dismissal-date': now,
      },
    }
    const headers = {
      authorization: `bearer ${jwt}`,
      'apns-topic': this.topic,
      'apns-push-type': 'liveactivity',
      'apns-priority': '10',
      'content-type': 'application/json',
    }
    const result = await this.sendHttp2Post(
      `/3/device/${args.pushToken}`,
      headers,
      body,
    )
    if (result.ok) return { ok: true }
    this.logger.warn(`APNS end failed ${result.status}: ${result.body}`)
    return { ok: false, status: result.status, body: result.body }
  }

  async sendLiveActivityStart(args: {
    pushToStartToken: string
    contentState: Record<string, unknown>
    activityName: string
    deepLinkUrl?: string
  }): Promise<{ ok: boolean; status: number }> {
    const jwt = await this.signJwt()
    const now = Math.floor(Date.now() / 1000)
    const body = {
      activityName: args.activityName,
      aps: {
        timestamp: now,
        event: 'start',
        'content-state': args.contentState,
        'attributes-type': 'VoltraAttributes',
        attributes: {
          name: args.activityName,
          ...(args.deepLinkUrl ? { deepLinkUrl: args.deepLinkUrl } : {}),
        },
      },
    }
    const headers = {
      authorization: `bearer ${jwt}`,
      'apns-topic': this.topic,
      'apns-push-type': 'liveactivity',
      'content-type': 'application/json',
    }
    const result = await this.sendHttp2Post(
      `/3/device/${args.pushToStartToken}`,
      headers,
      body,
    )
    return { ok: result.ok, status: result.status }
  }
}
