import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * Android ongoing-notification push via FCM.
 *
 * The app's background task receives `data.voltra_payload` and calls
 * `upsertAndroidOngoingNotification(JSON.parse(payload))`.
 *
 * Two ways to send:
 *  1. FCM HTTP v1 (recommended) — requires service account JSON at
 *     VOLTRA_FCM_SERVICE_ACCOUNT_PATH. We sign an OAuth2 access token with jose.
 *  2. Legacy server key (deprecated by Google) — VOLTRA_FCM_SERVER_KEY.
 */
@Injectable()
export class VoltraFcmService {
  private readonly logger = new Logger(VoltraFcmService.name)
  private readonly projectId: string
  private readonly serviceAccountPath?: string
  private readonly serverKey?: string

  constructor(private readonly config: ConfigService) {
    this.projectId = this.config.get<string>('VOLTRA_FCM_PROJECT_ID', '')
    this.serviceAccountPath = this.config.get<string>('VOLTRA_FCM_SERVICE_ACCOUNT_PATH')
    this.serverKey = this.config.get<string>('VOLTRA_FCM_SERVER_KEY')
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.serviceAccountPath) return null
    const { readFileSync } = await import('node:fs')
    const { SignJWT, importPKCS8 } = await import('jose')
    const sa = JSON.parse(readFileSync(this.serviceAccountPath, 'utf8'))
    const key = await importPKCS8(sa.private_key, 'RS256')
    const now = Math.floor(Date.now() / 1000)
    return new SignJWT({ scope: 'https://www.googleapis.com/auth/firebase.messaging' })
      .setProtectedHeader({ alg: 'RS256', kid: sa.private_key_id, typ: 'JWT' })
      .setIssuer(sa.client_email)
      .setSubject(sa.client_email)
      .setAudience('https://oauth2.googleapis.com/token')
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(key)
  }

  async sendOngoingNotificationUpdate(args: {
    fcmToken: string
    payload: Record<string, unknown>
    notificationId?: string
  }): Promise<{ ok: boolean; status: number; body?: string }> {
    const data = {
      voltra_payload: JSON.stringify(args.payload),
      notif_id: args.notificationId || 'ant_order_tracking',
    }

    // Legacy server key path
    if (this.serverKey) {
      try {
        const res = await fetch(`https://fcm.googleapis.com/fcm/send`, {
          method: 'POST',
          headers: {
            authorization: `key=${this.serverKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ to: args.fcmToken, priority: 'high', data }),
        })
        const text = await res.text()
        if (!res.ok) this.logger.warn(`FCM legacy failed ${res.status}: ${text}`)
        return { ok: res.ok, status: res.status, body: text }
      } catch (err) {
        this.logger.error(`FCM legacy threw: ${String(err)}`)
        return { ok: false, status: 0, body: String(err) }
      }
    }

    // HTTP v1 path
    const accessToken = await this.getAccessToken()
    if (!accessToken || !this.projectId) {
      this.logger.warn(
        'FCM not configured — set VOLTRA_FCM_PROJECT_ID + VOLTRA_FCM_SERVICE_ACCOUNT_PATH or VOLTRA_FCM_SERVER_KEY',
      )
      return { ok: false, status: 0, body: 'fcm_not_configured' }
    }

    try {
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${accessToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            message: {
              token: args.fcmToken,
              android: { priority: 'high' },
              data,
            },
          }),
        },
      )
      const text = await res.text()
      if (!res.ok) this.logger.warn(`FCM v1 failed ${res.status}: ${text}`)
      return { ok: res.ok, status: res.status, body: text }
    } catch (err) {
      this.logger.error(`FCM v1 threw: ${String(err)}`)
      return { ok: false, status: 0, body: String(err) }
    }
  }
}
