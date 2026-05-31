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
import { BuildingNo } from './entities/building-no.entity'
import { BuildingNoService } from './building-no.service'
import { BuildingNoCreateDto, BuildingNoQueryDto, BuildingNoUpdateDto } from './dto/building-no.dto'

@ApiTags('Building No')
@Controller('building-no')
export class BuildingNoController {
  constructor(private readonly buildingNoService: BuildingNoService) {}

  @Get()
  async getAll(
    @Query() query: BuildingNoQueryDto,
  ): Promise<ResponseModel<BuildingNo[]>> {
    try {
      const { data, total } = await this.buildingNoService.getAllBuildingNos(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<BuildingNo>> {
    try {
      const data = await this.buildingNoService.getBuildingNoById(id)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Post()
  async create(
    @Body() dto: BuildingNoCreateDto,
  ): Promise<ResponseModel<BuildingNo>> {
    try {
      const data = await this.buildingNoService.createBuildingNo(dto)
      return { data }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: BuildingNoUpdateDto,
  ): Promise<ResponseModel<BuildingNo>> {
    try {
      const data = await this.buildingNoService.updateBuildingNo({ id, update: dto })
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
      await this.buildingNoService.deleteBuildingNo(id)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException({ message: error.message }, HttpStatus.BAD_REQUEST)
    }
  }
}
