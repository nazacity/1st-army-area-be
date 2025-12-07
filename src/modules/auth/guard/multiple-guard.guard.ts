import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
  UnauthorizedException,
} from '@nestjs/common'
import { ModuleRef, Reflector } from '@nestjs/core'

@Injectable()
export class MultipleAuthorizeGuard implements CanActivate {
  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowGuards = this.reflector.get<Type<CanActivate>[]>(
      'multipleGuardsRef',
      context.getHandler(),
    )

    const guards = allowGuards.map((guardRef) =>
      this.moduleRef.get<CanActivate>(guardRef, { strict: false }),
    )
    if (guards.length === 0) return true
    if (guards.length === 1) {
      try {
        await guards[0].canActivate(context)
        return true
      } catch (error) {
        if (error instanceof UnauthorizedException) return false
        throw error
      }
    }

    const check = guards.map(async (guard) => {
      try {
        await guard.canActivate(context)
        return true
      } catch (error) {
        if (error instanceof UnauthorizedException) return false
        throw error
      }
    })
    const results = await Promise.all(check)
    return results.some((result) => result === true)
  }
}
