import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiSecurity, ApiTags } from '@nestjs/swagger'
import { BootstrapService } from './bootstrap.service'
import { BootstrapGuard, ExportGuard } from './bootstrap.guard'

class BootstrapImportDto {
  file: Express.Multer.File
  mode?: 'upsert' | 'replace'
  adminPassword?: string
}

@ApiTags('Bootstrap')
@ApiSecurity('Bootstrap Token')
@Controller('bootstrap')
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get('export')
  @UseGuards(ExportGuard)
  async exportFull(@Request() req: any, @Query('token') token?: string) {
    try {
      const dump = await this.bootstrapService.exportFullDump()
      const counts = Object.fromEntries(
        Object.entries(dump.tables).map(([k, v]) => [k, (v as any[]).length]),
      )
      return {
        data: {
          ...dump,
          counts,
          exportedBy: req.user?.username ?? 'export-token',
        },
      }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiBearerAuth('Personnel Admin Authorization')
  @Get('status')
  async getStatus() {
    try {
      return {
        data: {
          hasSuperAdmin: await this.bootstrapService.hasSuperAdmin(),
          bootstrapEnabled: process.env.BOOTSTRAP_ENABLED === 'true',
        },
      }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'ไฟล์ JSON full-dump (จาก GET /bootstrap/export — ย้าย server ครบทุก field) หรือ CSV (Google Forms export / CSV export จากโปรเจ็คนี้)' },
        mode: { type: 'string', enum: ['upsert', 'replace'], description: 'ใช้กับ CSV เท่านั้น · JSON dump = wipe+restore ทั้งชุดเสมอ' },
        adminPassword: { type: 'string', description: 'รหัส super_admin ที่จะสร้าง (default SuperSecret123)' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(BootstrapGuard)
  @Post('import')
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: BootstrapImportDto,
  ) {
    try {
      if (!file) throw new Error('CSV file is required')

      const superAdmin = await this.bootstrapService.ensureSuperAdmin(
        'padmin',
        body.adminPassword || 'SuperSecret123',
      )
      const groupsAndRooms = await this.bootstrapService.seedGroupsAndRooms()

      let personnel
      const rawText = file.buffer.toString('utf-8').trim()
      const isJsonDump = rawText.startsWith('{')
      const csvFormat = this.bootstrapService.detectCsvFormat(
        rawText.split('\n')[0].split(','),
      )

      if (isJsonDump) {
        // Full-migration dump (JSON) — คง UUID เดิมทั้งหมด, wipe ตารางที่เกี่ยวก่อน
        const dump = JSON.parse(rawText)
        const restored = await this.bootstrapService.importFullDump(dump)
        const superAdmin = await this.bootstrapService.ensureSuperAdmin(
          'padmin',
          body.adminPassword || 'SuperSecret123',
        )
        return {
          data: {
            mode: 'full-dump',
            restored,
            superAdmin,
          },
        }
      }

      if (csvFormat === 'A') {
        const { importPersonnel } = await import(
          '../personnel/personnel-import.helper'
        )
        const report = await importPersonnel(
          this.bootstrapService['dataSource'],
          file.buffer.toString('utf-8'),
        )
        personnel = {
          created: report.success,
          updated: 0,
          skipped: report.skipped,
          warnings: report.warnings,
          errors: report.errors,
        }
      } else {
        personnel = await this.bootstrapService.importPersonnelExport(
          file.buffer.toString('utf-8'),
          body.mode === 'replace',
        )
      }

      return {
        data: {
          superAdmin,
          groups: groupsAndRooms.groups,
          rooms: groupsAndRooms.rooms,
          personnel,
          csvFormat: `รูปแบบ ${csvFormat}${csvFormat === 'A' ? ' (Google Forms export)' : ' (project export)'}`,
        },
      }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
