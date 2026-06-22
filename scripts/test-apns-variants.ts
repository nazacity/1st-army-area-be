import { readFileSync } from 'node:fs'
import * as http2 from 'node:http2'
import { SignJWT, importPKCS8 } from 'jose'

const TOKEN = process.argv[2]
const HOST = process.argv[3] || 'api.development.push.apple.com'
const TOPIC = process.argv[4] || 'com.antdeliveryapp.app'
const PUSH_TYPE = process.argv[5] || 'liveactivity'

async function main() {
  const pkcs8 = await importPKCS8(
    readFileSync(
      '/Users/nazacity/Desktop/Project/cavary/1st-army-area-be/src/modules/voltra/AuthKey_U5ZQ5X92RP.p8',
      'utf8',
    ),
    'ES256',
  )
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: 'U5ZQ5X92RP', typ: 'JWT' })
    .setIssuer('2Y3RS9378C')
    .setIssuedAt()
    .sign(pkcs8)

  const body = JSON.stringify({
    aps: {
      timestamp: Math.floor(Date.now() / 1000),
      event: 'update',
      'content-state': { test: true },
    },
  })

  const result = await new Promise<string>((resolve) => {
    const client = http2.connect(`https://${HOST}`)
    const req = client.request({
      ':method': 'POST',
      ':path': `/3/device/${TOKEN}`,
      authorization: `bearer ${jwt}`,
      'apns-topic': TOPIC,
      'apns-push-type': PUSH_TYPE,
      'apns-priority': '10',
      'content-type': 'application/json',
    })
    req.write(body)
    req.end()
    req.setEncoding('utf8')
    let responseBody = ''
    req.on('response', (h) => {
      const status = h[':status']
      req.on('data', (c: string) => {
        responseBody += c
      })
      req.on('end', () => {
        client.close()
        resolve(
          `[${HOST}] topic=${TOPIC} pushType=${PUSH_TYPE} → ${status} ${responseBody}`,
        )
      })
    })
    req.on('error', (err) => {
      client.close()
      resolve(`ERROR: ${String(err)}`)
    })
  })
  console.log(result)
}

main().catch(console.error)
