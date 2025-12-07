import { Admin } from 'src/modules/admin/entities/admin.entity'
import { User } from 'src/modules/user/entities/user.entity'

export class RequestClinicUserModel {
  user: User
}

export class RequestAdminUserModel {
  user: Admin
}
