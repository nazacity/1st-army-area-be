import { CanActivate, SetMetadata, Type } from '@nestjs/common'

export const SetActivateGuards = (...guards: Type<CanActivate>[]) => {
  return SetMetadata('multipleGuardsRef', guards)
}
