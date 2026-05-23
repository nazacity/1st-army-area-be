import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { Build } from './entities/build.entity'
import { BuildService } from './build.service'
import { BuildCreateDto, BuildQueryDto, BuildUpdateDto } from './dto/build.dto'

@ApiTags('Build')
@Controller('build')
export class BuildController {
  constructor(private readonly buildService: BuildService) {}

  @Get()
  async getAll(
    @Query() query: BuildQueryDto,
  ): Promise<ResponseModel<Build[]>> {
    try {
      const { data, total } = await this.buildService.getAllBuilds(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<Build>> {
    try {
      const data = await this.buildService.getBuildById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: BuildCreateDto,
  ): Promise<ResponseModel<Build>> {
    try {
      const data = await this.buildService.createBuild(dto)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: BuildUpdateDto,
  ): Promise<ResponseModel<Build>> {
    try {
      const data = await this.buildService.updateBuild({ id, update: dto })
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<string>> {
    try {
      await this.buildService.deleteBuild(id)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
