import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ResourceUploadUrl, ResourceUrl } from 'src/model/response.model'
import { S3Utils } from 'src/utils/s3'
import { fixFileName } from 'src/utils/file-interceptor'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as dayjs from 'dayjs'

@Injectable()
export class CavaryR2Service {
  constructor(private configService: ConfigService) {}

  private getPrefix() {
    return 'CAVARY_R2'
  }

  private createS3Client() {
    const prefix = this.getPrefix()
    return new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>(`${prefix}_ACCESS_KEY`),
        secretAccessKey: this.configService.get<string>(
          `${prefix}_SECRET_ACCESS_KEY`,
        ),
      },
      endpoint: `https://${this.configService.get<string>(
        `${prefix}_ACCOUNT_ID`,
      )}.r2.cloudflarestorage.com`,
      region: 'auto',
    })
  }

  private getBucketName() {
    return this.configService.get<string>(`${this.getPrefix()}_BUCKET_NAME`)
  }

  private getResourceDomain() {
    return this.configService.get<string>(`${this.getPrefix()}_RESOURCE_DOMAIN`)
  }

  async uploadImage(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = this.createS3Client()
    try {
      const originalName = fixFileName(file.originalname)
      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        originalName,
      )}`

      const Key = `images/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: fileName,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadUnitUserImage(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = this.createS3Client()
    try {
      const originalName = fixFileName(file.originalname)
      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        originalName,
      )}`

      const Key = `unit-user/image/${dayjs().format('YYYY')}/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: fileName,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
        fileType: file.mimetype,
        fileSize: file.size,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadNotUnitUserImage(
    file: Express.Multer.File,
  ): Promise<ResourceUrl> {
    const s3 = this.createS3Client()
    try {
      const originalName = fixFileName(file.originalname)
      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        originalName,
      )}`

      const Key = `not-unit-user/image/${dayjs().format('YYYY')}/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: fileName,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
        fileType: file.mimetype,
        fileSize: file.size,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadUnitUserDoc(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = this.createS3Client()
    try {
      const originalName = fixFileName(file.originalname)
      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        originalName,
      )}`
      const Key = `unit-user/doc/${dayjs().format('YYYY')}/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: originalName,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
        fileType: file.mimetype,
        fileSize: file.size,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadNotUnitUserDoc(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = this.createS3Client()
    try {
      const ext = file.mimetype?.split('/')[1] || 'bin'
      const originalName = fixFileName(file.originalname) || `document.${ext}`
      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        originalName,
      )}`
      const Key = `not-unit-user/doc/${dayjs().format('YYYY')}/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: originalName,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
        fileType: file.mimetype,
        fileSize: file.size,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadCar(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = this.createS3Client()
    try {
      const originalName = fixFileName(file.originalname)
      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        originalName,
      )}`
      const Key = `car/${dayjs().format('YYYY')}/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: originalName,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
        fileType: file.mimetype,
        fileSize: file.size,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadDoc(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = this.createS3Client()
    try {
      const originalName = fixFileName(file.originalname)
      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        originalName,
      )}`
      const Key = `docs/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: originalName,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
        fileType: file.mimetype,
        fileSize: file.size,
      }
    } catch (error) {
      throw error
    }
  }

  async getPresignedUrlUploadImage(
    filename: string,
  ): Promise<ResourceUploadUrl> {
    try {
      const s3 = this.createS3Client()

      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        filename,
      )}`
      const Key = `images/${fileName}`

      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: this.getBucketName(),
          Key,
        }),
        { expiresIn: 15 },
      )

      return {
        uploadUrl,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }

  async getPresignedUrlUploadDoc(filename: string): Promise<ResourceUploadUrl> {
    try {
      const s3 = this.createS3Client()

      const fileName = `${new Date().getTime()}-${S3Utils.sanitizeFileName(
        filename,
      )}`

      const Key = `docs/${fileName}`

      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: this.getBucketName(),
          Key,
        }),
        { expiresIn: 15 },
      )

      return {
        uploadUrl,
        resourceUrl: `${this.getResourceDomain()}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }
}
