import { ApiProperty } from '@nestjs/swagger'

export class CavaryUploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: Express.Multer.File
}

export class CavaryUploadDocDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  doc: Express.Multer.File
}

export class CavaryGetUploadUrlDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  filename: string
}
