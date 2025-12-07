import * as xlsx from 'xlsx'
import * as _ from 'lodash'
import { Logger } from '@nestjs/common'

const logger: Logger = new Logger('ConvertExcelToJson')
export const convertExcelToJson = <T>(
  excelFile: Express.Multer.File,
  sheetIndex: number,
): Promise<T[][]> => {
  try {
    if (_.isNil(excelFile)) {
      return Promise.reject(`File should not be EMPTY`)
    }

    const wb = xlsx.read(excelFile.buffer)
    const wsname = wb.SheetNames[sheetIndex]
    const ws = wb.Sheets[wsname]
    const data: T[][] = xlsx.utils.sheet_to_json(ws, { header: 1 })
    return Promise.resolve(data)
  } catch (e) {
    logger.error(e)
    return Promise.reject(e)
  }
}
