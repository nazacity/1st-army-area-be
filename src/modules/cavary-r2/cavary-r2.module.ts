import { Module } from '@nestjs/common'
import { CavaryR2Service } from './cavary-r2.service'
import { CavaryR2Controller } from './cavary-r2.controller'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot({})],
  controllers: [CavaryR2Controller],
  providers: [CavaryR2Service],
  exports: [CavaryR2Service],
})
export class CavaryR2Module {}
