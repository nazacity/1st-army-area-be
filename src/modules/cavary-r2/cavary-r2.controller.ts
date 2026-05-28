import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { ResourceUrl, ResponseModel } from 'src/model/response.model'
import {
  CustomFileInterceptor,
  ImageFileInterceptor,
} from 'src/utils/file-interceptor'
import { CavaryUploadDocDto, CavaryUploadImageDto } from './dto/cavary-r2.dto'
import { CavaryR2Service } from './cavary-r2.service'

@ApiTags('Cavary R2')
@Controller('cavary-r2')
export class CavaryR2Controller {
  constructor(private readonly cavaryR2Service: CavaryR2Service) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CavaryUploadImageDto,
    description: '#### Only 1 image is allow',
  })
  @UseInterceptors(ImageFileInterceptor)
  @Post('/image')
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.cavaryR2Service.uploadImage(image)
    return { data }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CavaryUploadImageDto,
    description: '#### Only 1 image is allow',
  })
  @UseInterceptors(ImageFileInterceptor)
  @Post('/unit-user/image')
  async uploadUnitUserImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.cavaryR2Service.uploadUnitUserImage(image)
    return { data }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CavaryUploadImageDto,
    description: '#### Only 1 image is allow',
  })
  @UseInterceptors(ImageFileInterceptor)
  @Post('/not-unit-user/image')
  async uploadNotUnitUserImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.cavaryR2Service.uploadNotUnitUserImage(image)
    return { data }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CavaryUploadDocDto,
    description: '#### Only 1 doc is allow',
  })
  @UseInterceptors(CustomFileInterceptor)
  @Post('/unit-user/doc')
  async uploadUnitUserDoc(
    @UploadedFile() doc: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.cavaryR2Service.uploadUnitUserDoc(doc)
    return { data }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CavaryUploadDocDto,
    description: '#### Only 1 doc is allow',
  })
  @UseInterceptors(CustomFileInterceptor)
  @Post('/not-unit-user/doc')
  async uploadNotUnitUserDoc(
    @UploadedFile() doc: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.cavaryR2Service.uploadNotUnitUserDoc(doc)
    return { data }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CavaryUploadImageDto,
    description: '#### Only 1 image is allow',
  })
  @UseInterceptors(ImageFileInterceptor)
  @Post('/car')
  async uploadCar(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.cavaryR2Service.uploadCar(image)
    return { data }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CavaryUploadDocDto,
    description: '#### Only 1 doc is allow',
  })
  @UseInterceptors(CustomFileInterceptor)
  @Post('/doc')
  async uploadDoc(
    @UploadedFile() doc: Express.Multer.File,
  ): Promise<ResponseModel<ResourceUrl>> {
    const data = await this.cavaryR2Service.uploadDoc(doc)
    return { data }
  }
}
