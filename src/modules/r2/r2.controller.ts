import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  ResourceUploadUrl,
  ResourceUrl,
  ResponseModel,
} from 'src/model/response.model'
import {
  CustomFileInterceptor,
  ImageFileInterceptor,
} from 'src/utils/file-interceptor'
import { GetUploadUrlDto, UploadDocDto, UploadImageDto } from './dto/r2.dto'
import { R2Service } from './r2.service'

@ApiTags('R2')
@Controller('r2')
export class R2Controller {
  constructor(private readonly r2Service: R2Service) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadImageDto,
    description: '#### Only 1 image is allow',
  })
  @UseInterceptors(ImageFileInterceptor)
  @Post('/image')
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.r2Service.uploadImage(image)

    return {
      data,
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadImageDto,
    description: '#### Only 1 image is allow',
  })
  @UseInterceptors(ImageFileInterceptor)
  @Post('/profile-image')
  async uploadProfileImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.r2Service.uploadProfileImage(image)

    return {
      data,
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadImageDto,
    description: '#### Only 1 image is allow',
  })
  @UseInterceptors(ImageFileInterceptor)
  @Post('/score-image')
  async uploadScoreImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    console.log(image)

    const data = await this.r2Service.uploadScoreImage(image)

    return {
      data,
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadDocDto,
    description: '#### Only 1 doc is allow',
  })
  @UseInterceptors(CustomFileInterceptor)
  @Post('/doc')
  async uploadDoc(
    @UploadedFile() doc: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    // const data = await this.r2Service.uploadFile(doc)

    return {
      data: null,
    }
  }

  @Post('/get-upload-image-url')
  async getUrlUploadImage(
    @Body() body: GetUploadUrlDto,
  ): Promise<ResponseModel<ResourceUploadUrl>> {
    // const data = await this.r2Service.getPresignedUrlUploadImage(body.filename)

    return {
      data: null,
    }
  }

  @Post('/get-upload-doc-url')
  async getUrlUploadDoc(
    @Body() body: GetUploadUrlDto,
  ): Promise<ResponseModel<ResourceUploadUrl>> {
    // const data = await this.r2Service.getPresignedUrlUploadDoc(body.filename)

    return {
      data: null,
    }
  }
}
