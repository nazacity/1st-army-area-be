import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PersonnelAdmin, PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'

// ผ่านได้ 2 ทาง:
// 1. Bearer JWT ของ personnel_admin role=super_admin
// 2. x-bootstrap-token ตรง env BOOTSTRAP_TOKEN (BOOTSTRAP_ENABLED=true) — ใช้ได้เฉพาะตอนยังไม่มี super_admin
// export guard: super_admin JWT หรือ x-export-token ตรง env EXPORT_TOKEN
@Injectable()
export class ExportGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(PersonnelAdmin)
    private readonly adminRepository: Repository<PersonnelAdmin>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const auth: string | undefined = request.headers['authorization']
    const token: string | undefined =
      request.headers['x-export-token'] ?? request.query?.token

    if (process.env.EXPORT_TOKEN && token === process.env.EXPORT_TOKEN) {
      return true
    }

    if (auth?.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync(auth.slice(7))
        const admin = await this.adminRepository.findOne({
          where: { id: payload.id, isDeleted: false },
        })
        if (admin?.role === PersonnelAdminRole.SUPER_ADMIN && admin.isActive) {
          request.user = admin
          return true
        }
      } catch {
        // fallthrough
      }
    }

    throw new UnauthorizedException(
      'ต้องใช้ JWT super_admin หรือ x-export-token (env EXPORT_TOKEN)',
    )
  }
}

@Injectable()
export class BootstrapGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(PersonnelAdmin)
    private readonly adminRepository: Repository<PersonnelAdmin>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const auth: string | undefined = request.headers['authorization']
    const token: string | undefined = request.headers['x-bootstrap-token']

    if (auth?.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync(auth.slice(7))
        const admin = await this.adminRepository.findOne({
          where: { id: payload.id, isDeleted: false },
        })
        if (admin?.role === PersonnelAdminRole.SUPER_ADMIN && admin.isActive) {
          request.user = admin
          return true
        }
      } catch {
        // ตกไปเช็ค token
      }
    }

    if (
      process.env.BOOTSTRAP_ENABLED === 'true' &&
      token &&
      process.env.BOOTSTRAP_TOKEN &&
      token === process.env.BOOTSTRAP_TOKEN
    ) {
      const superCount = await this.adminRepository.count({
        where: { role: PersonnelAdminRole.SUPER_ADMIN, isDeleted: false },
      })
      if (superCount === 0) return true
    }

    throw new UnauthorizedException(
      'ต้องใช้ JWT super_admin หรือ x-bootstrap-token (เฉพาะตอนยังไม่มี super_admin)',
    )
  }
}
