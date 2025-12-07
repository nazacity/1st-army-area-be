import dayjs from 'dayjs'
import { Like, MoreThanOrEqual, Raw } from 'typeorm'

export class BuildFilterObject {
  static build<T extends Record<string, any>>(filter: T) {
    const stringArray = ['name', 'email', 'telno']
    const searchBeforeDate = ['endDate', 'expiryDate']
    const searchAfterDate = ['startDate', 'createdAt', 'updatedAt']
    const filterObject = {} as { [K in keyof T]: any }
    for (const key in filter) {
      if (key === 'password') {
        continue
      }
      if (filter[key] || filter[key] === 0) {
        if (stringArray.some((value) => key.toLowerCase().includes(value))) {
          filterObject[key] = Like(`%${filter[key]}%`)
          continue
        }
        if (searchBeforeDate.some((value) => key.includes(value))) {
          filterObject[key] = Raw(
            (key) => `(${key} <= :date OR ${key} IS NULL)`,
            {
              date: dayjs(filter[key]).add(1, 'days'),
            },
          )
          continue
        }
        if (searchAfterDate.some((value) => key.includes(value))) {
          filterObject[key] = MoreThanOrEqual(filter[key])
          continue
        }

        filterObject[key] = filter[key]
      }
    }
    return filterObject
  }
}
