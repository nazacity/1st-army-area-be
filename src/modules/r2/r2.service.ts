import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ResourceUploadUrl, ResourceUrl } from 'src/model/response.model'
import { S3Utils } from 'src/utils/s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as dayjs from 'dayjs'

@Injectable()
export class R2Service {
  constructor(private configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
      endpoint: `https://${this.configService.get<string>(
        'R2_ACCOUNT_ID',
      )}.r2.cloudflarestorage.com`,
      region: 'auto',
    })
    try {
      const fileName = `${new Date().getTime()}-${S3Utils.removeWhiteSpace(
        file.originalname,
      )}`

      const Key = `images/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
        Key,
        Body: file.buffer,
        Metadata: {
          'file-name': file.originalname,
          'mime-type': file.mimetype,
        },
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: fileName,
        resourceUrl: `${this.configService.get<string>(
          'R2_RESOURCE_DOMAIN',
        )}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
      endpoint: `https://${this.configService.get<string>(
        'R2_ACCOUNT_ID',
      )}.r2.cloudflarestorage.com`,
      region: 'auto',
    })
    try {
      const fileName = `${new Date().getTime()}-${S3Utils.removeWhiteSpace(
        file.originalname,
      )}`

      const Key = `profile/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
        Key,
        Body: file.buffer,
        Metadata: {
          'file-name': file.originalname,
          'mime-type': file.mimetype,
        },
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: fileName,
        resourceUrl: `${this.configService.get<string>(
          'R2_RESOURCE_DOMAIN',
        )}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadScoreImage(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
      endpoint: `https://${this.configService.get<string>(
        'R2_ACCOUNT_ID',
      )}.r2.cloudflarestorage.com`,
      region: 'auto',
    })
    try {
      const fileName = `${new Date().getTime()}-${S3Utils.removeWhiteSpace(
        file.originalname,
      )}`

      const Key = `score/${dayjs().format('MM-YYYY')}/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
        Key,
        Body: file.buffer,
        Metadata: {
          'file-name': file.originalname,
          'mime-type': file.mimetype,
        },
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: fileName,
        resourceUrl: `${this.configService.get<string>(
          'R2_RESOURCE_DOMAIN',
        )}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<ResourceUrl> {
    const s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      },
      endpoint: `https://${this.configService.get<string>(
        'R2_ACCOUNT_ID',
      )}.r2.cloudflarestorage.com`,
      region: 'auto',
    })
    try {
      const fileName = `${new Date().getTime()}-${S3Utils.removeWhiteSpace(
        file.originalname,
      )}`
      const Key = `files/${fileName}`
      const putObjectCommand = new PutObjectCommand({
        Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
        Key,
        Body: file.buffer,
        Metadata: {
          'file-name': file.originalname,
          'mime-type': file.mimetype,
        },
        ACL: 'public-read',
      })

      await s3.send(putObjectCommand)

      return {
        fileName: file.originalname,
        resourceUrl: `${this.configService.get<string>(
          'R2_RESOURCE_DOMAIN',
        )}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }

  async getPresignedUrlUploadImage(
    filename: string,
  ): Promise<ResourceUploadUrl> {
    try {
      const s3 = new S3Client({
        credentials: {
          accessKeyId: this.configService.get<string>('R2_ACCESS_KEY'),
          secretAccessKey: this.configService.get<string>(
            'R2_SECRET_ACCESS_KEY',
          ),
        },
        endpoint: `https://${this.configService.get<string>(
          'R2_ACCOUNT_ID',
        )}.r2.cloudflarestorage.com`,
        region: 'auto',
      })

      const fileName = `${new Date().getTime()}-${S3Utils.removeWhiteSpace(
        filename,
      )}`
      const Key = `images/${fileName}`

      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
          Key,
        }),
        { expiresIn: 15 },
      )

      return {
        uploadUrl,
        resourceUrl: `${this.configService.get<string>(
          'R2_RESOURCE_DOMAIN',
        )}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }

  async getPresignedUrlUploadDoc(
    filename: string,
  ): Promise<Promise<ResourceUploadUrl>> {
    try {
      const s3 = new S3Client({
        credentials: {
          accessKeyId: this.configService.get<string>('R2_ACCESS_KEY'),
          secretAccessKey: this.configService.get<string>(
            'R2_SECRET_ACCESS_KEY',
          ),
        },
        endpoint: `https://${this.configService.get<string>(
          'R2_ACCOUNT_ID',
        )}.r2.cloudflarestorage.com`,
        region: 'auto',
      })

      const fileName = `${new Date().getTime()}-${S3Utils.removeWhiteSpace(
        filename,
      )}`

      const Key = `docs/${fileName}`

      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
          Key,
        }),
        { expiresIn: 15 },
      )

      return {
        uploadUrl,
        resourceUrl: `${this.configService.get<string>(
          'R2_RESOURCE_DOMAIN',
        )}/${Key}`,
      }
    } catch (error) {
      throw error
    }
  }
}
