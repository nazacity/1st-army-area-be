import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

export const ImageFileInterceptor = FileInterceptor('image', {
  fileFilter: (req: any, image: any, callback: any) => {
    if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png') {
      return callback(
        new HttpException(
          {
            message: 'Invalid file type',
          },
          HttpStatus.BAD_REQUEST,
        ),
        false,
      )
    }

    callback(null, true)
  },
})

export class ImagesFileInterceptor {
  static validateImages(images: Express.Multer.File[]): void {
    for (const image of images) {
      if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png') {
        throw new Error('Invalid file type')
      }

      for (const item of images) {
        if (image !== item) {
          if (Buffer.compare(image.buffer, item.buffer) === 0) {
            throw new Error('Duplicate file')
          }
        }
      }
    }
  }
}

export const CustomFileInterceptor = FileInterceptor('doc', {
  fileFilter: (req: any, files: any, callback: any) => {
    const allowMimeType = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'video/mp4',
    ]
    if (!allowMimeType.includes(files.mimetype)) {
      return callback(
        new HttpException(
          {
            message: 'Invalid file type',
          },
          HttpStatus.BAD_REQUEST,
        ),
        false,
      )
    }

    callback(null, true)
  },
})

export class CustomFilesInterceptor {
  static validateFiles(files: Express.Multer.File[]): void {
    const allowMimeType = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'video/mp4',
    ]
    for (const file of files) {
      if (!allowMimeType.includes(file.mimetype)) {
        throw new Error('Invalid file type')
      }
      const convertToMB = Math.floor(file.size / Math.pow(1024, 2))
      if (convertToMB > 10) throw new Error('File is larger than 10 MB')

      for (const item of files) {
        if (file !== item) {
          if (Buffer.compare(file.buffer, item.buffer) === 0) {
            throw new Error('Duplicate file')
          }
        }
      }
    }
  }
}

export const ExcelFileInterceptor = FileInterceptor('file', {
  fileFilter: (req: any, file: any, callback: any) => {
    if (
      file.mimetype !==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
      file.mimetype !== 'application/vnd.ms-excel'
    ) {
      return callback(
        new HttpException(
          {
            message: 'File type must be xlsx!',
          },
          HttpStatus.BAD_REQUEST,
        ),
        false,
      )
    }

    callback(null, true)
  },
})

export enum EMimeType {
  TXT = 'text/plain',
  EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  EXCEL2 = 'application/vnd.ms-excel',
  ZIP = 'application/x-zip-compressed',
  PDF = 'application/pdf',
}

export const FileInterceptorWithType = (...fileType: EMimeType[]) => {
  return FileInterceptor('file', {
    fileFilter: (req: any, file: any, callback: any) => {
      if (!fileType.includes(file.mimetype)) {
        return callback(
          new BadRequestException(
            `File type must ${fileType.length < 2 ? 'be' : 'in'} ${fileType}!`,
          ),
          false,
        )
      }
      callback(null, true)
    },
  })
}
