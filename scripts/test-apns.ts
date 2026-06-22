/* eslint-disable no-console */
/**
 * Direct APNS test script — bypass HTTP/2 wrapper, test with raw curl equivalent.
 *
 * Usage:
 *   npx ts-node scripts/test-apns.ts <pushToken> [host]
 *
 * Example:
 *   npx ts-node scripts/test-apns.ts 80d192... api.development.push.apple.com
 */
import { readFileSync } from 'node:fs'
import * as http2 from 'node:http2'
import { SignJWT, importPKCS8 } from 'jose'

const pushToken = process.argv[2]
const host = process.argv[3] || 'api.development.push.apple.com'
const teamId = '2Y3RS9378C'
const keyId = 'U5ZQ5X92RP'
const topic = 'com.antdeliveryapp.app'
const p8Path = 'src/modules/voltra/AuthKey_U5ZQ5X92RP.p8'

async function main() {
  if (!pushToken) {
    console.error('Usage: npx ts-node scripts/test-apns.ts <pushToken> [host]')
    process.exit(1)
  }

  console.log(`Testing APNS push to ${host}`)
  console.log(`Token: ${pushToken.slice(0, 20)}...${pushToken.slice(-20)}`)
  console.log(`Token length: ${pushToken.length} chars`)

  const pkcs8 = await importPKCS8(readFileSync(p8Path, 'utf8'), 'ES256')
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
    .setIssuer(teamId)
    .setIssuedAt()
    .sign(pkcs8)
  console.log(`JWT: ${jwt.slice(0, 30)}...`)

  const body = JSON.stringify({
    aps: {
      timestamp: Math.floor(Date.now() / 1000),
      event: 'update',
      'content-state': { test: true },
      'stale-date': Math.floor(Date.now() / 1000) + 3600,
      dismissal: { policy: 'default' },
    },
  })

  return new Promise<void>((resolve) => {
    const client = http2.connect(`https://${host}`)

    const headers: http2.OutgoingHttpHeaders = {
      ':method': 'POST',
      ':path': `/3/device/${pushToken}`,
      authorization: `bearer ${jwt}`,
      'apns-topic': topic,
      'apns-push-type': 'liveactivity',
      'apns-priority': '10',
      'content-type': 'application/json',
    }

    console.log('Request headers:', {
      ...headers,
      authorization: `bearer ${jwt.slice(0, 20)}...`,
    })

    const req = client.request(headers)
    req.write(body)
    req.end()

    let responseBody = ''
    req.setEncoding('utf8')
    req.on('response', (responseHeaders) => {
      console.log('Response status:', responseHeaders[':status'])
      console.log('Response headers:', responseHeaders)
      req.on('data', (chunk: string) => {
        responseBody += chunk
      })
      req.on('end', () => {
        console.log('Response body:', responseBody)
        client.close()
        resolve()
      })
    })
    req.on('error', (err) => {
      console.error('Request error:', err)
      client.close()
      resolve()
    })
  })
}

main().catch(console.error)
