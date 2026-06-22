import { readFileSync } from 'node:fs'
import { SignJWT, importPKCS8 } from 'jose'

async function main() {
  const pkcs8 = await importPKCS8(readFileSync('src/modules/voltra/AuthKey_U5ZQ5X92RP.p8', 'utf8'), 'ES256')
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: 'U5ZQ5X92RP', typ: 'JWT' })
    .setIssuer('2Y3RS9378C')
    .setIssuedAt()
    .sign(pkcs8)
  process.stdout.write(jwt)
}

main().catch(console.error)
