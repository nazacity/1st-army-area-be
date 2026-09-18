import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import {
  Survey2QuestionAnswerType,
  Survey2QuestionCondition,
  Survey2QuestionType,
} from '../entities/survey2-question.entity'

// ---------- Survey ----------

export class Survey2CreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiProperty({ example: '2026-09-20T00:00:00+07:00' })
  @IsDateString()
  startDate: string

  @ApiProperty({ example: '2026-09-30T23:59:59+07:00' })
  @IsDateString()
  endDate: string

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  display?: boolean
}

export class Survey2UpdateDto extends Survey2CreateDto {}

export class Survey2DisplayDto {
  @ApiProperty()
  @IsBoolean()
  display: boolean
}

// ---------- Part ----------

export class Survey2PartCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsUUID()
  surveyId: string
}

export class Survey2PartUpdateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string
}

export class Survey2IndexDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  index: number
}

// ---------- Question ----------

export class Survey2AnswerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string

  @ApiPropertyOptional({ example: 'S' })
  @IsOptional()
  @IsString()
  answer?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiPropertyOptional({ description: 'ระดะคะแนน/น้ำหนัก — ใช้เมื่อ answerType=weight' })
  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOther?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isComment?: boolean
}

export class Survey2QuestionCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string

  @ApiProperty({ enum: Survey2QuestionType })
  @IsEnum(Survey2QuestionType)
  type: Survey2QuestionType

  @ApiPropertyOptional({ enum: Survey2QuestionAnswerType })
  @IsOptional()
  @IsEnum(Survey2QuestionAnswerType)
  answerType?: Survey2QuestionAnswerType

  @ApiPropertyOptional({ enum: Survey2QuestionCondition })
  @IsOptional()
  @IsEnum(Survey2QuestionCondition)
  condition?: Survey2QuestionCondition

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  conditionNumber?: number

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isUserAnswerText?: boolean

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHasOther?: boolean

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  display?: boolean

  @ApiProperty({ type: [Survey2AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Survey2AnswerDto)
  answers: Survey2AnswerDto[]

  @ApiProperty()
  @IsUUID()
  partId: string
}

export class Survey2QuestionUpdateDto extends Survey2QuestionCreateDto {}

// ---------- Submit (ผู้ใช้) ----------

export class Survey2SubmitAnswerDto {
  @ApiProperty()
  @IsUUID()
  answerId: string

  @ApiPropertyOptional({ description: 'ข้อความ "อื่นๆ"/ความคิดเห็น' })
  @IsOptional()
  @IsString()
  answer?: string
}

export class Survey2SubmitTextDto {
  @ApiProperty()
  @IsUUID()
  questionId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  answer?: string
}

export class Survey2SubmitDto {
  @ApiProperty()
  @IsUUID()
  surveyId: string

  @ApiProperty({ type: [Survey2SubmitAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Survey2SubmitAnswerDto)
  answers: Survey2SubmitAnswerDto[]

  @ApiProperty({ type: [Survey2SubmitTextDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Survey2SubmitTextDto)
  answerTexts: Survey2SubmitTextDto[]
}
