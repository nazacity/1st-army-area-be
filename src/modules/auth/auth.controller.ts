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
import { PersonnelLoginDto } from './dto/personnel-login.dto'
import { Admin } from '../admin/entities/admin.entity'
import { AuthTokenModel } from './model/auth-token.model'
import { User } from '../user/entities/user.entity'
import { PersonnelService } from '../personnel/personnel.service'
import { Personnel } from '../personnel/entities/personnel.entity'
import { PersonnelAdminService } from '../personnel-admin/personnel-admin.service'
import { PersonnelAdminLoginDto } from './dto/personnel-admin-login.dto'
import { PersonnelAdmin } from '../personnel-admin/entities/personnel-admin.entity'
import {
  LineSignInDto,
  LineTokenDto,
  PersonnelBindLineDto,
} from './dto/personnel-line.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly administorService: AdminService,
    private readonly personnelService: PersonnelService,
    private readonly personnelAdminService: PersonnelAdminService,
  ) {}

  @Post('/personnel/sign-in')
  async authenticationPersonnel(
    @Body() personnelLoginDto: PersonnelLoginDto,
  ): Promise<
    ResponseModel<{
      token: AuthTokenModel
      user: Partial<Personnel>
      mustChangePassword: boolean
    }>
  > {
    try {
      const personnel = await this.personnelService.verifyPersonnel(
        personnelLoginDto.username,
        personnelLoginDto.password,
      )

      const accessToken = await this.authService.getNewToken({
        id: personnel.id,
      })

      delete (personnel as any).password

      return {
        data: {
          token: accessToken,
          user: personnel,
          mustChangePassword: !personnel.isChangePassword,
        },
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

  @Post('/personnel-admin/sign-in')
  async authenticationPersonnelAdmin(
    @Body() personnelAdminLoginDto: PersonnelAdminLoginDto,
  ): Promise<
    ResponseModel<{
      token: AuthTokenModel
      user: Partial<PersonnelAdmin>
    }>
  > {
    try {
      personnelAdminLoginDto.username =
        personnelAdminLoginDto.username.toLowerCase()
      const personnelAdmin =
        await this.personnelAdminService.getPersonnelAdminByUsernameAndPassword(
          personnelAdminLoginDto,
        )

      const accessToken = await this.authService.getNewToken({
        id: personnelAdmin.id,
      })

      delete personnelAdmin.password

      return {
        data: { token: accessToken, user: personnelAdmin },
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

  // ---------- Personnel LINE login ----------

  // แลก code ที่ LINE redirect กลับมาเป็น profile (secret อยู่ BE)
  @Post('/personnel/line-token')
  async lineToken(
    @Body() dto: LineTokenDto,
  ): Promise<ResponseModel<{ lineUserId: string; displayName: string; pictureUrl?: string }>> {
    try {
      const profile = await this.authService.exchangeLineCode(dto.code)
      return { data: profile }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // login ด้วย lineUserId — ไม่เจอ = ยังไม่ผูก (bound: false → FE ให้กรอก form ผูกบัญชี)
  @Post('/personnel/line-sign-in')
  async lineSignIn(
    @Body() dto: LineSignInDto,
  ): Promise<
    ResponseModel<
      | { bound: true; token: AuthTokenModel; user: Partial<Personnel>; mustChangePassword: boolean }
      | { bound: false }
    >
  > {
    try {
      const personnel = await this.personnelService.findByLineUserId(
        dto.lineUserId,
      )

      if (!personnel) {
        return { data: { bound: false } }
      }

      const accessToken = await this.authService.getNewToken({
        id: personnel.id,
      })

      delete (personnel as any).password

      return {
        data: {
          bound: true,
          token: accessToken,
          user: personnel,
          mustChangePassword: !personnel.isChangePassword,
        },
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

  // ผูก LINE ครั้งแรก — verify username/password แล้ว save lineUserId + ออก token
  @Post('/personnel/bind-line')
  async bindLine(
    @Body() dto: PersonnelBindLineDto,
  ): Promise<
    ResponseModel<{ token: AuthTokenModel; user: Partial<Personnel>; mustChangePassword: boolean }>
  > {
    try {
      const personnel = await this.personnelService.bindLineByCredentials(
        dto.username,
        dto.password,
        dto.lineUserId,
      )

      const accessToken = await this.authService.getNewToken({
        id: personnel.id,
      })

      delete (personnel as any).password

      return {
        data: {
          token: accessToken,
          user: personnel,
          mustChangePassword: !personnel.isChangePassword,
        },
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
