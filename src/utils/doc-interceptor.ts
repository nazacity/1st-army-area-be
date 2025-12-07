import { HttpException, HttpStatus } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

export const DocFileInterceptor = FileInterceptor('doc', {
  fileFilter: (req: any, doc: any, callback: any) => {
    const allowMimeType = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowMimeType.includes(doc.mimetype)) {
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

export class DocsFileInterceptor {
  static validateDocs(docs: Express.Multer.File[]): void {
    const allowMimeType = ['image/jpeg', 'image/png', 'application/pdf']
    for (const doc of docs) {
      if (!allowMimeType.includes(doc.mimetype)) {
        throw new Error('Invalid file type')
      }

      for (const item of docs) {
        if (doc !== item) {
          if (Buffer.compare(doc.buffer, item.buffer) === 0) {
            throw new Error('Duplicate file')
          }
        }
      }
    }
  }
}
