import { readFileSync } from 'node:fs'
import { SignJWT, importPKCS8, decodeProtectedHeader, decodeJwt } from 'jose'

async function main() {
  const pkcs8 = readFileSync('src/modules/voltra/AuthKey_U5ZQ5X92RP.p8', 'utf8')
  const key = await importPKCS8(pkcs8, 'ES256')
  
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: 'U5ZQ5X92RP', typ: 'JWT' })
    .setIssuer('2Y3RS9378C')
    .setIssuedAt()
    .sign(key)

  console.log('Full JWT:', jwt)
  console.log('Header:', JSON.stringify(decodeProtectedHeader(jwt), null, 2))
  console.log('Payload:', JSON.stringify(decodeJwt(jwt), null, 2))
  
  // Verify p8 key properties
  console.log('\np8 first line:', pkcs8.split('\n')[0])
  console.log('p8 has EC PRIVATE KEY:', pkcs8.includes('EC PRIVATE KEY'))
  console.log('p8 has PRIVATE KEY:', pkcs8.includes('PRIVATE KEY'))
}

main().catch(console.error)
