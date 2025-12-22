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
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  RequestAdminUserModel,
  RequestClinicUserModel,
} from 'src/model/request.model'
import { ResponseModel } from 'src/model/response.model'
import { UserJwtAuthGuard } from '../auth/guard/user-auth.guard'
import { UserService } from './user.service'
import { User } from './entities/user.entity'
import {
  UserCreateDto,
  UserQueryByAdminDto,
  UserUpdateDto,
} from './dto/user.dto'
import { AuthTokenModel } from '../auth/model/auth-token.model'
import { JwtService } from '@nestjs/jwt'
import { UserScoreInfoService } from '../user-score-info/user-score-info.service'
import { AdminJwtAuthGuard } from '../auth/guard/admin-auth.guard'

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userScoreInfoService: UserScoreInfoService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiBearerAuth('User Authorization')
  @UseGuards(UserJwtAuthGuard)
  @Get('/info')
  async getUserByToken(
    @Request() req: RequestClinicUserModel,
  ): Promise<ResponseModel<User>> {
    try {
      return { data: req.user }
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
  @UseGuards(AdminJwtAuthGuard)
  @Get('')
  async getUsers(
    // @Request() req: RequestAdminUserModel,
    @Query() query: UserQueryByAdminDto,
  ): Promise<ResponseModel<User[]>> {
    try {
      const { users, total } = await this.userService.getUsersByAdmin(query)
      return {
        meta: { total },
        data: users,
      }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('/:userId')
  async getuserById(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<ResponseModel<User>> {
    try {
      const user = await this.userService.getUserById(userId)

      return { data: user }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post()
  async createUser(@Body() userCreateDto: UserCreateDto): Promise<
    ResponseModel<{
      token: AuthTokenModel
      user: Partial<User>
    }>
  > {
    try {
      const score = await this.userScoreInfoService.createUserScoreInfo({})
      const createdUser = await this.userService.createUser({
        ...userCreateDto,
        score,
      })

      if (createdUser) {
        const accessToken = await this.getNewToken({
          id: createdUser.id,
        })

        return {
          data: { token: accessToken, user: createdUser },
        }
      }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  public async getNewToken(payload: any): Promise<AuthTokenModel> {
    const accessToken = await this.jwtService.signAsync(payload)

    return { accessToken } as AuthTokenModel
  }

  @ApiBearerAuth('User Authorization')
  @UseGuards(UserJwtAuthGuard)
  @Patch('')
  async updateUser(
    @Request() req: RequestClinicUserModel,
    @Body() userUpdateDto: UserUpdateDto,
  ): Promise<ResponseModel<User>> {
    try {
      const updatedUser = await this.userService.updateUser({
        id: req.user.id,
        userUpdate: userUpdateDto,
      })

      const user = await this.userService.getUserById(updatedUser.id)

      return { data: user }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Delete('/:userId')
  async deleteUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<ResponseModel<string>> {
    try {
      const deletedUser = await this.userService.deleteUser({
        userId,
      })

      if (deletedUser) {
        return { data: 'succeeded' }
      }
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
