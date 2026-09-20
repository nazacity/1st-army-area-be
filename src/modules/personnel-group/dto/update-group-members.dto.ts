import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsString } from 'class-validator'

export class UpdateGroupMembersDto {
  @ApiProperty({
    type: [String],
    description:
      'รหัสนักเรียนทั้งหมดในพวกนี้ — ตัวที่ไม่อยู่ในลิสต์จะถูกถอดออกจากพวก, ตัวใหม่จะถูกเพิ่ม',
  })
  @IsArray()
  @IsString({ each: true })
  usernames: string[]
}
