import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Crypto } from 'src/utils/crypto'
import { Repository } from 'typeorm'
import { AdminCreateDto } from './dto/admin.dto'
import { Admin } from './entities/admin.entity'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async getAdmins(): Promise<{
    admins: Admin[]
    total: number
  }> {
    this.logger.log('get-clinic-administors')
    try {
      const [admins, total] = await this.adminRepository.findAndCount({
        where: {
          isDeleted: false,
        },
        order: {
          createdAt: 'DESC',
        },
      })

      return { admins, total }
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAdminById(clinicId: string): Promise<Admin> {
    this.logger.log('get-admin-by-id')
    try {
      const clinic = await this.adminRepository.findOne({
        where: {
          id: clinicId,
          isDeleted: false,
        },
      })

      return clinic
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async getAdminByUsernameAndPassword({
    username,
    password,
  }: {
    username: string
    password: string
  }): Promise<Admin> {
    this.logger.log('get-admin-by-username-and-password')
    try {
      const Admin = await this.verifyAdmin({
        username,
        password,
      })

      return Admin
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async createAdmin(adminCreateDto: AdminCreateDto): Promise<Admin> {
    this.logger.log('create-admin-by-id')
    try {
      const password = await Crypto.hash(adminCreateDto.password)
      adminCreateDto.password = password
      const createdClinic = await this.adminRepository.create(adminCreateDto)

      const savedClinic = await this.adminRepository.save(createdClinic)

      return savedClinic
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async updateAdmin({
    adminId,
    adminUpdateDto,
  }: {
    adminId: string
    adminUpdateDto: Admin
  }): Promise<Admin> {
    this.logger.log('update-admin-by-id')
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: adminId,
        },
      })

      if (admin) throw new Error('Admin is not found')

      const updatedAdmin = {
        ...admin,
        ...adminUpdateDto,
      }

      const savedAdmin = await this.adminRepository.save(updatedAdmin)

      return savedAdmin
    } catch (error) {
      this.logger.debug(error)
      throw new Error(error)
    }
  }

  async deleteAdmin({ adminId }: { adminId: string }): Promise<Admin> {
    this.logger.log('delete-admin-by-id')
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: adminId,
        },
      })

      if (!admin) throw new Error('Admin is not found')

      const updatedAdmin = {
        ...admin,
        isDeleted: true,
      }

      const savedAdmin = await this.adminRepository.save(updatedAdmin)

      return savedAdmin
    } catch (error) {
      this.logger.error(error)
      throw new Error(error)
    }
  }

  async verifyAdmin({
    username,
    password,
  }: {
    username: string
    password: string
  }): Promise<Admin> {
    if (!username || !password) {
      throw new Error('Verify failed')
    }

    const Admin = await this.getAdminByUsername(username)
    if (!Admin || !Crypto.compare(password, Admin.password)) {
      throw new Error('Verify failed')
    }

    return Admin
  }

  async getAdminByUsername(username: string): Promise<Admin> {
    if (!username) {
      throw new Error('Invalid username')
    }
    const Admin = await this.adminRepository.findOne({
      where: {
        username: username,
        isDeleted: false,
      },
    })
    return Admin
  }
}
