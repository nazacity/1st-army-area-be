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
import { Building } from './entities/building.entity'
import { BuildingService } from './building.service'
import {
  BuildingCreateDto,
  BuildingQueryDto,
  BuildingUpdateDto,
  AutoCreateBuildingDto,
} from './dto/building.dto'
import { BuildingNo } from './entities/building-no.entity'

@ApiTags('Building')
@Controller('building')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Get()
  async getAll(
    @Query() query: BuildingQueryDto,
  ): Promise<ResponseModel<Building[]>> {
    try {
      const { data, total } = await this.buildingService.getAllBuildings(query)
      return { meta: { total }, data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<Building>> {
    try {
      const data = await this.buildingService.getBuildingById(id)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post('/auto-create')
  async autoCreate(@Body() dto: AutoCreateBuildingDto): Promise<
    ResponseModel<{
      buildingNo: BuildingNo
      buildings: Building[]
      skipped: number
    }>
  > {
    try {
      const data = await this.buildingService.autoCreateBuildings(dto)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post()
  async create(
    @Body() dto: BuildingCreateDto,
  ): Promise<ResponseModel<Building>> {
    try {
      const data = await this.buildingService.createBuilding(dto)
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: BuildingUpdateDto,
  ): Promise<ResponseModel<Building>> {
    try {
      const data = await this.buildingService.updateBuilding({
        id,
        update: dto,
      })
      return { data }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseModel<string>> {
    try {
      await this.buildingService.deleteBuilding(id)
      return { data: 'succeeded' }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
