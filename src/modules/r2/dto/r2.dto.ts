import { ApiProperty } from '@nestjs/swagger'

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: Express.Multer.File
}

export class UploadDocDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  doc: Express.Multer.File
}

export class GetUploadUrlDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  filename: string
}
