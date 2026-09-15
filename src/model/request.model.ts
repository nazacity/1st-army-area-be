import { Admin } from 'src/modules/admin/entities/admin.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { Personnel } from 'src/modules/personnel/entities/personnel.entity'

export class RequestClinicUserModel {
  user: User
}

export class RequestAdminUserModel {
  user: Admin
}

export class RequestPersonnelModel {
  user: Personnel
}
