import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiTags } from '@nestjs/swagger'
import { AdminLoginDto } from './dto/admin-login.dto'
import { ResponseModel } from 'src/model/response.model'
import { UserService } from '../user/user.service'
import { AdminService } from '../admin/admin.service'
import { UserLoginDto } from './dto/user-login.dto'
import { Admin } from '../admin/entities/admin.entity'
import { AuthTokenModel } from './model/auth-token.model'
import { User } from '../user/entities/user.entity'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly administorService: AdminService,
  ) {}

  @Post('/user/sign-in')
  async authenticationClinicAdministor(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<
    ResponseModel<{
      token: AuthTokenModel
      user: Partial<User>
    }>
  > {
    try {
      const user = await this.userService.getUserByLineId(userLoginDto.lineId)

      if (user) {
        if (userLoginDto.profileImageUrl && userLoginDto.displayName) {
          const updatedUser = await this.userService.updateUser({
            id: user.id,
            userUpdate: {
              ...user,
              displayName: userLoginDto.displayName,
              profileImageUrl: userLoginDto.profileImageUrl,
            },
          })

          const accessToken = await this.authService.getNewToken({
            id: user.id,
          })

          return {
            data: { token: accessToken, user: updatedUser },
          }
        } else {
          const accessToken = await this.authService.getNewToken({
            id: user.id,
          })

          return {
            data: { token: accessToken, user: user },
          }
        }
      }

      return {
        data: { token: undefined, user: undefined },
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

  @Post('/admin/sign-in')
  async authenticationAdmin(
    @Body() adminLoginDto: AdminLoginDto,
  ): Promise<ResponseModel<{ token: AuthTokenModel; user: Partial<Admin> }>> {
    try {
      adminLoginDto.username = adminLoginDto.username.toLowerCase()
      const admin =
        await this.administorService.getAdminByUsernameAndPassword(
          adminLoginDto,
        )

      const accessToken = await this.authService.getNewToken({
        id: admin.id,
      })

      delete admin.username
      delete admin.password

      return {
        data: { token: accessToken, user: admin },
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
