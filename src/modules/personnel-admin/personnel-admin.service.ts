import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Like, Repository } from 'typeorm'
import { Crypto } from 'src/utils/crypto'
import {
  PersonnelAdminCreateDto,
  PersonnelAdminQueryDto,
  PersonnelAdminUpdateDto,
} from './dto/personnel-admin.dto'
import {
  PersonnelAdmin,
  PersonnelAdminRole,
} from './entities/personnel-admin.entity'

@Injectable()
export class PersonnelAdminService {
  private readonly logger = new Logger(PersonnelAdminService.name)
  constructor(
    @InjectRepository(PersonnelAdmin)
    private readonly personnelAdminRepository: Repository<PersonnelAdmin>,
  ) {}

  async getPersonnelAdmins(query?: PersonnelAdminQueryDto): Promise<{
    personnelAdmins: PersonnelAdmin[]
    total: number
  }> {
    this.logger.log('get-personnel-admins')
    try {
      const where: any = {
        isDeleted: false,
      }

      if (query?.searchText) {
        where.firstName = Like(`%${query.searchText}%`)
      }

      const take = query?.take ? Number(query.take) : 10
      const page = query?.page ? Number(query.page) : 1
      const skip = take === -1 ? undefined : (page - 1) * take

      const [personnelAdmins, total] =
        await this.personnelAdminRepository.findAndCount({
          where,
          order: {
            createdAt: 'DESC',
          },
          ...(skip !== undefined && { skip, take }),
        })

      return { personnelAdmins, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getPersonnelAdminById(id: string): Promise<PersonnelAdmin> {
    this.logger.log('get-personnel-admin-by-id')
    try {
      return await this.personnelAdminRepository.findOne({
        where: {
          id,
          isDeleted: false,
        },
      })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getPersonnelAdminByUsernameAndPassword({
    username,
    password,
  }: {
    username: string
    password: string
  }): Promise<PersonnelAdmin> {
    this.logger.log('get-personnel-admin-by-username-and-password')
    try {
      return await this.verifyPersonnelAdmin({ username, password })
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createPersonnelAdmin(
    personnelAdminCreateDto: PersonnelAdminCreateDto,
  ): Promise<PersonnelAdmin> {
    this.logger.log('create-personnel-admin')
    try {
      const password = await Crypto.hash(personnelAdminCreateDto.password)

      const createdPersonnelAdmin = this.personnelAdminRepository.create({
        ...personnelAdminCreateDto,
        password,
      })

      return await this.personnelAdminRepository.save(createdPersonnelAdmin)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updatePersonnelAdmin({
    personnelAdminId,
    personnelAdminUpdateDto,
  }: {
    personnelAdminId: string
    personnelAdminUpdateDto: PersonnelAdminUpdateDto
  }): Promise<PersonnelAdmin> {
    this.logger.log('update-personnel-admin-by-id')
    try {
      const personnelAdmin = await this.personnelAdminRepository.findOne({
        where: {
          id: personnelAdminId,
          isDeleted: false,
        },
      })

      if (!personnelAdmin) throw new Error('Personnel admin is not found')

      if (personnelAdminUpdateDto.password) {
        personnelAdminUpdateDto.password = await Crypto.hash(
          personnelAdminUpdateDto.password,
        )
      }

      const updatedPersonnelAdmin = {
        ...personnelAdmin,
        ...personnelAdminUpdateDto,
      }

      return await this.personnelAdminRepository.save(updatedPersonnelAdmin)
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deletePersonnelAdmin({
    personnelAdminId,
  }: {
    personnelAdminId: string
  }): Promise<PersonnelAdmin> {
    this.logger.log('delete-personnel-admin-by-id')
    try {
      const personnelAdmin = await this.personnelAdminRepository.findOne({
        where: {
          id: personnelAdminId,
        },
      })

      if (!personnelAdmin) throw new Error('Personnel admin is not found')

      if (personnelAdmin.role === PersonnelAdminRole.SUPER_ADMIN) {
        const superCount = await this.personnelAdminRepository.count({
          where: {
            role: PersonnelAdminRole.SUPER_ADMIN,
            isDeleted: false,
          },
        })
        if (superCount <= 1) {
          throw new Error('ไม่สามารถลบ super_admin คนสุดท้ายได้')
        }
      }

      return await this.personnelAdminRepository.save({
        ...personnelAdmin,
        isDeleted: true,
      })
    } catch (error) {
      this.logger.error(error)
      throw new Error(error)
    }
  }

  async verifyPersonnelAdmin({
    username,
    password,
  }: {
    username: string
    password: string
  }): Promise<PersonnelAdmin> {
    if (!username || !password) {
      throw new Error('Verify failed')
    }

    const personnelAdmin = await this.getPersonnelAdminByUsername(username)
    if (
      !personnelAdmin ||
      !personnelAdmin.isActive ||
      !Crypto.compare(password, personnelAdmin.password)
    ) {
      throw new Error('Verify failed')
    }

    return personnelAdmin
  }

  async getPersonnelAdminByUsername(username: string): Promise<PersonnelAdmin> {
    if (!username) {
      throw new Error('Invalid username')
    }
    return await this.personnelAdminRepository.findOne({
      where: {
        username: username.toLowerCase(),
        isDeleted: false,
      },
    })
  }
}
