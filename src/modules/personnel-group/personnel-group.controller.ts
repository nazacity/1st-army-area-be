import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ResponseModel } from 'src/model/response.model'
import { PersonnelAdminJwtAuthGuard } from '../auth/guard/personnel-admin-auth.guard'
import { AdminRolesGuard } from 'src/common/guards/admin-roles.guard'
import { AdminRoles } from 'src/common/decorators/admin-roles.decorator'
import { UpdateGroupMembersDto } from './dto/update-group-members.dto'
import { PersonnelAdminRole } from '../personnel-admin/entities/personnel-admin.entity'
import { PersonnelGroupService } from './personnel-group.service'
import { PersonnelsGroup } from './entities/personnel-group.entity'
import {
  CreatePersonnelGroupDto,
  UpdatePersonnelGroupDto,
} from './dto/personnel-group.dto'

@ApiTags('Personnel Group')
@Controller('personnel-groups')
export class PersonnelGroupController {
  constructor(private readonly groupService: PersonnelGroupService) {}

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get()
  async getGroups(): Promise<ResponseModel<PersonnelsGroup[]>> {
    try {
      const { groups, total } = await this.groupService.getGroups()

      return { data: groups, meta: { total } }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard)
  @Get('/:id')
  async getGroupById(
    @Param('id') id: string,
  ): Promise<ResponseModel<PersonnelsGroup>> {
    try {
      const group = await this.groupService.getGroupById(id)

      return { data: group }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Post()
  async createGroup(
    @Body() dto: CreatePersonnelGroupDto,
  ): Promise<ResponseModel<PersonnelsGroup>> {
    try {
      const group = await this.groupService.createGroup(dto)

      return { data: group }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Patch('/:id/members')
  async updateGroupMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroupMembersDto,
  ): Promise<ResponseModel<any>> {
    try {
      const result = await this.groupService.updateGroupMembers(
        id,
        dto.usernames,
      )
      return {
        data: {
          added: result.added,
          removed: result.removed,
          total: result.group.personnels?.length ?? 0,
          group: result.group,
        },
      }
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Patch('/:id')
  async updateGroup(
    @Param('id') id: string,
    @Body() dto: UpdatePersonnelGroupDto,
  ): Promise<ResponseModel<PersonnelsGroup>> {
    try {
      const group = await this.groupService.updateGroup(id, dto)

      return { data: group }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @ApiBearerAuth('Admin Authorization')
  @UseGuards(PersonnelAdminJwtAuthGuard, AdminRolesGuard)
  @AdminRoles(PersonnelAdminRole.PERSONNEL)
  @Delete('/:id')
  async deleteGroup(
    @Param('id') id: string,
  ): Promise<ResponseModel<PersonnelsGroup>> {
    try {
      const group = await this.groupService.deleteGroup(id)

      return { data: group }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
